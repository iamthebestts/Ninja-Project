import { createResponder, ResponderType } from "#base";
import { db } from "#database";
import { menus } from "#menus";

const rarityOrder = ["Divino", "Lendário", "Épico", "Raro", "Incomum", "Comum"];

createResponder({
    customId: "inventory/:action/:currentPage/:totalPages/:userId",
    types: [ResponderType.Button],
    cache: "cached",
    parse: (params) => ({
        action: params.action as "first" | "previous" | "next" | "last",
        currentPage: parseInt(params.currentPage),
        totalPages: parseInt(params.totalPages),
        userId: params.userId
    }),
    async run(interaction, params) {
        try {
            // Verificar permissão do usuário
            if (params.userId !== "self" && interaction.user.id !== params.userId) {
                return interaction.reply({
                    content: "❌ Você não pode navegar neste inventário!",
                    ephemeral: true
                });
            }

            await interaction.deferUpdate();

            // Buscar dados atualizados
            const targetUser = params.userId === "self" 
                ? interaction.user 
                : await interaction.client.users.fetch(params.userId);
            
            const user = await db.users.get(targetUser.id);
            if (!user) {
                return interaction.editReply(
                    menus.cards.inventory({
                        currentPage: 1,
                        totalCards: 0,
                        cards: [],
                        userId: params.userId,
                        username: targetUser.username
                    })
                );
            }

            const inventory = await user.getInventory();
            const sortedInventory = inventory.sort((a, b) => 
                rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity)
            );

            const totalPages = Math.max(1, sortedInventory.length);
            let newPage = params.currentPage;

            switch (params.action) {
                case "first": newPage = 1; break;
                case "previous": newPage = Math.max(1, newPage - 1); break;
                case "next": newPage = Math.min(totalPages, newPage + 1); break;
                case "last": newPage = totalPages; break;
            }

            await interaction.editReply(
                menus.cards.inventory({
                    currentPage: newPage,
                    totalCards: sortedInventory.length,
                    cards: sortedInventory,
                    userId: params.userId,
                    username: targetUser.username
                })
            );

        } catch (error) {
            console.error("Erro na paginação do inventário:", error);

            const errorMessage = process.env.NODE_ENV === "development"
                ? `🚨 Erro: ${error instanceof Error ? error.message : "Desconhecido"}`
                : "⚠️ Ocorreu um erro ao processar sua solicitação!";

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
        return;
    }
});