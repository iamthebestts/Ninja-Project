// src/commands/quiz.ts
import { createCommand, URLStore } from "#base";
import { icon } from "#functions";
import { settings } from "#settings";
import { createEmbed, EmbedLimit } from "@magicyan/discord";
import {
  ActionRowBuilder,
  ApplicationCommandType,
  StringSelectMenuBuilder,
  time
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
  reward: number;
}

interface QuizParams {
  quizId: string;
  timestamp: string;
  [key: string]: string;
}

const QUIZZES_PATH = path.join(process.cwd(), "quizzes.json");
const COOLDOWN_TIME = 60_000;

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

    const now = Date.now();

    // Usar URLStore para gerenciar parâmetros
    const urlStore = new URLStore<QuizParams>();
    const lastAttempt = urlStore.get("timestamp");

    // Verificar cooldown usando URLStore
    if (lastAttempt && now - parseInt(lastAttempt) < COOLDOWN_TIME) {
      const resetTime = Math.ceil((parseInt(lastAttempt) + COOLDOWN_TIME) / 1000);
      return interaction.editReply({
        content: `⏳ Você pode tentar novamente ${time(resetTime, "R")}!`
      });
    }

    // Selecionar quiz válido
    const availableQuizzes = quizzes.filter(q => q.options.some(o => o.correct));
    if (availableQuizzes.length === 0) {
      return interaction.editReply({
        content: "❌ Nenhum quiz disponível no momento!"
      });
    }

    const quiz = availableQuizzes[Math.floor(Math.random() * availableQuizzes.length)];
    
    // Configurar parâmetros na URL
    urlStore.set("quizId", quiz.id.toString());
    urlStore.set("timestamp", now.toString());

    if (urlStore.length > EmbedLimit.URL) {
      return interaction.editReply({
        content: "❌ Ocorreu um erro ao configurar o quiz!"
      });
    }

    // Construir componentes
    const options = quiz.options.map((option, index) => {
      const [label, ...descriptionParts] = option.text.split(")");
      return {
        label: label.trim(),
        description: descriptionParts.join(")").trim().slice(0, 50),
        value: index.toString()
      };
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("quiz/answer")
      .setPlaceholder("Selecione sua resposta")
      .addOptions(options);

    const embed = createEmbed({
      color: settings.colors.primary,
      title: "📚 Quiz - Teste seu conhecimento",
      url: urlStore.toString(),
      description: `**${quiz.question}**`,
      fields: [
        {
          name: "Recompensa",
          value: `${quiz.reward} ${icon.Ryo}`,
          inline: true
        },
        {
          name: "Tempo limite",
          value: time(Math.floor(now / 1000) + 60, "R"),
          inline: true
        }
      ]
    });

    return await interaction.editReply({
      embeds: [embed],
      components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)]
    });
  },
});