// src/database/index.ts
import { log } from "#settings";
import chalk from "chalk";
import mongoose, { InferSchemaType, model } from "mongoose";
import { CardInterface, CardModel, cardSchema } from "./schemas/cards.js";
import { QuizModel, QuizSchema, quizSchema } from "./schemas/quiz.js";
import { UserModel, UserSchema, userSchema } from "./schemas/user.js";

try {
  await mongoose.connect(process.env.MONGO_URI, { dbName: "ninjaProject" });
  log.success(chalk.green("MongoDB connected"));
} catch (err) {
  log.error(err);
  process.exit(1);
}

export const db = {
  cards: model<CardInterface, CardModel>("card", cardSchema, "cards"),
  quizzes: model<QuizSchema, QuizModel>("quiz", quizSchema, "quizzes"),
  users: model<UserSchema, UserModel>("user", userSchema, "users"),
};

export type CardSchemaType = InferSchemaType<typeof cardSchema>;
export type QuizSchemaType = InferSchemaType<typeof quizSchema>;
export type UserSchemaType = InferSchemaType<typeof userSchema>;

export * from "./schemas/cards.js";
export * from "./schemas/quiz.js";
export * from "./schemas/user.js";

