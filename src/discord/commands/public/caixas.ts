import { createCommand } from "#base";
import { CardInterface, db, HydratedUserDocument } from "#database";
import { icon, res } from "#functions";
import { boxes, settings, type BoxType } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ColorResolvable,
} from "discord.js";

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getRandomCards(
  rarity: string,
  amount: number,
  user: HydratedUserDocument
) {
  // Buscar todos os cards da raridade específica
  const availableCards = await db.cards.find({ rarity });
  
  // Obter inventário do usuário
  const inventory = await user.getInventory();
  const userCardIds = inventory.map((card: CardInterface) => card.id);

  // Filtrar cards que o usuário não tem
  const newCards = availableCards.filter(
    (card) => !userCardIds.includes(card.id)
  );

  // Embaralhar array
  const shuffled = newCards.sort(() => Math.random() - 0.5);

  // Retornar a quantidade desejada ou todos disponíveis
  return shuffled.slice(0, Math.min(amount, shuffled.length));
}

createCommand({
  name: "caixas",
  description: "Sistema de caixas de cards",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "info",
      description: "Veja informações sobre as caixas disponíveis",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "comprar",
      description: "Compre uma caixa de cards",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "tipo",
          description: "Tipo da caixa",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: Object.entries(boxes).map(([value, data]) => ({
            name: data.name,
            value,
          })),
        },
      ],
    },
  ],
  async run(interaction) {
    const { options } = interaction;
    const subcommand = options.getSubcommand();

    if (subcommand === "info") {
      const embed = createEmbed({
        color: settings.colors.primary,
        title: `📦 Caixas de Cards`,
        description: brBuilder(
          "Compre caixas e receba cards aleatórios!",
          "A raridade da caixa determina a raridade do card que você receberá.",
          "",
          "**Caixas disponíveis:**"
        ),
        fields: Object.entries(boxes).map(([_, data]) => ({
          name: `${data.emoji} ${data.name}`,
          value: brBuilder(
            data.description,
            `Preço: ${icon.Ryo} ${data.price}`
          ),
          inline: true,
        })),
      });

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === "comprar") {
      await interaction.deferReply({ flags });

      const boxType = options.getString("tipo", true) as BoxType;
      const box = boxes[boxType];

      const user = await db.users.get(interaction.user.id);

      if (user.ryos < box.price) {
        return interaction.editReply(
          res.danger(
            `${icon.danger} Você não tem ${icon.Ryo} Ryos suficientes! Necessário: ${box.price}`
          )
        );
      }

      // Determinar quantidade aleatória de cards
      const cardAmount = getRandomInt(box.minCards, box.maxCards);

      // Pegar cards aleatórios não duplicados
      const cards = await getRandomCards(
        box.cardRarity,
        cardAmount,
        user
      );

      if (cards.length === 0) {
        return interaction.editReply(
          res.danger(
            `${icon.danger} Não há mais cards do tipo **${box.cardName}** disponíveis para você colecionar!`
          )
        );
      }

      // Remover ryos e adicionar cards
      await user.removeRyos(box.price);
      for (const card of cards) {
        await user.addCard(card.id);
      }

      // Criar embed principal
      const mainEmbed = createEmbed({
        color: box.color as ColorResolvable,
        description: brBuilder(
          `## ${box.emoji} Caixa aberta com sucesso!`,
          `Você recebeu ${cards.length} card${cards.length > 1 ? "s" : ""}!`,
          "",
          `**Ryos gastos:** ${icon.Ryo} ${box.price}`,
          `**Ryos restantes:** ${icon.Ryo} ${user.ryos}`,
          "",
          "**Cards recebidos:**"
        ),
      });

      // Criar embeds para cada card
      const cardEmbeds = cards.map((card) =>
        createEmbed({
          color: box.color as ColorResolvable,
          title: `${card.name}`,
          thumbnail: card.image,
          description: brBuilder(
            `## 🗂️ ${card.name} • ${card.rarity}`,
            `📖 **Descrição:** ${card.description}`,
            "",
            "📋 **Informações Básicas**",
            `🏷️ **Vila:** ${card.village}`,
            `📜 **Rank:** ${card.rank}`,
            `⚔️ **Clã:** ${card.clan}`,
            `${icon.Ryo} **Preço:** ${card.price} coins`,
            "",
            "📊 **Atributos Principais**",
            `💪 Força: ${"▰".repeat(
              Math.floor(card.strength / 10)
            )}${"▱".repeat(10 - Math.floor(card.strength / 10))} ${
              card.strength
            }/100`,
            `⚡ Velocidade: ${"▰".repeat(
              Math.floor(card.speed / 10)
            )}${"▱".repeat(10 - Math.floor(card.speed / 10))} ${
              card.speed
            }/100`,
            `🧠 Inteligência: ${"▰".repeat(
              Math.floor(card.intelligence / 10)
            )}${"▱".repeat(10 - Math.floor(card.intelligence / 10))} ${
              card.intelligence
            }/100`,
            "",
            "🌀 **Atributos de Chakra**",
            `🌪️ Controle: ${card.chakraControl}/100`,
            `🔮 Ninjutsu: ${card.ninjutsu}/100`,
            `👁️ Genjutsu: ${card.genjutsu}/100`,
            `👊 Taijutsu: ${card.taijutsu}/100`,
            "",
            card.chakraType.length > 0
              ? `🌈 **Tipos de Chakra:**\n${card.chakraType
                  .map((t) => `• ${t}`)
                  .join("\n")}`
              : "",
            card.specialAbilities.length > 0
              ? `✨ **Habilidades Especiais:**\n${card.specialAbilities
                  .map((a) => `• ${a}`)
                  .join("\n")}`
              : ""
          ),
        })
      );

      return interaction.editReply({
        embeds: [mainEmbed, ...cardEmbeds],
      });
    }
    return;
  },
});
