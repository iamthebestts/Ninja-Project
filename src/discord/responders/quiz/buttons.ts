// src/responders/quiz.ts

import { createResponder, ResponderType, URLStore } from "#base";
import { db } from "#database";
import { icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";
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
    const quizOwner = urlStore.get("owner");
    const responseDeadline = parseInt(urlStore.get("responseDeadline") || "0");

    // Verificar se o tempo limite passou
    if (Date.now() > responseDeadline) {
      return interaction.followUp({
        content: "⏰ O tempo limite para responder este quiz já passou!",
        flags,
      });
    }

    // Validar quiz
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) {
      return interaction.followUp({
        content: "❌ Quiz não encontrado!",
        flags,
      });
    }

    if (quizOwner !== user.id) {
      return interaction.followUp({
        content: "❌ Você não pode responder o quiz de outro usuário!",
        flags,
      });
    }

    // Processar resposta
    const selectedIndex = parseInt(values[0]);
    const selectedOption = quiz.options[selectedIndex];
    const isCorrect = selectedOption?.correct === true;
    const correctOption = quiz.options.find((opt) => opt.correct)!;

    // Atualizar embed
    const embed = createEmbed({
      color: isCorrect ? settings.colors.success : settings.colors.danger,
      description: brBuilder(
        isCorrect ? "## 🎉 Acertou!" : "## 😢 Errou",
        isCorrect
          ? `Parabens! Você acertou a resposta! **${quiz.reward} ${icon.Ryo} Ryos** foram adicionados no seu saldo`
          : "Não foi dessa vez..."
      ),
      fields: [
        {
          name: "📤 Sua resposta",
          value: selectedOption?.text || "Nenhuma selecionada",
          inline: true,
        },
        {
          name: "📥 Resposta correta",
          value: correctOption.text,
          inline: true,
        },
      ],
      footer: {
        text: isCorrect ? `💰 +${quiz.reward} Ryos` : "",
      },
    });

    // Atualizar banco de dados
    if (isCorrect) {
      await db.users.updateOne(
        { id: user.id },
        {
          $inc: {
            ryos: quiz.reward,
            "quizStats.correct": 1,
            "quizStats.total": 1,
          },
        }
      );
    } else {
      await db.users.updateOne(
        { id: user.id },
        { $inc: { "quizStats.total": 1 } }
      );
    }

    // Atualizar mensagem
    const response = await interaction.editReply({
      embeds: [embed],
      components: [],
    });

    setTimeout(() => response.delete(), 60_000);
    return;
  },
});
