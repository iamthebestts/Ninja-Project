import { settings } from "#settings";
import { createEmbed } from "@magicyan/discord";
import { ButtonBuilder, ButtonStyle } from "discord.js";

const CARDS_PER_PAGE = 5;

interface ViewInventoryOptions {
    currentPage: number;
    totalCards: number;
    cards: any[];
    userId: string;
    username: string;
}

export function createInventoryView({ currentPage, totalCards, cards, userId, username }: ViewInventoryOptions) {
    const maxPage = Math.ceil(totalCards / CARDS_PER_PAGE);
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const pageCards = cards.slice(startIndex, startIndex + CARDS_PER_PAGE);

    const embed = createEmbed({
        color: settings.colors.default,
        title: `🎴 Inventário ${userId === "self" ? "" : `de ${username}`}`,
        description: [
            ...pageCards.map(card => [
                `# ${card.name}`,
                `💰 Preço: ${card.price} coins`,
                `📜 Descrição: ${card.description}`,
                "",
                "**Informações Básicas**",
                `🎴 Raridade: ${card.rarity}`,
                `🏠 Vila: ${card.village}`,
                `👑 Rank: ${card.rank}`,
                `👥 Clã: ${card.clan}`,
                "",
                "**Atributos**",
                `💪 Força: ${card.strength}/100`,
                `⚡ Velocidade: ${card.speed}/100`,
                `🧠 Inteligência: ${card.intelligence}/100`,
                `🌀 Controle de Chakra: ${card.chakraControl}/100`,
                `🔮 Ninjutsu: ${card.ninjutsu}/100`,
                `👁️ Genjutsu: ${card.genjutsu}/100`,
                `👊 Taijutsu: ${card.taijutsu}/100`,
                "",
                card.chakraType.length > 0 ? `**Tipos de Chakra**\n${card.chakraType.join(", ")}` : "",
                card.specialAbilities.length > 0 ? `**Habilidades Especiais**\n${card.specialAbilities.join(", ")}` : "",
                "▔".repeat(30)
            ]).flat()
        ].flat().join("\n"),
        image: pageCards[0]?.image,
        footer: {
            text: `Página ${currentPage} de ${maxPage} • Total de cards: ${totalCards}`
        }
    });

    // Criar os botões de navegação
    const previousButton = new ButtonBuilder()
        .setCustomId(`inventory:previous:${currentPage}:${userId}`)
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 1);

    const nextButton = new ButtonBuilder()
        .setCustomId(`inventory:next:${currentPage}:${userId}`)
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === maxPage);

    return {
        embeds: [embed],
        components: [
            {
                type: 1,
                components: [previousButton.toJSON(), nextButton.toJSON()]
            }
        ]
    };
}
