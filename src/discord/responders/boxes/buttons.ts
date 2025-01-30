import { createResponder, ResponderType } from "#base";
import { db } from "#database";
import { icon } from "#functions";
import { boxes, BoxType } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";

createResponder({
  customId: "boxes/buy/:type",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction, params) {
    await interaction.deferUpdate();

    const boxType = params.type as BoxType;
    const box = boxes[boxType];

    const user = await db.users.get(interaction.user.id);

    // Verificar se tem ryos suficientes
    if (user.ryos < box.price) {
      return interaction.editReply({
        content: `${icon.danger} Você não tem ryos suficientes!`,
        embeds: [],
        components: [],
      });
    }

    // Buscar cards da mesma raridade
    const cards = await db.cards.find({ rarity: boxType }).lean();
    if (!cards.length) {
      return interaction.editReply({
        content: `${icon.danger} Não há cards disponíveis desta raridade!`,
        embeds: [],
        components: [],
      });
    }

    // Selecionar cards aleatórios
    const numCards =
      Math.floor(Math.random() * (box.maxCards - box.minCards + 1)) +
      box.minCards;
    const selectedCards = [];
    const usedIndexes = new Set();

    while (selectedCards.length < numCards && usedIndexes.size < cards.length) {
      const index = Math.floor(Math.random() * cards.length);
      if (!usedIndexes.has(index)) {
        usedIndexes.add(index);
        selectedCards.push(cards[index]);
      }
    }

    // Verificar cards repetidos e calcular reembolso
    const newCards = [];
    let refundTotal = 0;

    for (const card of selectedCards) {
      const hasCard = user.cards.some(
        (c) => c.toString() === card._id.toString()
      );
      if (hasCard) {
        refundTotal += Math.floor((box.price * 0.5) / numCards);
      } else {
        newCards.push(card);
      }
    }

    // Remover ryos e adicionar cards
    await user.removeRyos(box.price);
    if (refundTotal > 0) {
      await user.addRyos(refundTotal);
    }

    for (const card of newCards) {
      await user.addCard(card);
    }

    const embed = createEmbed({
      color: box.color,
      title: `${box.emoji} Cards Obtidos!`,
      description: brBuilder(
        selectedCards
          .map((card) => {
            const isRepetido = user.cards.some(
              (c) => c.toString() === card._id.toString()
            );
            return `${isRepetido ? "🔄" : "✨"} ${card.name} (${card.rarity})`;
          })
          .join("\n"),
        "",
        refundTotal > 0
          ? `\n💰 Reembolso por cards repetidos: ${icon.Ryo} ${refundTotal}`
          : ""
      ),
      fields: [
        {
          name: "Informações",
          value: brBuilder(
            `Cards novos: ${newCards.length}`,
            `Cards repetidos: ${selectedCards.length - newCards.length}`,
            `Total: ${selectedCards.length} cards`
          ),
        },
      ],
    });

    return interaction.editReply({
      embeds: [embed],
      components: [],
    });
  },
});
