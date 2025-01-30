import { createResponder, ResponderType } from "#base";
import { db } from "#database";
import { icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";

createResponder({
  customId: "cards/buy/:cardId",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction, params) {
    await interaction.deferUpdate();

    const { user } = interaction;

    const card = await db.cards.findById(params.cardId);
    if (!card) {
      return interaction.editReply({
        content: "❌ Card não encontrado!",
        components: [],
      });
    }

    const dbUser = await db.users.get(user.id);
    if (!dbUser) {
      return interaction.editReply({
        content: "❌ Usuário não encontrado!",
        components: [],
      });
    }

    // Verificar se o usuário já tem o card
    const hasCard = dbUser.cards.some((c) => c.toString() === card.id);
    if (hasCard) {
      return interaction.editReply({
        content: "❌ Você já possui este card!",
        components: [],
      });
    }

    // Verificar se o usuário tem ryos suficientes
    if (dbUser.ryos < card.price) {
      return interaction.editReply({
        content: `❌ Você não tem ryos suficientes! Necessário: ${icon.Ryo} ${card.price}`,
        components: [],
      });
    }

    // Realizar a compra
    await dbUser.removeRyos(card.price);
    await dbUser.addCard(card);

    // Buscar usuário atualizado
    const updatedUser = await db.users.get(user.id);

    const embed = createEmbed({
      color: settings.colors.success,
      image: card.image,
      description: brBuilder(
        `## ${icon.success} Compra realizada!`,
        `Você comprou o card **${card.name}** por ${icon.Ryo} ${card.price}.`,
        "",
        `Preço: **${icon.Ryo} ${card.price}**`,
        `Ryos restantes: **${icon.Ryo} ${updatedUser.ryos}**`
      ),
    });

    return interaction.editReply({
      embeds: [embed],
      components: [],
    });
  },
});
