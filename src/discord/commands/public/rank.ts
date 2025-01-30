import { createCommand } from "#base";
import { db } from "#database";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

// Definir a ordem dos ranks e seus custos de upgrade
const rankSystem = {
    "Ninja": { next: "Genin", cost: 1000 },
    "Genin": { next: "Chunin", cost: 5000 },
    "Chunin": { next: "Jounin", cost: 15000 },
    "Jounin": { next: null, cost: null } // Rank máximo
} as const;

createCommand({
    name: "rank",
    description: "Sistema de ranks do Naruto",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "upar",
            description: "Suba seu rank pagando com ryos",
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: "info",
            description: "Veja informações sobre os ranks",
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
    async run(interaction) {
        const { options } = interaction;
        const subcommand = options.getSubcommand();

        // Buscar o usuário
        const user = await db.users.get(interaction.user.id);
        if (!user) {
            return interaction.reply({
                content: "❌ Você precisa ter uma conta para usar este comando!",
                flags
            });
        }

        if (subcommand === "upar") {
            const currentRank = user.rank;
            const rankInfo = rankSystem[currentRank];

            // Verificar se o usuário já está no rank máximo
            if (!rankInfo.next) {
                return interaction.reply({
                    content: "❌ Você já está no rank máximo (Jounin)!",
                    flags
                });
            }

            // Verificar se o usuário tem ryos suficientes
            if (user.ryos < rankInfo.cost) {
                return interaction.reply({
                    content: `❌ Você precisa de ${rankInfo.cost} ryos para upar para ${rankInfo.next}! (Você tem ${user.ryos} ryos)`,
                    flags
                });
            }

            // Atualizar o rank e remover os ryos
            await user.removeRyos(rankInfo.cost);
            user.rank = rankInfo.next;
            await user.save();

            const embed = createEmbed({
                color: settings.colors.success,
                title: "🎉 Rank Upado com Sucesso!",
                description: [
                    `**Rank Anterior:** ${currentRank}`,
                    `**Novo Rank:** ${rankInfo.next}`,
                    `**Custo:** ${rankInfo.cost} ryos`,
                    `**Ryos Restantes:** ${user.ryos} ryos`
                ].join("\n")
            });

            return interaction.reply({ embeds: [embed], flags });
        }

        if (subcommand === "info") {
            const rankInfo = Object.entries(rankSystem).map(([rank, info]) => {
                if (info.next) {
                    return `**${rank}** ➔ ${info.next} (Custo: ${info.cost} ryos)`;
                }
                return `**${rank}** (Rank Máximo)`;
            }).join("\n");

            const embed = createEmbed({
                color: settings.colors.primary,
                title: "📊 Sistema de Ranks",
                description: [
                    "Evolua seu ninja subindo de rank!",
                    "",
                    "**Seu Rank Atual:** " + user.rank,
                    "**Seus Ryos:** " + user.ryos,
                    "",
                    "**Lista de Ranks:**",
                    rankInfo
                ].join("\n")
            });

            return interaction.reply({ embeds: [embed], flags });
        }
    }
});