// src/database/schemas/quiz.ts
import { HydratedDocument, Model, Schema } from "mongoose";
import { t } from "../utils.js";

interface QuizSchema {
  id?: string;
  createdAt: Date;
  question: string;
  options: string[];
  answer: string;
}

export type HydratedQuizDocument = HydratedDocument<QuizSchema, quizMethods>;

type DocumentReturn = Promise<HydratedQuizDocument>;

interface quizStatics {
  createQuiz(quizData: Omit<QuizSchema, "id" | "createdAt">): DocumentReturn;
  getQuiz(): Promise<HydratedQuizDocument | null>;
  getQuizById(id: string): Promise<HydratedQuizDocument | null>;
}

interface quizMethods {}

type QuizModel = Model<QuizSchema, {}, quizMethods, quizStatics>;

const quizSchema = new Schema<
  QuizSchema,
  QuizModel,
  quizMethods,
  {},
  {},
  quizStatics
>(
  {
    question: t.string,
    options: { type: [t.string], required: true },
    answer: t.string,
  },
  {
    timestamps: true,
    statics: {
      async createQuiz(quizData) {
        return (await this.create(quizData)) as HydratedQuizDocument;
      },
      async getQuiz() {
        const count = await this.countDocuments();
        if (count === 0) return null;
        const randomIndex = Math.floor(Math.random() * count);
        return (await this.findOne().skip(randomIndex)) as HydratedQuizDocument;
      },
      async getQuizById(id) {
        return (await this.findById(id)) as HydratedQuizDocument;
      },
    },
  }
);

export { QuizModel, quizSchema, QuizSchema };

