// src/commands/quiz.ts
import { createCommand } from "#base";
import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import {
    ActionRowBuilder,
    ApplicationCommandType,
    StringSelectMenuBuilder,
} from "discord.js";
import { readFileSync } from "fs";
import path from "path";

interface Quiz {
  id: number;
  question: string;
  options: {
    text: string;
    correct: boolean;
  }[];
  reward: number; // Add reward field
}

const quizCooldowns = new Map<string, number>();
const COOLDOWN_TIME = 60_000;
const QUIZZES_PATH = path.join(process.cwd(), "quizzes.json");

let quizzes: Quiz[] = [];
try {
  quizzes = JSON.parse(readFileSync(QUIZZES_PATH, "utf-8"));
} catch (error) {
  console.error("Erro ao carregar quizzes:", error);
}

createCommand({
  name: "quiz",
  description: "Responda perguntas usando o menu de seleção",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
    await interaction.deferReply();

    const { user } = interaction;

    // Verificar cooldown
    const lastQuiz = quizCooldowns.get(user.id);
    if (lastQuiz && Date.now() - lastQuiz < COOLDOWN_TIME) {
      const timeLeft = COOLDOWN_TIME - (Date.now() - lastQuiz);
      return interaction.editReply({
        content: `⏳ Aguarde ${Math.ceil(
          timeLeft / 1000
        )} segundos para outro quiz!`,
      });
    }

    // Selecionar quiz aleatório
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    if (!quiz) {
      return interaction.editReply({
        content: "❌ Nenhum quiz disponível no momento!",
      });
    }

    // Criar parâmetros de URL
    const params = new URLSearchParams({ quizId: quiz.id.toString() });

    // Criar select menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`quiz/select/${params}`)
      .setPlaceholder("Selecione sua resposta")
      .addOptions(
        quiz.options.map((option, index) => ({
          label: option.text.split(")")[0].trim(),
          description: option.text.split(")")[1].trim().slice(0, 50),
          value: index.toString(),
        }))
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu
    );

    // Criar embed
    const embed = createEmbed({
      color: settings.colors.primary,
      title: "📚 Quiz - Selecione sua resposta",
      description: `**${quiz.question}**`,
      footer: {
        text: `🎁 Recompensa: ${quiz.reward} ryos | ⏳ Tempo limite: 1 minuto | ID: ${quiz.id}`,
      },
    });

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });

    // Registrar cooldown
    quizCooldowns.set(user.id, Date.now());
    return;
  },
});
