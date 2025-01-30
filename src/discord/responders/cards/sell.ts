import { createResponder, ResponderType } from "#base";
import { db } from "#database";
import { icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";

createResponder({
    customId: "cards/sell/:cardId",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction, params) {
        await interaction.deferUpdate();
        
        const { user } = interaction;
        
        const card = await db.cards.findById(params.cardId);
        if (!card) {
            return interaction.editReply({
                content: "❌ Card não encontrado!",
                components: []
            });
        }

        const dbUser = await db.users.get(user.id);
        if (!dbUser) {
            return interaction.editReply({
                content: "❌ Usuário não encontrado!",
                components: []
            });
        }

        // Verificar se o usuário tem o card
        const hasCard = dbUser.cards.some(c => c.toString() === card.id);
        if (!hasCard) {
            return interaction.editReply({
                content: "❌ Você não possui este card!",
                components: []
            });
        }

        // Calcular valor de venda (metade do preço)
        const sellPrice = Math.floor(card.price / 2);

        // Realizar a venda
        dbUser.cards = dbUser.cards.filter(c => c.toString() !== card.id);
        await dbUser.save();
        await dbUser.addRyos(sellPrice);

        // Buscar usuário atualizado
        const updatedUser = await db.users.get(user.id);

        const embed = createEmbed({
            color: settings.colors.success,
            image: card.image,
            description: brBuilder(
                `## ${icon.success} Venda realizada!`,
                `Você vendeu o card **${card.name}** por ${icon.Ryo} ${sellPrice}.`,
                "",
                `Valor recebido: **${icon.Ryo} ${sellPrice}**`,
                `Ryos atuais: **${icon.Ryo} ${updatedUser.ryos}**`
            ),
            footer: {
                text: `Ninja Project`,
                iconURL: interaction.guild.iconURL()
            }
        });

        return interaction.editReply({ 
            embeds: [embed],
            components: [],
        });
    }
});
