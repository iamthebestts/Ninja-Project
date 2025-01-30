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
    comum: {
        name: "Caixa Comum",
        description: "Contém de 1-3 cards comuns",
        emoji: "📦",
        color: "#808080",
        price: 1000,
        minCards: 1,
        maxCards: 3,
        cardRarity: "Comum"
    },
    incomum: {
        name: "Caixa Incomum",
        description: "Contém de 1-3 cards incomuns",
        emoji: "🎁",
        color: "#32CD32",
        price: 2500,
        minCards: 1,
        maxCards: 3,
        cardRarity: "Incomum"
    },
    raro: {
        name: "Caixa Rara",
        description: "Contém de 1-2 cards raros",
        emoji: "💎",
        color: "#4169E1",
        price: 5000,
        minCards: 1,
        maxCards: 2,
        cardRarity: "Raro"
    },
    ultrararo: {
        name: "Caixa Ultra Rara",
        description: "Contém 1-2 cards ultra raros",
        emoji: "🌟",
        color: "#8A2BE2",
        price: 10000,
        minCards: 1,
        maxCards: 2,
        cardRarity: "Ultra Raro"
    },
    lendario: {
        name: "Caixa Lendária",
        description: "Contém 1 card lendário",
        emoji: "👑",
        color: "#FFD700",
        price: 25000,
        minCards: 1,
        maxCards: 1,
        cardRarity: "Lendário"
    }
} as const;

export type BoxType = keyof typeof boxes;
