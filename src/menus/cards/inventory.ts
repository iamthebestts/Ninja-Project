import { CardInterface } from "#database";
import { icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle } from "discord.js";

interface ViewInventoryOptions {
    currentPage: number;
    totalCards: number;
    cards: CardInterface[];
    userId: string;
    username: string;
}

export function createInventoryView({ 
    currentPage, 
    totalCards, 
    cards, 
    userId, 
    username 
}: ViewInventoryOptions) {
    const totalPages = Math.max(1, totalCards);
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    
    const currentCard = cards[currentPage - 1];
    const hasCards = totalCards > 0;

    const embed = createEmbed({
        color: settings.colors.default,
        title: `🎴 Inventário ${userId === "self" ? "" : `de ${username}`}`,
        image: hasCards ? { url: currentCard.image } : undefined,
        description: hasCards ? brBuilder(
            `## ${currentCard.name} • ${currentCard.rarity}`,
            `📖 **Descrição:** ${currentCard.description}`,
            "",
            "📋 **Informações Básicas**",
            `🏷️ **Vila:** ${currentCard.village}`,
            `📜 **Rank:** ${currentCard.rank}`,
            `⚔️ **Clã:** ${currentCard.clan}`,
            `${icon.Ryo} **Preço:** ${currentCard.price} coins`,
            "",
            "📊 **Atributos Principais**",
            `💪 Força: ${"▰".repeat(Math.floor(currentCard.strength/10))}${"▱".repeat(10 - Math.floor(currentCard.strength/10))} ${currentCard.strength}/100`,
            `⚡ Velocidade: ${"▰".repeat(Math.floor(currentCard.speed/10))}${"▱".repeat(10 - Math.floor(currentCard.speed/10))} ${currentCard.speed}/100`,
            `🧠 Inteligência: ${"▰".repeat(Math.floor(currentCard.intelligence/10))}${"▱".repeat(10 - Math.floor(currentCard.intelligence/10))} ${currentCard.intelligence}/100`,
            "",
            "🌀 **Atributos de Chakra**",
            `🌪️ Controle: ${currentCard.chakraControl}/100`,
            `🔮 Ninjutsu: ${currentCard.ninjutsu}/100`,
            `👁️ Genjutsu: ${currentCard.genjutsu}/100`,
            `👊 Taijutsu: ${currentCard.taijutsu}/100`,
            "",
            currentCard.chakraType.length > 0 
                ? `🌈 **Tipos de Chakra:**\n${currentCard.chakraType.map(t => `• ${t}`).join("\n")}` 
                : "",
            currentCard.specialAbilities.length > 0 
                ? `✨ **Habilidades Especiais:**\n${currentCard.specialAbilities.map(a => `• ${a}`).join("\n")}` 
                : ""
        ) : `❌ ${userId === "self" ? "Você não possui" : `${username} não possui`} cards no inventário!`,
        footer: hasCards ? { 
            text: `📌 Página ${currentPage} de ${totalPages} • 🗃️ Total de cards: ${totalCards}`,
            iconURL: "https://cdn3.emoji.gg/emojis/5284-blurple-book.png"
        } : undefined
    });

    const row = createRow(
        new ButtonBuilder({
            label: "⏮️",
            customId: `inventory/first/${currentPage}/${totalPages}/${userId}`,
            style: ButtonStyle.Secondary,
            disabled: currentPage === 1 || !hasCards,
        }),
        new ButtonBuilder({
            label: "◀️",
            customId: `inventory/previous/${currentPage}/${totalPages}/${userId}`,
            style: ButtonStyle.Primary,
            disabled: currentPage === 1 || !hasCards,
        }),
        new ButtonBuilder({
            label: `${currentPage}/${totalPages}`,
            customId: "noop",
            style: ButtonStyle.Secondary,
            disabled: true,
        }),
        new ButtonBuilder({
            label: "▶️",
            customId: `inventory/next/${currentPage}/${totalPages}/${userId}`,
            style: ButtonStyle.Primary,
            disabled: currentPage === totalPages || !hasCards,
        }),
        new ButtonBuilder({
            label: "⏭️",
            customId: `inventory/last/${currentPage}/${totalPages}/${userId}`,
            style: ButtonStyle.Secondary,
            disabled: currentPage === totalPages || !hasCards,
        })
    );

    return { 
        embeds: [embed], 
        components: hasCards ? [row] : [] 
    };
}