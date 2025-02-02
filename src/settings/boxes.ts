import { settings } from "#settings";
import { ColorResolvable } from "discord.js";

export interface Box {
    name: string;
    description: string;
    emoji: string;
    color: ColorResolvable;
    price: number;
    minCards: number;
    maxCards: number;
    cardRarity: string;
}

export const boxes = {
    normal: {
        name: "Caixa Normal",
        description: "Contém de 1-3 cards Normal (N)",
        emoji: "📦",
        color: "#808080",
        price: settings.boxs.N,
        minCards: 1,
        maxCards: 3,
        cardRarity: "N",
        cardName: "Normal",
    },
    raro: {
        name: "Caixa Rara",
        description: "Contém de 1-3 cards Raro (R)",
        emoji: "🎁",
        color: "#32CD32",
        price: settings.boxs.R,
        minCards: 1,
        maxCards: 3,
        cardRarity: "R",
        cardName: "Raro",
    },
    superRaro: {
        name: "Caixa Super Rara",
        description: "Contém de 1-2 cards Super Raro (SR)",
        emoji: "💎",
        color: "#4169E1",
        price: settings.boxs.SR,
        minCards: 1,
        maxCards: 2,
        cardRarity: "SR",
        cardName: "Super Raro",
    },
    superRaroEspecial: {
        name: "Caixa Super Rara Especial",
        description: "Contém 1-2 cards Super Raro Especial (SSR)",
        emoji: "🌟",
        color: "#8A2BE2",
        price: settings.boxs.SSR,
        minCards: 1,
        maxCards: 2,
        cardRarity: "SSR",
        cardName: "Super Raro Especial",
    },
    ultraRaro: {
        name: "Caixa Ultra Rara",
        description: "Contém 1 card Ultra Raro (UR)",
        emoji: "👑",
        color: "#FFD700",
        price: settings.boxs.UR,
        minCards: 1,
        maxCards: 1,
        cardRarity: "UR",
        cardName: "Ultra Raro",
    }
} as const;

export type BoxType = keyof typeof boxes;
