import { createResponder, ResponderType } from "#base";
import { CardInterface, db } from "#database";
import { menus } from "#menus";

createResponder({
    customId: "cards/:action/:currentPage/:totalCards/:userId", // Adicionado userId
    types: [ResponderType.Button],
    cache: "cached",
    parse: (params) => ({
        action: params.action as "first" | "previous" | "next" | "last",
        currentPage: parseInt(params.currentPage),
        totalCards: parseInt(params.totalCards),
        userId: params.userId, // Recebe o ID do usuário
    }),
    async run(interaction, params) {
        try {
            // Verifica se o usuário que interagiu é o mesmo que executou o comando
            if (interaction.user.id !== params.userId) {
                await interaction.reply({
                    content: "❌ Apenas o usuário que executou o comando pode mudar de página.",
                    ephemeral: true,
                });
                return;
            }

            await interaction.deferUpdate();
            
            // Busca os cards mais recentes do banco de dados
            const cards = await db.cards.find().lean<CardInterface[]>();
            const currentTotalCards = cards.length;
            
            let newPage = params.currentPage;

            // Atualiza a página com base na ação
            switch (params.action) {
                case "first":
                    newPage = 1;
                    break;
                case "previous":
                    newPage = Math.max(1, newPage - 1);
                    break;
                case "next":
                    newPage = Math.min(currentTotalCards, newPage + 1);
                    break;
                case "last":
                    newPage = currentTotalCards;
                    break;
            }

            // Garantir que a página esteja dentro dos limites atuais
            newPage = Math.max(1, Math.min(newPage, currentTotalCards));

            // Atualiza a mensagem com a nova página
            await interaction.editReply(
                menus.cards.view({
                    currentPage: newPage,
                    totalCards: currentTotalCards,
                    cards: cards,
                    userId: params.userId, // Passa o userId para a próxima interação
                })
            );

        } catch (error) {
            console.error("Erro ao manipular botões dos cards:", error);
            
            const errorMessage = process.env.NODE_ENV === "development"
                ? `🚨 Erro: ${error instanceof Error ? error.message : "Desconhecido"}`
                : "⚠️ Ocorreu um erro ao processar sua solicitação!";

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
});