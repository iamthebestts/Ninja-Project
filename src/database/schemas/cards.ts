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
  price: number;
  // Ninja attributes
  chakraType: string[];     // Tipos de chakra (Fire, Water, Earth, etc)
  rank: string;             // Rank ninja (Genin, Chunin, Jounin, etc)
  village: string;          // Vila ninja (Konoha, Suna, etc)
  strength: number;         // Força física
  speed: number;            // Velocidade
  intelligence: number;     // Inteligência
  chakraControl: number;    // Controle de chakra
  ninjutsu: number;        // Habilidade com ninjutsu
  genjutsu: number;        // Habilidade com genjutsu
  taijutsu: number;        // Habilidade com taijutsu
  specialAbilities: string[]; // Habilidades especiais (Sharingan, Rasengan, etc)
  clan: string;            // Clã do ninja
}

export type HydratedCardDocument = HydratedDocument<CardInterface, cardMethods>;

type DocumentReturn = Promise<HydratedCardDocument>;

interface cardStatics {
  createCard(cardData: Omit<CardInterface, "id" | "createdAt">): DocumentReturn;
  getCardByName(name: string): Promise<HydratedCardDocument | null>;
  getCardsByRarity(rarity: string): Promise<HydratedCardDocument[]>;
  getAllCards(): Promise<HydratedCardDocument[]>;
}

interface cardMethods {
  delete(): Promise<Boolean>;
}

type CardModel = Model<CardInterface, {}, cardMethods, cardStatics>;


const cardSchema = new Schema<
  CardInterface,
  CardModel,
  {},
  {},
  {},
  cardStatics
>(
  {
    name: t.string,
    rarity: { 
      type: String, 
      required: true,
      enum: ["N", "R", "SR", "SSR", "UR"]
    },
    image: t.string,
    description: t.string,
    price: { type: Number, required: true, min: 0 },
    chakraType: [t.string],
    rank: t.string,
    village: t.string,
    strength: { type: Number, required: true, min: 1, max: 100 },
    speed: { type: Number, required: true, min: 1, max: 100 },
    intelligence: { type: Number, required: true, min: 1, max: 100 },
    chakraControl: { type: Number, required: true, min: 1, max: 100 },
    ninjutsu: { type: Number, required: true, min: 1, max: 100 },
    genjutsu: { type: Number, required: true, min: 1, max: 100 },
    taijutsu: { type: Number, required: true, min: 1, max: 100 },
    specialAbilities: [t.string],
    clan: t.string
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
    methods: {
      async delete() {
        return !!this.deleteOne();
      },
    }
  }
);

export { CardInterface, CardModel, cardSchema };
