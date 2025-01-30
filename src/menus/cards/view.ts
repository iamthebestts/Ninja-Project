import { settings } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

interface Card {
    name: string;
    rarity: string;
    village: string;
    rank: string;
    clan: string;
    price: number;
    image: string;
    description: string;
    chakraType: string[];
    strength: number;
    speed: number;
    intelligence: number;
    chakraControl: number;
    ninjutsu: number;
    genjutsu: number;
    taijutsu: number;
    specialAbilities: string[];
}

interface CardsViewOptions {
    currentPage: number;
    totalCards: number;
    cards: Card[];
    cardsPerPage?: number;
}

export function createCardsView({ 
    currentPage, 
    totalCards, 
    cards,
    cardsPerPage = 5 
}: CardsViewOptions) {
    // Validação de entradas
    if (currentPage < 1 || !Number.isInteger(currentPage)) {
        throw new Error("O número da página atual deve ser um inteiro maior ou igual a 1.");
    }
    if (totalCards < 0 || !Number.isInteger(totalCards)) {
        throw new Error("O número total de cards deve ser um inteiro maior ou igual a 0.");
    }
    if (!Array.isArray(cards)) {
        throw new Error("A lista de cards deve ser um array.");
    }
    if (cardsPerPage < 1 || !Number.isInteger(cardsPerPage)) {
        throw new Error("O número de cards por página deve ser um inteiro maior ou igual a 1.");
    }

    const totalPages = Math.ceil(totalCards / cardsPerPage);

    // Garantir que a página atual esteja dentro do intervalo válido
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const pageCards = cards.slice(startIndex, endIndex);

    // Criar o embed
    const embed = createEmbed({
        color: settings.colors.primary,
        title: "Lista de Cards",
        image: totalCards === 0 ? undefined : { url: pageCards[0].image },
        description: totalCards === 0 
            ? "Nenhum card encontrado! Use `/cards add` para adicionar cards."
            : pageCards.map(card => 
                brBuilder(
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
                )
            ).join("\\n"),
        footer: totalCards > 0 ? {
            text: `Página ${currentPage} de ${totalPages} • Total de cards: ${totalCards}`
        } : undefined
    });

    // Criar os botões de navegação
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId("cards/first")
            .setEmoji("⏮️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 1 || totalCards === 0),
        new ButtonBuilder()
            .setCustomId("cards/previous")
            .setEmoji("◀️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 1 || totalCards === 0),
        new ButtonBuilder()
            .setCustomId("cards/next")
            .setEmoji("▶️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === totalPages || totalCards === 0),
        new ButtonBuilder()
            .setCustomId("cards/last")
            .setEmoji("⏭️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === totalPages || totalCards === 0)
    );

    return { embeds: [embed], components: [buttons] };
}