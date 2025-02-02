import { createCommand } from "#base";
import { cardEditSchema, CardInterface, cardValidationSchema, db, HydratedUserDocument } from "#database";
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
                { name: "Normal (N)", value: "N" },
                { name: "Raro (R)", value: "R" },
                { name: "Super Raro (SR)", value: "SR" },
                { name: "Super Raro Especial (SSR)", value: "SSR" },
                { name: "Ultra Raro (UR)", value: "UR" }
              ],
            },
            {
              name: "imagem",
              description: "Link da imagem do personagem",
              type: ApplicationCommandOptionType.String,
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
        {
          name: "editar",
          description: "Edita os atributos de um card",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "nome",
              description: "Nome do card a ser editado",
              type: ApplicationCommandOptionType.String,
              required: true,
              autocomplete: true,
            },
            {
              name: "força",
              description: "Força do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: false,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "velocidade",
              description: "Velocidade do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: false,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "inteligência",
              description: "Inteligência do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: false,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "chakra",
              description: "Controle de chakra do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: false,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "ninjutsu",
              description: "Ninjutsu do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: false,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "genjutsu",
              description: "Genjutsu do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: false,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "taijutsu",
              description: "Taijutsu do ninja (1-100)",
              type: ApplicationCommandOptionType.Integer,
              required: false,
              minValue: 1,
              maxValue: 100,
            },
            {
              name: "preço",
              description: "Preço do card",
              type: ApplicationCommandOptionType.Integer,
              required: false,
              minValue: 1,
            },
            {
              name: "descrição",
              description: "Descrição do card",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
        {
          name: "deletar",
          description: "Deleta um card do sistema permanentemente",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "nome",
              description: "Nome do card para deletar",
              type: ApplicationCommandOptionType.String,
              required: true,
              autocomplete: true,
            },
          ],
        },
      ],
    },
  ],
  async autocomplete(interaction) {
    const { options } = interaction;
    const focused = options.getFocused(true);

    if (focused.name === "card" || focused.name === "nome") {
      const search = focused.value.toLowerCase();
      const subcommand = options.getSubcommand();

      // Para os comandos deletar e editar, mostrar todos os cards
      if (subcommand === "deletar" || subcommand === "editar") {
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

      // Para outros comandos, verificar cards do usuário
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
    if (
      group === "ryos" ||
      (group === "cards" && subcommand !== "criar" && subcommand !== "editar" && subcommand !== "deletar")
    ) {
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
      const data = {
        name: options.getString("nome", true),
        rarity: options.getString("raridade", true),
        image: options.getString("imagem", true),
        description: options.getString("descrição") || undefined,
        village: options.getString("vila", true),
        rank: options.getString("rank", true),
        clan: options.getString("clã", true),
        strength: options.getInteger("força", true),
        speed: options.getInteger("velocidade", true),
        intelligence: options.getInteger("inteligência", true),
        chakraControl: options.getInteger("chakra", true),
        ninjutsu: options.getInteger("ninjutsu", true),
        genjutsu: options.getInteger("genjutsu", true),
        taijutsu: options.getInteger("taijutsu", true),
        price: options.getInteger("preço", true),
      };

      // Validar dados
      const result = cardValidationSchema.safeParse(data);
      
      if (!result.success) {
        const errors = result.error.errors.map((err: any) => `• ${err.message}`).join("\n");
        return interaction.reply(
          res.danger(`${icon.danger} Dados inválidos:\n${errors}`)
        );
      }

      // Verificar se o card já existe
      const existingCard = await db.cards.getCardByName(data.name);
      if (existingCard) {
        return interaction.reply(
          res.danger(`Já existe um card com o nome **${data.name}**!`)
        );
      }

      // Criar o card com os dados validados
      const card = await db.cards.create({
        ...result.data,
        chakraType: [],
        specialAbilities: [],
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
          card.description ? `\n**Descrição 📜:** ${card.description}` : ""
        ),
        image: card.image,
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Comando editar card
    if (group === "cards" && subcommand === "editar") {
      const cardName = options.getString("nome", true);
      const card = await db.cards.getCardByName(cardName);

      if (!card) {
        return interaction.reply(
          res.danger(`${icon.danger} Card não encontrado!`)
        );
      }

      const data = {
        strength: options.getInteger("força") ?? undefined,
        speed: options.getInteger("velocidade") ?? undefined,
        intelligence: options.getInteger("inteligência") ?? undefined,
        chakraControl: options.getInteger("chakra") ?? undefined,
        ninjutsu: options.getInteger("ninjutsu") ?? undefined,
        genjutsu: options.getInteger("genjutsu") ?? undefined,
        taijutsu: options.getInteger("taijutsu") ?? undefined,
        price: options.getInteger("preço") ?? undefined,
        description: options.getString("descrição") ?? undefined,
      };

      // Validar dados
      const result = cardEditSchema.safeParse(data);
      
      if (!result.success) {
        const errors = result.error.errors.map((err: any) => `• ${err.message}`).join("\n");
        return interaction.reply(
          res.danger(`${icon.danger} Dados inválidos:\n${errors}`)
        );
      }

      // Atualizar apenas os campos fornecidos
      Object.assign(card, result.data);
      await card.save();

      const embed = createEmbed({
        color: settings.colors.success,
        description: brBuilder(
          `## ${icon.success} Card Atualizado`,
          `**Card:** ${card.name}`,
          ...Object.entries(result.data).map(([key, value]) => 
            `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`
          )
        ),
        thumbnail: card.image,
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Comando deletar card
    if (group === "cards" && subcommand === "deletar") {
      const cardName = options.getString("nome", true);
      const card = await db.cards.findOne({ name: cardName });

      if (!card) {
        return interaction.reply(
          res.danger(`${icon.danger} Card não encontrado!`)
        );
      }

      // Encontrar todos os usuários que possuem este card
      const users = await db.users.find();
      const affectedUsers = [];
      
      // Remover o card de cada usuário que o possui
      for (const user of users) {
        const inventory = await (user as HydratedUserDocument).getInventory();
        if (inventory.some((c: CardInterface) => c.id === card.id)) {
          await (user as HydratedUserDocument).removeCard(card.id);
          affectedUsers.push(user);
        }
      }

      // Deletar o card do sistema
      await db.cards.findByIdAndDelete(card.id);

      const embed = createEmbed({
        color: settings.colors.danger,
        description: brBuilder(
          `## ${icon.success} Card Deletado`,
          `**Nome:** ${card.name}`,
          `**Raridade:** ${card.rarity}`,
          `**Usuários afetados:** ${affectedUsers.length}`,
        ),
        thumbnail: card.image,
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
