import { createCommand } from "#base";
import { db } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    AutocompleteInteraction,
    bold,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
} from "discord.js";

createCommand({
  name: "cards",
  description: "Sistema de cards do Naruto",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "list",
      description: "Visualiza a lista de cards",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "info",
      description: "Visualiza as informações de um card",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "name",
          description: "Nome do card para visualizar",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    },
    {
      name: "comprar",
      description: "Compra um card para seu inventário",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "nome",
          description: "Nome do card para comprar",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    },
    {
      name: "vender",
      description: "Vende um card do seu inventário",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "nome",
          description: "Nome do card para vender",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    }
  ],
  async autocomplete(interaction: AutocompleteInteraction) {
    const { options, user } = interaction;
    const subcommand = options.getSubcommand();
    const focused = options.getFocused(true);

    if (subcommand === "info" && focused.name === "name") {
      const search = focused.value;
      const userDB = await db.users.get(user.id);
      const cards = await userDB.searchCards(search, 25);

      await interaction.respond(
        cards.map((card) => ({
          name: card.name,
          value: card.name,
        }))
      );
    }

    if (subcommand === "comprar" && focused.name === "nome") {
      const search = focused.value.toLowerCase();
      const cards = await db.cards
        .find({
          name: { $regex: search, $options: "i" },
        })
        .limit(25);

      await interaction.respond(
        cards.map((card) => ({
          name: card.name,
          value: card.name,
        }))
      );
    }

    if (subcommand === "vender" && focused.name === "nome") {
      const search = focused.value.toLowerCase();
      const user = await db.users.get(interaction.user.id);

      if (!user) {
        return interaction.respond([]);
      }

      // Buscar apenas os cards que o usuário possui
      const userCards = await db.cards
        .find({
          _id: { $in: user.cards },
          name: { $regex: search, $options: "i" },
        })
        .limit(25);

      await interaction.respond(
        userCards.map((card) => ({
          name: card.name,
          value: card.name,
        }))
      );
    }
  },
  async run(interaction) {
    const { options, member } = interaction;
    const subcommand = options.getSubcommand();

    if (subcommand === "adicionar") {
      if (!member) {
        return interaction.reply({
          content: "Não foi possível verificar suas permissões!",
          flags,
        });
      }

      // Verificar se é admin
      if (
        !member ||
        typeof member.permissions === "string" ||
        !member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        return interaction.reply({
          content: "Apenas administradores podem adicionar cards!",
          flags,
        });
      }

      const name = options.getString("nome", true);
      const rarity = options.getString("raridade", true);
      const image = options.getAttachment("imagem", true);
      const village = options.getString("vila", true);
      const rank = options.getString("rank", true);
      const clan = options.getString("clã", true);
      const price = options.getInteger("preço", true);

      // Verificar se o card já existe
      const existingCard = await db.cards.getCardByName(name);
      if (existingCard) {
        return interaction.reply({
          content: "Já existe um card com este nome!",
          flags,
        });
      }

      // Verificar se a imagem é válida
      if (!image.contentType?.startsWith("image/")) {
        return interaction.reply({
          content: "O arquivo enviado não é uma imagem válida!",
          flags,
        });
      }

      // Criar o card com valores padrão para atributos
      const card = await db.cards.createCard({
        name,
        rarity,
        image: image.url,
        description: `Um ninja da vila de ${village}`,
        village,
        rank,
        clan,
        chakraType: [],
        strength: 50,
        speed: 50,
        intelligence: 50,
        chakraControl: 50,
        ninjutsu: 50,
        genjutsu: 50,
        taijutsu: 50,
        specialAbilities: [],
        price,
      });

      const embed = createEmbed({
        color: settings.colors.success,
        title: `${icon.success} Card Criado com Sucesso!`,
        thumbnail: { url: card.image },
        fields: [
          { name: "Nome", value: card.name, inline: true },
          { name: "Raridade", value: card.rarity, inline: true },
          { name: "Vila", value: card.village, inline: true },
          { name: "Rank", value: card.rank, inline: true },
          { name: "Clã", value: card.clan, inline: true },
          { name: "Preço", value: `${card.price} coins`, inline: true },
        ],
      });

      return interaction.reply({ embeds: [embed], flags });
    }

    if (subcommand === "list") {
      const cards = await db.cards.find().lean();

      // Enviar a mensagem inicial com a primeira página
      return interaction.reply({
        ...menus.cards.view({
          currentPage: 1,
          totalCards: cards.length,
          cards,
        }),
        fetchReply: true,
      });
    }

    if (subcommand === "info") {
      const name = options.getString("name", true);
      const card = await db.cards.findOne({ name }).lean();

      if (!card) {
        return interaction.reply({
          content: "Card não encontrado!",
          flags,
        });
      }

      const embed = createEmbed({
        color: settings.colors.primary,
        title: card.name,
        image: card.image,
        fields: [
          { name: "Raridade", value: card.rarity, inline: true },
          { name: "Vila", value: card.village, inline: true },
          { name: "Rank", value: card.rank, inline: true },
          { name: "Clã", value: card.clan, inline: true },
          { name: "Preço", value: `${card.price} coins`, inline: true },
        ],
      });

      return interaction.reply({ embeds: [embed], flags });
    }

    if (subcommand === "comprar") {
      await interaction.deferReply({ flags });

      const cardName = options.getString("nome", true);
      const card = await db.cards.getCardByName(cardName);

      if (!card) {
        return interaction.editReply({
          content: "❌ Card não encontrado!",
        });
      }

      const user = await db.users.get(interaction.user.id);
      if (!user) {
        return interaction.editReply({
          content: "❌ Usuário não encontrado!",
        });
      }

      // Verificar se o usuário já tem o card
      const hasCard = user.cards.some((c) => c.toString() === card.id);
      if (hasCard) {
        return interaction.editReply({
          content: "❌ Você já possui este card!",
        });
      }

      const embed = createEmbed({
        color: settings.colors.default,
        image: card.image,
        description: brBuilder(
          `## ${card.name} - ${
            card.rarity.split("")[0].toUpperCase() + card.rarity.slice(1)
          }`,
          bold(card.description),
          "",
          `**Preço:** ${icon.Ryo} ${card.price}`,
          `**Seus Ryos:** ${icon.Ryo} ${user.ryos}`
        ),
        fields: [
          {
            name: "⚔️ Atributos",
            value: [
              `**• 💪 Força:** ${card.strength || "N/A"}`,
              `**• 🏃‍♂️ Velocidade:** ${card.speed || "N/A"}`,
              `**• 🧠 Inteligência:** ${card.intelligence || "N/A"}`,
              `**• 🌀 Controle de Chakra:** ${card.chakraControl || "N/A"}`,
              `**• 🥷 Ninjutsu:** ${card.ninjutsu || "N/A"}`,
              `**• 🔮 Genjutsu:** ${card.genjutsu || "N/A"}`,
              `**• 🥋 Taijutsu:** ${card.taijutsu || "N/A"}`,
            ].join("\n"),
            inline: true,
          },
          {
            name: "📚 Informações",
            value: [
              `**• 🏴 Clã:** ${card.clan || "N/A"}`,
              `**• 🏞️ Vila:** ${card.village || "N/A"}`,
              `**• ⭐ Rank:** ${card.rank || "N/A"}`,
              `**• 🔥 Tipo de Chakra:** ${
                card.chakraType?.join(", ") || "N/A"
              }`,
            ].join("\n"),
            inline: true,
          },
          {
            name: "✨ Habilidades Especiais",
            value:
              card.specialAbilities
                ?.map((ability) => `• 🎯 ${ability}`)
                .join("\n") || "🎯 Nenhuma habilidade especial",
            inline: false,
          },
        ],
      });

      // Criar botão de compra

      const row = createRow(
        new ButtonBuilder({
          customId: `cards/buy/${card.id}`,
          label: `Comprar`,
          emoji: icon.Ryo,
          style: ButtonStyle.Success,
          disabled: user.ryos < card.price,
        })
      );

      return interaction.editReply({
        embeds: [embed],
        components: [row],
      });
    }

    if (subcommand === "vender") {
      await interaction.deferReply({ flags });

      const cardName = options.getString("nome", true);
      const user = await db.users.get(interaction.user.id);

      if (!user) {
        return interaction.editReply({
          content: "❌ Usuário não encontrado!",
        });
      }

      const card = await db.cards.getCardByName(cardName);
      if (!card) {
        return interaction.editReply(
          res.danger(`${icon.danger} Card não encontrado!`)
        );
      }

      // Verificar se o usuário tem o card
      const hasCard = user.cards.some((c) => c.toString() === card.id);
      if (!hasCard) {
        return interaction.editReply(
          res.danger(`${icon.danger} Você não possui este card!`)
        );
      }

      // Calcular valor de venda (metade do preço)
      const sellPrice = Math.floor(card.price / 2);

      const embed = createEmbed({
        color: settings.colors.default,
        image: card.image,
        description: brBuilder(
          `## ${icon.Ryo} Vender Card`,
          `Você está prestes a vender o card ${card.name} por ${icon.Ryo} ${sellPrice}.`,
          "",
          `**Valor recebido:** ${icon.Ryo} ${sellPrice} (50% do valor original)`,
          `**Ryos atuais:** ${icon.Ryo} ${user.ryos}`,
          "",
          `**Deseja continuar com a venda?**`
        ),
        footer: {
          text: "Ninja Project",
          iconURL: interaction.guild.iconURL(),
        },
      });

      const row = createRow(
        new ButtonBuilder({
          customId: `cards/sell/${card.id}`,
          label: `Vender`,
          style: ButtonStyle.Danger,
        })
      );

      return interaction.editReply({
        embeds: [embed],
        components: [row],
      });
    }
    return;
  },
});
