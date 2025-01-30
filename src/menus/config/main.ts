import { CardInterface, db, Rank } from "#database";
import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import {
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    TextChannel,
} from "discord.js";

// Funções auxiliares modificadas
const progressBar = (percentage: number) =>
  "▰".repeat(Math.floor(percentage / 10)) +
  "▱".repeat(10 - Math.floor(percentage / 10));

const getRankIcon = (rank: Rank) => {
  switch (rank) {
    case "Jounin":
      return "🔥";
    case "Chunin":
      return "⚔️";
    case "Genin":
      return "🌱";
    default:
      return "👤";
  }
};

export async function showConfigMenu(
  interaction: ChatInputCommandInteraction | ButtonInteraction
) {
  const embed = createEmbed({
    color: settings.colors.primary,
    title: "⚙️ Configurações do Servidor",
    description: brBuilder(
      "Selecione uma opção abaixo para configurar:",
      "",
      "📊 **Rankings** - Configure os canais de rankings",
      "⬅️ **Voltar** - Retorna ao menu anterior"
    ),
  });

  const row = createRow(
    new ButtonBuilder({
      customId: "config/rankings",
      label: "Rankings",
      emoji: "📊",
      style: ButtonStyle.Primary,
    }),
    new ButtonBuilder({
      customId: "config/back",
      label: "Voltar",
      emoji: "⬅️",
      style: ButtonStyle.Secondary,
    })
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

export async function showRankingsConfig(
  interaction: ChatInputCommandInteraction | ButtonInteraction
) {
  const embed = createEmbed({
    color: settings.colors.primary,
    title: "📊 Configuração de Rankings",
    description: brBuilder(
      "Configure os canais onde serão exibidos os rankings:",
      "",
      "💰 **Top Ryos** - Ranking de riqueza",
      "🎴 **Top Cartas** - Ranking de colecionadores",
      "📚 **Top Quiz** - Ranking de conhecimento"
    ),
  });

  const row = createRow(
    new ButtonBuilder({
      customId: "select/ryos/channel",
      label: "Canal Ryos",
      style: ButtonStyle.Primary,
    }),
    new ButtonBuilder({
      customId: "select/cards/channel",
      label: "Canal Cartas",
      style: ButtonStyle.Primary,
    }),
    new ButtonBuilder({
      customId: "select/quiz/channel",
      label: "Canal Quiz",
      style: ButtonStyle.Primary,
    }),
    new ButtonBuilder({
      customId: "config/main",
      label: "Voltar",
      style: ButtonStyle.Secondary,
    })
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

export async function updateRankings(client: Client) {
  const servers = await db.server.find();

  for (const server of servers) {
    const [_, ryosStats, cardsStats, quizStats] = await Promise.all([
      db.users.countDocuments(),
      db.users.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$ryos" },
            max: { $max: "$ryos" },
          },
        },
      ]),
      db.users.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: { $size: "$cards" } },
            max: { $max: { $size: "$cards" } },
          },
        },
      ]),
      db.users.aggregate([
        {
          $group: {
            _id: null,
            correct: { $sum: "$quizStats.correct" },
            total: { $sum: "$quizStats.total" },
          },
        },
      ]),
    ]);

    // Função genérica para atualizar rankings
    const updateRankingChannel = async (
      type: "ryos" | "cards" | "quiz",
      title: string,
      thumbnail: string,
      color: number,
      getDescription: (users: any[], stats: any) => string
    ) => {
      const channel = server.getRankChannel(type);
      if (!channel) {
        return;
      }

      const users = await db.users
        .find()
        .sort({ [type === "quiz" ? "quizStats.correct" : type]: -1 })
        .limit(10)
        .populate(type === "cards" ? "cards" : "");

      const stats = {
        ryos: ryosStats[0] || { total: 0, max: 1 },
        cards: cardsStats[0] || { total: 0, max: 1 },
        quiz: quizStats[0] || { correct: 0, total: 1 },
      }[type];

      const embed = createEmbed({
        color,
        title,
        thumbnail: { url: thumbnail },
        description: getDescription(users, stats),
        footer: {
          text: `🔄 Atualizado em ${new Date().toLocaleString("pt-BR")}`,
          iconURL: client.guilds.cache.first()?.iconURL() || undefined,
        },
      });

      await updateChannelRanking(server, channel, embed, client);
    };

    // Atualizar todos os rankings
    await Promise.all([
      updateRankingChannel(
        "ryos",
        "🏦 Classificação dos Magnatas",
        "https://cdn3.emoji.gg/emojis/6789-gold-stack.png",
        0xffd700,
        (users, stats) =>
          brBuilder(
            "🏆 **Top 10 Ricos do Servidor**",
            ...users.map(
              (user, index) =>
                `${index + 1}. ${getRankIcon(user.rank)} <@${
                  user.id
                }> » **${user.ryos.toLocaleString("pt-BR")} ryos**\n` +
                `   ${progressBar((user.ryos / stats.max) * 100)} ${Math.round(
                  (user.ryos / stats.max) * 100
                )}%`
            ),
            `💰 **Economia total:** ${stats.total.toLocaleString("pt-BR")} ryos`
          )
      ),

      updateRankingChannel(
        "cards",
        "🃏 Mestres Colecionadores",
        "https://cdn3.emoji.gg/emojis/5989-naruto-card.png",
        0x9b59b6,
        (users, stats) =>
          brBuilder(
            "🏅 **Top 10 Colecionadores**",
            ...users.map((user, index) => {
              const unique = new Set(
                user.cards.map((c: CardInterface) => c.name)
              ).size;
              return (
                `${index + 1}. ${getRankIcon(user.rank)} <@${user.id}> » **${
                  user.cards.length
                } cartas**\n` +
                `   🎴 ${unique} únicas » ${progressBar(
                  (user.cards.length / stats.max) * 100
                )} ${Math.round((user.cards.length / stats.max) * 100)}%`
              );
            }),
            `📚 **Acervo total:** ${stats.total.toLocaleString("pt-BR")} cartas`
          )
      ),

      updateRankingChannel(
        "quiz",
        "🧠 Gênios do Quiz",
        "https://cdn3.emoji.gg/emojis/4553_books.png",
        0x3498db,
        (users, stats) =>
          brBuilder(
            "🏅 **Top 10 Conhecimento Ninja**",
            ...users.map((user, index) => {
              const winRate = Math.round(
                (user.quizStats.correct / (user.quizStats.total || 1)) * 100
              );
              return (
                `${index + 1}. ${getRankIcon(user.rank)} <@${user.id}> » **${
                  user.quizStats.correct
                } acertos**\n` +
                `   ✅ ${winRate}% precisão » ${progressBar(winRate)}`
              );
            }),
            `📝 **Total de respostas:** ${stats.total.toLocaleString("pt-BR")}`
          )
      ),
    ]);
  }
}

async function updateChannelRanking(
  server: any,
  channelConfig: any,
  embed: any,
  client: Client
) {
  try {
    const channel = (await client.channels.fetch(
      channelConfig.channelId
    )) as TextChannel;
    if (!channel) {
      console.error(`Canal ${channelConfig.channelId} não encontrado!`);
      channelConfig.messageId = null;
      await server.save();
      return;
    }

    // Verificar e atualizar todas as mensagens de ranking no canal
    const existingMessages = await channel.messages.fetch({ limit: 100 });
    const serverRankMessages = existingMessages.filter((msg) =>
      server.rankChannels.some((rc: any) => rc.messageId === msg.id)
    );

    // Atualizar mensagem existente do tipo específico
    if (channelConfig.messageId) {
      try {
        const message = await channel.messages.fetch(channelConfig.messageId);
        await message.edit({ embeds: [embed] });
        return;
      } catch (error) {
        console.log(
          `Mensagem ${channelConfig.messageId} não encontrada, verificando duplicatas...`
        );
        channelConfig.messageId = null;
      }
    }

    // Verificar se já existe mensagem do mesmo tipo
    const duplicateMessage = serverRankMessages.find(
      (msg) => msg.embeds[0]?.title === embed.data.title
    );

    if (duplicateMessage) {
      // Atualizar mensagem duplicada existente
      await duplicateMessage.edit({ embeds: [embed] });
      channelConfig.messageId = duplicateMessage.id;
      await server.save();
      return;
    }

    // Limpar mensagens antigas do mesmo tipo se exceder o limite
    if (serverRankMessages.size >= 3) {
      const messagesToDelete = serverRankMessages.first(
        serverRankMessages.size - 2
      );
      await channel.bulkDelete(messagesToDelete);
    }

    // Enviar nova mensagem
    const message = await channel.send({ embeds: [embed] });
    channelConfig.messageId = message.id;
    await server.save();
  } catch (error) {
    console.error("Erro ao atualizar ranking:", error);
    channelConfig.messageId = null;
    await server.save();
  }
}
