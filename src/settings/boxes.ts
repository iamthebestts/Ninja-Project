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
        description: "Contém de 1-3 cards N (Normais)",
        emoji: "📦",
        color: "#808080",
        price: 1000,
        minCards: 1,
        maxCards: 3,
        cardRarity: "N"
    },
    raro: {
        name: "Caixa Rara",
        description: "Contém de 1-3 cards R (Raros)",
        emoji: "🎁",
        color: "#32CD32",
        price: 2500,
        minCards: 1,
        maxCards: 3,
        cardRarity: "R"
    },
    superRaro: {
        name: "Caixa Super Rara",
        description: "Contém de 1-2 cards SR (Super Raros)",
        emoji: "💎",
        color: "#4169E1",
        price: 5000,
        minCards: 1,
        maxCards: 2,
        cardRarity: "SR"
    },
    superRaroEspecial: {
        name: "Caixa Super Rara Especial",
        description: "Contém 1-2 cards SSR (Super Raros Especiais)",
        emoji: "🌟",
        color: "#8A2BE2",
        price: 10000,
        minCards: 1,
        maxCards: 2,
        cardRarity: "SSR"
    },
    ultraRaro: {
        name: "Caixa Ultra Rara",
        description: "Contém 1 card UR (Ultra Raro)",
        emoji: "👑",
        color: "#FFD700",
        price: 25000,
        minCards: 1,
        maxCards: 1,
        cardRarity: "UR"
    }
} as const;

export type BoxType = keyof typeof boxes;
