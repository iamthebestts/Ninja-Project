import { createCommand } from "#base";
import { settings } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";

createCommand({
  name: "ajuda",
  description: "Mostra informações sobre o bot e seus comandos",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    const mainEmbed = createEmbed({
      color: settings.colors.primary,
      description: brBuilder(
        "# 🎮 Ninja Project",
        "Bem-vindo ao mundo ninja! Colecione cards dos seus personagens favoritos do universo Naruto,",
        "participe de desafios, construa seu deck e torne-se o ninja mais poderoso!",
        "",
        "## 📱 Comandos Disponíveis",
        "",
        "### 🎴 Sistema de Cards",
        `• </cards list:0> - Explore todos os cards disponíveis`,
        `• </cards info:0> - Detalhes e estatísticas de um card específico`,
        `• </cards comprar:0> - Adquira cards para sua coleção`,
        `• </cards vender:0> - Venda cards do seu inventário por ryos`,
        "",
        "### 📦 Sistema de Caixas",
        `• </caixas info:0> - Descubra os tipos de caixas e suas raridades`,
        `• </caixas comprar:0> - Abra caixas misteriosas com cards aleatórios`,
        "",
        "### 👤 Perfil e Inventário",
        `• </user ver:0> - Visualize seu perfil ou de outro ninja`,
        `• </user inventario:0> - Confira sua coleção de cards`,
        "",
        "### ⭐ Sistema de Ranks",
        `• </rank info:0> - Conheça os ranks disponíveis e benefícios`,
        `• </rank upar:0> - Evolua seu rank ninja`,
        "",
        "## 💎 Recursos do Jogo",
        "",
        "### 💰 Ryos (Moeda)",
        "• Ganhe ryos participando do </quiz:0>",
        "• Use para comprar cards e caixas",
        "• Obtenha ryos vendendo cards duplicados",
        "",
        "### 📦 Caixas Especiais",
        "• Caixas com diferentes níveis de raridade",
        "• Cards exclusivos em cada tipo de caixa",
        "• Quantidade surpresa de cards por abertura",
        "",
        "### 🎴 Coleção de Cards",
        "• Cards com raridades únicas",
        "• Personagens com habilidades especiais",
        "• Sistema de troca e venda entre ninjas",
        "• Construa sua coleção definitiva!"
      ),
      footer: {
        text: "Ninja Project • Desenvolvido por Baline Apps",
        iconURL: interaction.guild.iconURL(),
      },
    });

    await interaction.reply({
      embeds: [mainEmbed],
    });
  },
});
