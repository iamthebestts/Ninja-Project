import { createResponder, ResponderType } from "#base";
import { db } from "#database";
import { menus } from "#menus";

interface PaginationState {
    currentPage: number;
    cards: any[];
}

const paginationStates = new Map<string, PaginationState>();

createResponder({
    customId: "cards/:action",
    types: [ResponderType.Button],
    cache: "cached",
    parse: params => ({
        action: params.action
    }),
    async run(interaction, params) {
        try {
            const { message } = interaction;
            
            // Recuperar o estado atual da paginação
            let state = paginationStates.get(message.id);
            
            if (!state) {
                // Se não houver estado, buscar os cards do banco de dados
                const cards = await db.cards.find().lean();
                state = {
                    currentPage: 1,
                    cards
                };
                paginationStates.set(message.id, state);
            }

            // Se não houver cards, não permitir navegação
            if (state.cards.length === 0) {
                return await interaction.update(menus.cards.view({
                    currentPage: 1,
                    totalCards: 0,
                    cards: []
                }));
            }

            const totalPages = Math.ceil(state.cards.length / 5);

            // Atualizar a página baseado na ação
            switch(params.action) {
                case "first":
                    state.currentPage = 1;
                    break;
                case "previous":
                    state.currentPage = Math.max(1, state.currentPage - 1);
                    break;
                case "next":
                    state.currentPage = Math.min(totalPages, state.currentPage + 1);
                    break;
                case "last":
                    state.currentPage = totalPages;
                    break;
                default:
                    return;
            }

            // Atualizar o estado no Map
            paginationStates.set(message.id, state);

            // Atualizar a mensagem
            await interaction.update(menus.cards.view({
                currentPage: state.currentPage,
                totalCards: state.cards.length,
                cards: state.cards
            }));

            // Limpar o estado após 5 minutos de inatividade
            setTimeout(() => {
                paginationStates.delete(message.id);
            }, 5 * 60 * 1000);

        } catch (error) {
            console.error("Erro ao manipular botões dos cards:", error);
            
            // Notificar o usuário do erro de forma amigável
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
                    ephemeral: true
                });
            }
        }
    }
});