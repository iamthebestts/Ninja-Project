// src/database/index.ts
import { log } from "#settings";
import chalk from "chalk";
import mongoose, { InferSchemaType, model } from "mongoose";
import { cardSchema } from "./schemas/cards.js";
import { ServerConfigModel, ServerConfigSchema, serverConfigSchema } from "./schemas/serverConfig.js";
import { UserModel, UserSchema, userSchema } from "./schemas/user.js";

try {
  await mongoose.connect(process.env.MONGO_URI, { dbName: "ninjaProject" });
  log.success(chalk.green("MongoDB connected"));
} catch (err) {
  log.error(err);
  process.exit(1);
}

export const db = {
  cards: model("card", cardSchema, "cards"),
  users: model<UserSchema, UserModel>("user", userSchema, "users"),
  server: model<ServerConfigSchema, ServerConfigModel>("server", serverConfigSchema, "servers"),
};

export type CardSchemaType = InferSchemaType<typeof cardSchema>;
export type UserSchemaType = InferSchemaType<typeof userSchema>;

export * from "./schemas/cards.js";
export * from "./schemas/serverConfig.js";
export * from "./schemas/user.js";

