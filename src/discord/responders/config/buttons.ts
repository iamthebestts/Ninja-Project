import { createResponder, ResponderType } from "#base";
import { db } from "#database";
import { menus } from "#menus";
import { createRow } from "@magicyan/discord";
import { ChannelSelectMenuBuilder, ChannelType, TextChannel } from "discord.js";

createResponder({
  customId: "config/:action",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction, { action }) {
    switch (action) {
      case "rankings":
        await menus.config.showRanking(interaction);
        break;
      case "back":
        await menus.config.showConfig(interaction);
        break;
    }
  },
});

createResponder({
  customId: "rankings/:channel",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction, { channel }) {
    if (!interaction.guild) {
      return;
    }

    // Resposta inicial
    await interaction.reply({
      content: "Por favor, mencione o canal onde deseja exibir o ranking",
      ephemeral: true,
    });

    // Coletar menção do canal
    const filter = (m: any) =>
      m.author.id === interaction.user.id && m.mentions.channels.size > 0;

    try {
      const collected = await interaction.channel?.awaitMessages({
        filter,
        max: 1,
        time: 30000,
      });

      if (!collected?.size) {
        return interaction.editReply("Tempo esgotado! Tente novamente.");
      }

      const mentionedChannel = collected
        .first()
        ?.mentions.channels.first() as TextChannel;

      if (
        !mentionedChannel ||
        mentionedChannel.type !== ChannelType.GuildText
      ) {
        return interaction.editReply(
          "Por favor, selecione um canal de texto válido!"
        );
      }

      // Atualizar configuração
      const config = await db.server.get(interaction.guild.id);
      config.rankChannels = config.rankChannels.filter(
        (rc) => rc.type !== channel
      );
      config.rankChannels.push({
        channelId: mentionedChannel.id,
        type: channel as "ryos" | "cards" | "quiz",
      });
      await config.save();

      await interaction.editReply(
        `✅ Ranking de ${channel} configurado em ${mentionedChannel}!`
      );
    } catch (error) {
      console.error("Erro na configuração de ranking:", error);
      await interaction.editReply(
        "❌ Ocorreu um erro ao configurar o ranking!"
      );
    }
    return;
  },
});

createResponder({
  customId: "select/:type/channel",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction, { type }) {
    if (!interaction.guild) {
      return;
    }

    const menu = new ChannelSelectMenuBuilder()
      .setCustomId(`config/channel/${type}`)
      .setPlaceholder("Selecione um canal")
      .setChannelTypes(ChannelType.GuildText);

    await interaction.reply({
      content: `📌 Selecione o canal para o ranking de ${type}:`,
      components: [createRow(menu)],
      ephemeral: true,
    });
  },
});

createResponder({
  customId: "config/channel/:type",
  types: [ResponderType.ChannelSelect],
  cache: "cached",
  async run(interaction, { type }) {
    if (!interaction.guild) {
      return;
    }

    // Deferir a interação imediatamente
    await interaction.deferUpdate();

    const channel = interaction.channels.first();
    if (!(channel instanceof TextChannel)) {
      return interaction.followUp({
        content: "⚠️ Por favor, selecione um canal de texto válido!",
        ephemeral: true,
      });
    }

    try {
      const config = await db.server.get(interaction.guild.id);
      await config.setRankChannel(
        channel.id,
        type as "ryos" | "cards" | "quiz"
      );

      // Atualizar resposta original
      await interaction.editReply({
        content: `✅ Canal de ranking de ${type} configurado em ${channel}!`,
        components: [],
      });

      // Atualizar rankings
      await menus.config.updateRankings(interaction.client);
    } catch (error) {
      console.error("Erro ao configurar canal:", error);
      await interaction.followUp({
        content: "❌ Falha ao configurar o canal de ranking!",
        ephemeral: true,
      });
    }
    return;
  },
});
