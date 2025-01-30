// src/responders/quiz.ts
import { createResponder, ResponderType } from "#base";
import { db } from "#database";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import {
    ActionRowBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import { readFileSync } from "fs";
import path from "path";

interface Quiz {
    id: number;
    question: string;
    reward: number,
    options: {
        text: string;
        correct: boolean;
    }[];
}

const QUIZZES_PATH = path.join(process.cwd(), "quizzes.json");
const quizzes: Quiz[] = JSON.parse(readFileSync(QUIZZES_PATH, "utf-8"));

createResponder({
    customId: "quiz/select/:quizId",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction, params) {
        await interaction.deferUpdate();
        
        const { user, values, message } = interaction;
        
        // Extrair parâmetros da URL
        const searchParams = new URLSearchParams(params.quizId);
        const quizId = parseInt(searchParams.get("quizId") || "0");

        // Extrair índice selecionado
        const selectedIndex = parseInt(values[0]);

        // Buscar quiz
        const quiz = quizzes.find(q => q.id === quizId);
        if (!quiz) {
            return interaction.followUp({
                content: "❌ Quiz não encontrado!",
                ephemeral: true
            });
        }

        // Verificar resposta
        const isCorrect = quiz.options[selectedIndex]?.correct === true;
        const correctOption = quiz.options.find(opt => opt.correct)!;
        const reward = quiz.reward;

        // Atualizar embed
        const embed = createEmbed({
            color: isCorrect ? settings.colors.success : settings.colors.danger,
            title: isCorrect ? "✅ Resposta Correta!" : "❌ Resposta Incorreta",
            fields: [
                { 
                    name: "📤 Sua resposta", 
                    value: quiz.options[selectedIndex]?.text || "Nenhuma selecionada",
                    inline: true
                },
                { 
                    name: "📥 Resposta correta", 
                    value: correctOption.text,
                    inline: true
                }
            ],
            footer: { 
                text: isCorrect 
                    ? `💰 +${reward} ryos | ⚡ ID: ${quiz.id}`
                    : `⚡ ID: ${quiz.id}` 
            }
        });

        // Desabilitar menu
        const disabledMenu = StringSelectMenuBuilder
            .from(interaction.component)
            .setDisabled(true);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(disabledMenu);

        // Atualizar banco de dados
        if (isCorrect) {
            await db.users.updateOne(
                { id: user.id },
                { $inc: { ryos: reward } }
            );
        }

        await interaction.editReply({ 
            embeds: [embed], 
            components: [row] 
        });
    }
});