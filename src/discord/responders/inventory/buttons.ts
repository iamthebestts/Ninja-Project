import { db } from "#database";
import { menus } from "#menus";
import { createResponder, ResponderType } from "#base";

createResponder({
    customId: "inventory/:action/:currentPage/:userId",
    types: [ResponderType.Button],
    cache: "cached",
    parse: params => ({ 
        action: params.action, 
        currentPage: parseInt(params.currentPage), 
        userId: params.userId 
    }),
    async run(interaction, params) {
        // Verificar se o usuário que clicou é o mesmo que está vendo o inventário
        if (params.userId !== "self" && params.userId !== interaction.user.id) {
            return interaction.reply({
                content: "❌ Você não pode navegar pelo inventário de outra pessoa!",
                ephemeral: true
            });
        }

        const targetUser = params.userId === "self" ? interaction.user : await interaction.client.users.fetch(params.userId);
        const user = await db.users.get(targetUser.id);
        
        if (!user) {
            return interaction.reply({
                content: "❌ Usuário não encontrado!",
                ephemeral: true
            });
        }

        const inventory = await user.getInventory();
        if (!inventory.length) {
            return interaction.reply({
                content: `❌ ${targetUser.id === interaction.user.id ? "Você não possui" : `${targetUser.username} não possui`} nenhum card no momento!`,
                ephemeral: true
            });
        }

        // Ordenar cards por raridade (do mais raro para o mais comum)
        const rarityOrder = ["Divino", "Lendário", "Épico", "Raro", "Incomum", "Comum"];
        const sortedInventory = inventory.sort((a, b) => {
            const rarityA = rarityOrder.indexOf(a.rarity);
            const rarityB = rarityOrder.indexOf(b.rarity);
            return rarityA - rarityB;
        });

        let newPage = params.currentPage;
        if (params.action === "next") newPage++;
        if (params.action === "previous") newPage--;

        await interaction.update(
            menus.cards.inventory({
                currentPage: newPage,
                totalCards: inventory.length,
                cards: sortedInventory,
                userId: params.userId,
                username: targetUser.username
            })
        );
    },
});
