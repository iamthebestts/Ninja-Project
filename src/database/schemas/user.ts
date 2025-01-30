// src/database/schemas/user.ts
import { HydratedDocument, Model, Schema } from "mongoose";
import { t } from "../utils.js";
import { CardInterface } from "./cards.js";

// crie ranks que combine com naruto
export type Rank = "Ninja" | "Chunin" | "Jounin" | "Genin";

export interface UserSchema {
  id?: string;
  createdAt: Date;
  ryos: number;
  rank: Rank;
  cards: CardInterface[];
  quizStats: {
    correct: number;
    total: number;
  };
}

export type HydratedUserDocument = HydratedDocument<UserSchema, userMethods>;

type DocumentReturn = Promise<HydratedUserDocument>;

export interface userStatics {
  get(id: string): DocumentReturn;
}

export interface userMethods {
  getInventory(): Promise<CardInterface[]>;
  addCard(card: CardInterface): Promise<HydratedUserDocument>;
  removeCard(cardId: string): Promise<HydratedUserDocument>;
  addRyos(ryos: number): Promise<HydratedUserDocument>;
  removeRyos(ryos: number): Promise<HydratedUserDocument>;
  removeCardFromInventory(cardId: string): Promise<HydratedUserDocument>;
  searchCards(search: string, maxResults?: number): Promise<CardInterface[]>;
  incrementQuizStats(correct: boolean): Promise<HydratedUserDocument>;
}

// Alterar esta linha
export type UserModel = Model<UserSchema> & userStatics;

export const userSchema = new Schema<
  UserSchema,
  UserModel,
  userMethods,
  {},
  {},
  userStatics
>(
  {
    id: t.string,
    createdAt: t.date,
    ryos: { ...t.number, default: 0 },
    rank: { ...t.string, default: "Ninja" },
    cards: {
      type: [{ type: Schema.Types.ObjectId, ref: "card" }],
      default: [],
    },
    quizStats: {
      correct: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    statics: {
      async get(id) {
        let document = await this.findOne({ id });

        if (!document) {
          document = await this.create({
            id,
            createdAt: new Date(),
            ryos: 0,
            rank: "Ninja",
            cards: [],
            quizStats: {
              correct: 0,
              total: 0,
            },
          });
        }

        return Promise.resolve(document as HydratedUserDocument);
      },
    },
    methods: {
      async getInventory() {
        return await (this.constructor as UserModel)
          .populate(this, { path: "cards", model: "card" })
          .then((user) => user.cards as unknown as CardInterface[]);
      },
      async addCard(card) {
        this.cards.push(card);
        return (await this.save()) as HydratedUserDocument;
      },
      async removeCard(cardId) {
        this.cards = this.cards.filter((card) => card.toString() !== cardId);
        return (await this.save()) as HydratedUserDocument;
      },
      async addRyos(ryos) {
        this.ryos += ryos;
        return (await this.save()) as HydratedUserDocument;
      },
      async removeRyos(ryos) {
        this.ryos -= ryos;
        return (await this.save()) as HydratedUserDocument;
      },
      async removeCardFromInventory(cardId) {
        this.cards = this.cards.filter((card) => card.toString() !== cardId);
        return (await this.save()) as HydratedUserDocument;
      },
      async searchCards(search: string, maxResults: number = 25) {
        const populated = await (this.constructor as UserModel).populate(this, {
          path: "cards",
          model: "card",
        });

        const cards = populated.cards as unknown as CardInterface[];
        const filtered = cards.filter((card) =>
          card.name.toLowerCase().includes(search.toLowerCase())
        );

        return filtered.slice(0, maxResults);
      },
      async incrementQuizStats(correct: boolean) {
        this.quizStats.total += 1;
        if (correct) {
          this.quizStats.correct += 1;
        }
        return (await this.save()) as HydratedUserDocument;
      },
    },
  }
);
