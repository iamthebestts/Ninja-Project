import { createCommand } from "#base";
import { db } from "#database";
import { icon, res } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    PermissionFlagsBits,
} from "discord.js";

createCommand({
  name: "admin",
  description: "[ADMIN] Comandos administrativos",
  type: ApplicationCommandType.ChatInput,
  defaultMemberPermissions: PermissionFlagsBits.Administrator,
  options: [
    {
      name: "ryos",
      description: "Gerencia ryos de um usuário",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "dar",
          description: "Adiciona ryos a um usuário",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "usuario",
              description: "Usuário que receberá os ryos",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "quantidade",
              description: "Quantidade de ryos",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
            },
          ],
        },
        {
          name: "remover",
          description: "Remove ryos de um usuário",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "usuario",
              description: "Usuário que perderá os ryos",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "quantidade",
              description: "Quantidade de ryos",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
            },
          ],
        },
      ],
    },
    {
      name: "rank",
      description: "Define o rank de um usuário",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "usuario",
          description: "Usuário para alterar o rank",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "rank",
          description: "Novo rank do usuário",
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: "Genin", value: "Genin" },
            { name: "Chunin", value: "Chunin" },
            { name: "Jounin", value: "Jounin" },
            { name: "Ninja", value: "Ninja" },
          ],
        },
      ],
    },
    {
      name: "cards",
      description: "Gerencia cards de um usuário",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "dar",
          description: "Adiciona um card ao usuário",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "usuario",
              description: "Usuário que receberá o card",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "card",
              description: "Nome do card",
              type: ApplicationCommandOptionType.String,
              required: true,
              autocomplete: true,
            },
          ],
        },
        {
          name: "remover",
          description: "Remove um card do usuário",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "usuario",
              description: "Usuário que perderá o card",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "card",
              description: "Nome do card",
              type: ApplicationCommandOptionType.String,
              required: true,
              autocomplete: true,
            },
          ],
        },
        {
          name: "criar",
          description: "Cria um novo card no sistema",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "nome",
              description: "Nome do personagem",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "raridade",
              description: "Raridade do card",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                { name: "Comum", value: "Comum" },
                { name: "Incomum", value: "Incomum" },
                { name: "Raro", value: "Raro" },
                { name: "Ultra Raro", value: "Ultra Raro" },
                { name: "Lendário", value: "Lendário" },
              ],
            },
            {
              name: "imagem",
              description: "Imagem do personagem",
              type: ApplicationCommandOptionType.Attachment,
              required: true,
            },
            {
              name: "vila",
              description: "Vila do ninja",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                { name: "Konoha", value: "Konoha" },
                { name: "Suna", value: "Suna" },
                { name: "Kiri", value: "Kiri" },
                { name: "Iwa", value: "Iwa" },
                { name: "Kumo", value: "Kumo" },
              ],
            },
            {
              name: "rank",
              description: "Rank do ninja",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                { name: "Genin", value: "Genin" },
                { name: "Chunin", value: "Chunin" },
                { name: "Jounin", value: "Jounin" },
                { name: "ANBU", value: "ANBU" },
                { name: "Kage", value: "Kage" },
              ],
            },
            {
              name: "clã",
              description: "Clã do ninja",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "força",
              description: "Força do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "velocidade",
              description: "Velocidade do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "inteligência",
              description: "Inteligência do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "chakra",
              description: "Controle de chakra do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "ninjutsu",
              description: "Ninjutsu do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "genjutsu",
              description: "Genjutsu do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "taijutsu",
              description: "Taijutsu do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "preço",
              description: "Preço do card",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
            },
            {
              name: "descrição",
              description: "Descrição do card (opcional)",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
      ],
    },
  ],
  async autocomplete(interaction) {
    const { options } = interaction;
    const focused = options.getFocused(true);

    if (focused.name === "card") {
      const search = focused.value.toLowerCase();
      const subcommand = options.getSubcommand();
      const userId = options.get("usuario")?.value as string;

      if (!userId) {
        return interaction.respond([]);
      }

      const user = await db.users.get(userId);
      if (!user) {
        return interaction.respond([]);
      }

      if (subcommand === "remover") {
        const userCards = await user.searchCards(search);
        return interaction.respond(
          userCards.map((card) => ({
            name: `${card.name} - ${card.rarity}`,
            value: card.name,
          }))
        );
      } else {
        const cards = await db.cards
          .find({
            name: { $regex: search, $options: "i" },
          })
          .limit(25);

        return interaction.respond(
          cards.map((card) => ({
            name: `${card.name} - ${card.rarity}`,
            value: card.name,
          }))
        );
      }
    }
  },
  async run(interaction) {
    const { options } = interaction;
    const group = options.getSubcommandGroup();
    const subcommand = options.getSubcommand();

    // Só pegar o usuário se for um comando que precisa dele
    if (group === "ryos" || (group === "cards" && subcommand !== "criar")) {
      const targetUser = options.getUser("usuario", true);
      const user = await db.users.get(targetUser.id);

      if (!user) {
        return interaction.reply(res.danger("Usuário não encontrado!"));
      }

      if (group === "ryos") {
        const amount = options.getInteger("quantidade", true);

        if (subcommand === "dar") {
          await user.addRyos(amount);
          const embed = createEmbed({
            color: settings.colors.success,
            description: brBuilder(
              `## ${icon.success} Ryos adicionados!`,
              `**Usuário:** ${targetUser}`,
              `**Quantidade:** ${amount}`,
              `**Total atual:** ${user.ryos}`
            ),
          });
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === "remover") {
          if (user.ryos < amount) {
            return interaction.reply(
              res.danger(
                `${icon.danger} O usuário só possui ${user.ryos}, você não pode remover mais ryos do que o usuário tem!`
              )
            );
          }
          await user.removeRyos(amount);
          const embed = createEmbed({
            color: settings.colors.success,
            description: brBuilder(
              "## Ryos removidos! 💸",
              `**Usuário:** ${targetUser}`,
              `**Quantidade:** ${amount} 💰`,
              `**Total atual:** ${user.ryos} 💎`
            ),
          });
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }

      if (
        group === "cards" &&
        (subcommand === "dar" || subcommand === "remover")
      ) {
        const cardName = options.getString("card", true);
        const card = await db.cards.getCardByName(cardName);

        if (!card) {
          return interaction.reply(
            res.danger(`${icon.danger} Card não encontrado!`)
          );
        }

        if (subcommand === "dar") {
          // Verificar se o usuário já tem o card
          const inventory = await user.getInventory();
          const hasCard = inventory.some((userCard) => userCard.id === card.id);

          if (hasCard) {
            return interaction.reply(
              res.danger(
                `${icon.danger} ${targetUser} já possui o card **${card.name}**!`
              )
            );
          }

          await user.addCard(card.id);
          const embed = createEmbed({
            color: settings.colors.success,
            description: brBuilder(
              `## ${icon.success} Card Adicionado`,
              `**Usuário:** ${targetUser}`,
              `**Card:** ${card.name}`,
              `**Raridade:** ${card.rarity}`
            ),
            thumbnail: card.image,
          });
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === "remover") {
          await user.removeCard(card.id);
          const embed = createEmbed({
            color: settings.colors.success,
            description: brBuilder(
              `## ${icon.danger} Card Removido`,
              `**Usuário:** ${targetUser}`,
              `**Card:** ${card.name}`,
              `**Raridade:** ${card.rarity}`
            ),
            thumbnail: card.image,
          });
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    }

    // Comando criar card não precisa de usuário
    if (group === "cards" && subcommand === "criar") {
      const name = options.getString("nome", true);
      const rarity = options.getString("raridade", true);
      const image = options.getAttachment("imagem", true);
      const village = options.getString("vila", true);
      const rank = options.getString("rank", true);
      const clan = options.getString("clã", true);
      const price = options.getInteger("preço", true);
      const description = options.getString("descrição");

      // Verificar se o card já existe
      const existingCard = await db.cards.getCardByName(name);
      if (existingCard) {
        return interaction.reply(
          res.danger(`Já existe um card com o nome **${name}**!`)
        );
      }

      // Verificar se a imagem é válida
      if (!image.contentType?.startsWith("image/")) {
        return interaction.reply(
          res.danger("O arquivo enviado não é uma imagem válida!")
        );
      }

      // Criar o card com os atributos fornecidos
      const card = await db.cards.create({
        name,
        rarity,
        image: image.url,
        description: description || `Um ninja da vila de ${village}`,
        village,
        rank,
        clan,
        strength: options.getInteger("força", true),
        speed: options.getInteger("velocidade", true),
        intelligence: options.getInteger("inteligência", true),
        chakraControl: options.getInteger("chakra", true),
        ninjutsu: options.getInteger("ninjutsu", true),
        genjutsu: options.getInteger("genjutsu", true),
        taijutsu: options.getInteger("taijutsu", true),
        price,
        chakraType: [], // Default vazio
        specialAbilities: [], // Default vazio
      });

      const embed = createEmbed({
        color: settings.colors.success,
        description: brBuilder(
          `## ${icon.success} Card criado com sucesso! 🎉`,
          `**Nome:** ${card.name} 🥷`,
          `**Raridade:** ${card.rarity} ✨`,
          `**Vila:** ${card.village} 🏡`,
          `**Rank:** ${card.rank} 📈`,
          `**Clã:** ${card.clan} 🩸`,
          `**Preço:** ${card.price} Ryōs 💰`,
          "",
          `**Atributos 💪:**`,
          `Força: ${card.strength} 🏋️`,
          `Velocidade: ${card.speed} 💨`,
          `Inteligência: ${card.intelligence} 🧠`,
          `Chakra: ${card.chakraControl} 🌀`,
          `Ninjutsu: ${card.ninjutsu} 🍥`,
          `Genjutsu: ${card.genjutsu} 👁️`,
          `Taijutsu: ${card.taijutsu} 👊`,
          description ? `\n**Descrição 📜:** ${description}` : ""
        ),
        image: card.image,
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Comando rank precisa de usuário
    if (subcommand === "rank") {
      const targetUser = options.getUser("usuario", true);
      const user = await db.users.get(targetUser.id);

      if (!user) {
        return interaction.reply(res.danger("Usuário não encontrado!"));
      }

      const newRank = options.getString("rank", true) as any;
      user.rank = newRank;
      await user.save();

      const embed = createEmbed({
        color: settings.colors.success,
        description: brBuilder(
          `## ${icon.success} Rank alterado! 🎉
          **Usuário:** ${targetUser}
          **Novo Rank:** ${newRank} 📈`
        ),
      });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    return;
  },
});
