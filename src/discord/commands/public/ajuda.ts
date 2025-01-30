import { createCommand } from "#base";
import { icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";

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
                `${icon.arrow} </cards list:0> - Lista todos os cards disponíveis`,
                `${icon.arrow} </cards info:0> - Mostra informações detalhadas de um card`,
                `${icon.arrow} </cards comprar:0> - Compra um card específico`,
                `${icon.arrow} </cards vender:0> - Vende um card do seu inventário`,
                "",
                "**Caixas**",
                `${icon.arrow} </caixas info:0> - Mostra informações sobre as caixas disponíveis`,
                `${icon.arrow} </caixas comprar:0> - Compra uma caixa de cards aleatórios`,
                "",
                "**Perfil**",
                `${icon.arrow} </perfil:0> - Mostra seu perfil e inventário`,
                `${icon.arrow} </daily:0> - Recebe sua recompensa diária de ryos`,
                "",
                "### 💰 Sistema de Ryos",
                "» Ryos são a moeda do jogo",
                "» Ganhe ryos diariamente com </daily:0>",
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
                text: "Ninja Project • Desenvolvido por sua equipe",
                iconURL: interaction.client.user.displayAvatarURL()
            }
        });

        const row = createRow(
            new ButtonBuilder({
                label: "Suporte",
                emoji: "❓",
                style: ButtonStyle.Link,
                url: "https://discord.gg/seuservidor" // Coloque o link do seu servidor de suporte
            }),
            new ButtonBuilder({
                label: "Me adicione",
                emoji: "➕",
                style: ButtonStyle.Link,
                url: `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=0&scope=bot%20applications.commands`
            })
        );

        await interaction.reply({
            embeds: [mainEmbed],
            components: [row]
        });
    }
});
