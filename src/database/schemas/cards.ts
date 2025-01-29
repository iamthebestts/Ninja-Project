// src/database/schemas/cards.ts
import { HydratedDocument, Model, Schema } from "mongoose";
import { t } from "../utils.js";

interface CardInterface {
  id?: string;
  createdAt: Date;
  name: string;
  rarity: string;
  image: string;
  description: string;
}

export type HydratedCardDocument = HydratedDocument<CardInterface, cardMethods>;

type DocumentReturn = Promise<HydratedCardDocument>;

interface cardStatics {
  createCard(cardData: Omit<CardInterface, "id" | "createdAt">): DocumentReturn;
  getCardByName(name: string): Promise<HydratedCardDocument | null>;
  getCardsByRarity(rarity: string): Promise<HydratedCardDocument[]>;
  getAllCards(): Promise<HydratedCardDocument[]>;
}

interface cardMethods {}

type CardModel = Model<CardInterface, {}, cardMethods, cardStatics>;

const cardSchema = new Schema<
  CardInterface,
  CardModel,
  cardMethods,
  {},
  {},
  cardStatics
>(
  {
    name: t.string,
    rarity: t.string,
    image: t.string,
    description: t.string,
  },
  {
    timestamps: true,
    statics: {
      async createCard(cardData) {
        return (await this.create(cardData)) as HydratedCardDocument;
      },
      async getCardByName(name) {
        return (await this.findOne({ name })) as HydratedCardDocument;
      },
      async getCardsByRarity(rarity) {
        return (await this.find({ rarity })) as HydratedCardDocument[];
      },
      async getAllCards() {
        return (await this.find()) as HydratedCardDocument[];
      },
    },
  }
);

export { cardSchema, CardModel, CardInterface };
