// src/database/schemas/user.ts
import { HydratedDocument, Model, Schema } from "mongoose";
import { t } from "../utils.js";
import { CardInterface } from "./cards.js";

export interface UserSchema {
  id?: string;
  createdAt: Date;
  ryos: number;
  cards: CardInterface[];
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
    cards: {
      type: [{ type: Schema.Types.ObjectId, ref: "card" }],
      default: [],
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
            cards: [],
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
        this.cards = this.cards.filter((card) => card.id !== cardId);
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
        this.cards = this.cards.filter((card) => card.id !== cardId);
        return (await this.save()) as HydratedUserDocument;
      },
    },
  }
);
