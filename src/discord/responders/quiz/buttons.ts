// src/responders/quiz.ts

import { createResponder, ResponderType, URLStore } from "#base";
import { db } from "#database";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { readFileSync } from "fs";
import path from "path";

interface Quiz {
  id: number;
  question: string;
  reward: number;
  options: {
    text: string;
    correct: boolean;
  }[];
}

interface QuizParams {
  quizId: string;
  timestamp: string;
  [key: string]: string;
}

const QUIZZES_PATH = path.join(process.cwd(), "quizzes.json");
const quizzes: Quiz[] = JSON.parse(readFileSync(QUIZZES_PATH, "utf-8"));

createResponder({
  customId: "quiz/answer",
  types: [ResponderType.StringSelect],
  cache: "cached",
  async run(interaction) {
    await interaction.deferUpdate();

    const { user, values, message } = interaction;

    // Extrair parâmetros da URL usando URLStore
    const urlStore = new URLStore<QuizParams>(message.embeds[0]?.url);
    const quizId = parseInt(urlStore.get("quizId") || "0");

    // Validar quiz
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) {
      return interaction.followUp({
        content: "❌ Quiz não encontrado!",
        ephemeral: true
      });
    }

    // Processar resposta
    const selectedIndex = parseInt(values[0]);
    const selectedOption = quiz.options[selectedIndex];
    const isCorrect = selectedOption?.correct === true;
    const correctOption = quiz.options.find(opt => opt.correct)!;

    // Atualizar embed
    const embed = createEmbed({
      color: isCorrect ? settings.colors.success : settings.colors.danger,
      title: isCorrect ? "✅ Resposta Correta!" : "❌ Resposta Incorreta",
      fields: [
        {
          name: "📤 Sua resposta",
          value: selectedOption?.text || "Nenhuma selecionada",
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
          ? `💰 +${quiz.reward} | ⚡ ID: ${quiz.id}`
          : `⚡ ID: ${quiz.id}`
      }
    });

    // Desabilitar menu
    const disabledMenu = StringSelectMenuBuilder.from(interaction.component)
      .setDisabled(true);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(disabledMenu);

    // Atualizar banco de dados
    if (isCorrect) {
      await db.users.updateOne(
        { id: user.id },
        { 
          $inc: { 
            ryos: quiz.reward,
            "quizStats.correct": 1,
            "quizStats.total": 1
          } 
        }
      );
    } else {
      await db.users.updateOne(
        { id: user.id },
        { $inc: { "quizStats.total": 1 } }
      );
    }

    // Atualizar mensagem
    return await interaction.editReply({
      embeds: [embed],
      components: [row]
    });
  }
});