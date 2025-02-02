// src/commands/quiz.ts
import { createCommand, URLStore } from "#base";
import { db } from "#database";
import { icon, res } from "#functions";
import { settings } from "#settings";
import {
  brBuilder,
  createEmbed,
  createRow,
  EmbedLimit,
} from "@magicyan/discord";
import {
  ApplicationCommandType,
  StringSelectMenuBuilder,
  time,
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
  owner: string;
  [key: string]: string;
}

const QUIZZES_PATH = path.join(process.cwd(), "quizzes.json");
const COOLDOWN_TIME = 60_000;
// Remover esta constante pois agora vem do settings
// const QUIZ_COOLDOWN = 60_000; // 1 minuto em milissegundos

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

    // Verificar cooldown
    const user = await db.users.get(interaction.user.id);
    const nowDate = new Date();
    
    if (user.lastQuiz) {
      const timeSinceLastQuiz = nowDate.getTime() - user.lastQuiz.getTime();
      const cooldownMs = settings.quiz.cooldown * 1000;
      
      if (timeSinceLastQuiz < cooldownMs) {
        const resetTime = Math.floor((user.lastQuiz.getTime() + cooldownMs) / 1000);
        return interaction.editReply(
          res.danger(`⏰ Você poderá fazer outro quiz ${time(resetTime, "R")}!`)
        ).then(() => setTimeout(() => interaction.deleteReply(), 10_000));
      }
    }

    // Atualizar timestamp da última tentativa
    user.lastQuiz = nowDate;
    await user.save();

    // Usar URLStore para gerenciar parâmetros
    const urlStore = new URLStore<QuizParams>();
    const lastAttempt = urlStore.get("timestamp");

    // Verificar cooldown usando URLStore
    if (lastAttempt && now - parseInt(lastAttempt) < COOLDOWN_TIME) {
      const resetTime = Math.ceil(
        (parseInt(lastAttempt) + COOLDOWN_TIME) / 1000
      );
      return interaction.editReply({
        content: `⏳ Você pode tentar novamente ${time(resetTime, "R")}!`,
      });
    }

    // Selecionar quiz válido
    const availableQuizzes = quizzes.filter((q) =>
      q.options.some((o) => o.correct)
    );
    if (availableQuizzes.length === 0) {
      return interaction.editReply(res.danger("❌ Nenhum quiz disponível no momento!"));
    }

    const quiz =
      availableQuizzes[Math.floor(Math.random() * availableQuizzes.length)];

    // Configurar parâmetros na URL
    urlStore.set("quizId", quiz.id.toString());
    urlStore.set("timestamp", now.toString());
    urlStore.set("owner", interaction.user.id.toString());
    urlStore.set(
      "responseDeadline",
      (now + settings.quiz.responseTime * 1000).toString()
    );

    if (urlStore.length > EmbedLimit.URL) {
      return interaction.editReply(
        res.danger("❌ Ocorreu um erro ao configurar o quiz!")
      );
    }

    // Construir componentes
    const options = quiz.options.map((option, index) => {
      const [label, ...descriptionParts] = option.text.split(")");
      return {
        label: `${label.trim().toUpperCase()})`,
        description: descriptionParts.join(")").trim().slice(0, 50),
        value: index.toString(),
      };
    });

    const row = createRow(
      new StringSelectMenuBuilder({
        customId: "quiz/answer",
        placeholder: "Selecione sua resposta",
        options,
      })
    );

    const embed = createEmbed({
      color: settings.colors.primary,
      url: urlStore,
      description: brBuilder(
        "## 📝 Quiz Naruto",
        "Responda a pergunta abaixo para ganhar ryos!",
        "",
        `**${quiz.question}**`
      ),
      fields: [
        {
          name: "Recompensa",
          value: `${quiz.reward} ${icon.Ryo}`,
          inline: true,
        },
        {
          name: "Tempo limite",
          value: time(Math.floor(now / 1000) + settings.quiz.responseTime, "R"),
          inline: true,
        },
      ],
    });

    return await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  },
});
