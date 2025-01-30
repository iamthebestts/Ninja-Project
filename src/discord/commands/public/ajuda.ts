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
        "## 🎮 Ninja Project",
        "Um bot de coleção de cards do universo Naruto!",
        "Colecione cards, abra caixas, compre, venda e muito mais!",
        "",
        "### 📜 Comandos Principais",
        "",
        "**Cards**",
        `- </cards list:0> - Lista todos os cards disponíveis`,
        `- </cards info:0> - Mostra informações detalhadas de um card`,
        `- </cards comprar:0> - Compra um card específico`,
        `- </cards vender:0> - Vende um card do seu inventário`,
        "",
        "**Caixas**",
        `- </caixas info:0> - Mostra informações sobre as caixas disponíveis`,
        `- </caixas comprar:0> - Compra uma caixa de cards aleatórios`,
        "",
        "**Perfil**",
        `- </user ver [usuário (opicional)]:0> - Mostra o perfil do usuário selecionado. Caso não selecionado mostra o seu`,
        `- </user inventario [usuário (opcional)]:0> - Veja o inventário do usuário selecionado. Caso não selecionado mostra o seu.`,
        "",
        "### 💰 Sistema de Ryos",
        "» Ryos são a moeda do jogo",
        "» Ganhe Ryos respondendo perguntas </quiz:0>",
        "» Use para comprar cards e caixas",
        "» Venda cards para conseguir mais ryos",
        "",
        "### 📦 Sistema de Caixas",
        "» Diferentes raridades de caixas",
        "» Quantidade aleatória de cards por caixa",
        "» Cards exclusivos por raridade",
        "» Preços variados",
        "",
        "### 🎴 Sistema de Cards",
        "» Cards com diferentes raridades",
        "» Atributos únicos para cada ninja",
        "» Colecione todos os cards",
        "» Compre e venda no mercado"
      ),
      footer: {
        text: "Ninja Project • Desenvolvido Baline Apps",
        iconURL: interaction.guild.iconURL(),
      },
    });

    await interaction.reply({
      embeds: [mainEmbed],
    });
  },
});
