// src/commands/users.ts
import { createCommand } from "#base";
import { db } from "#database";
import { icon } from "#functions";
import { menus } from "#menus";
import { settings } from "#settings";
import { brBuilder, createEmbed } from "@magicyan/discord";
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    AutocompleteInteraction
} from "discord.js";

createCommand({
    name: "user",
    description: "Sistema de usuários do Naruto",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "ver",
            description: "Visualiza as informações de um usuário.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "usuario",
                    description: "Selecione um usuário para ver as informações",
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
            ],
        },
        {
            name: "inventario",
            description: "Visualiza o inventário de cards de um usuário",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "usuario",
                    description: "Usuário para ver o inventário (opcional)",
                    type: ApplicationCommandOptionType.User,
                    required: false
                },
                {
                    name: "card",
                    description: "Card específico para visualizar (opcional)",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    autocomplete: true
                }
            ]
        }
    ],
    async autocomplete(interaction: AutocompleteInteraction) {
        const { options } = interaction;
        const subcommand = options.getSubcommand();
        const focused = options.getFocused(true);

        if (subcommand === "inventario" && focused.name === "card") {
            const search = focused.value.toLowerCase();
            // No autocomplete, não podemos pegar o usuário, então usamos sempre o autor
            const user = await db.users.get(interaction.user.id);
            
            if (!user) {
                return interaction.respond([]);
            }

            // Buscar apenas os cards que o usuário possui
            const userCards = await db.cards.find({
                _id: { $in: user.cards },
                name: { $regex: search, $options: "i" }
            }).limit(25);

            await interaction.respond(
                userCards.map(card => ({
                    name: card.name,
                    value: card.name
                }))
            );
        }
    },
    async run(interaction) {
        const { options } = interaction;
        const subcommand = options.getSubcommand();

        switch (subcommand) {
            case "ver": {
                const targetUser = options.getUser("usuario") || interaction.user;
                const user = await db.users.get(targetUser.id);

                if (!user) {
                    return interaction.reply({
                        content: "❌ Usuário não encontrado!",
                        flags
                    });
                }

                const embed = createEmbed({
                    color: settings.colors.default,
                    description: brBuilder(
                        `## Perfil de ${targetUser.username}`,
                        "",
                        `${icon.Ryo} **Ryos:** ${user.ryos}`,
                        `🏆 **Rank:** ${user.rank}`,
                        `🃏 **Cartas no inventário:** ${user.cards.length}`,
                    ),
                    thumbnail: targetUser.displayAvatarURL(),
                    footer: {
                        text: `Ninja Project`,
                        iconURL: interaction.guild.iconURL()
                    }
                });

                return interaction.reply({ embeds: [embed], flags });
            }

            case "inventario": {
                await interaction.deferReply();

                const targetUser = options.getUser("usuario") || interaction.user;
                const user = await db.users.get(targetUser.id);
                if (!user) {
                    return interaction.editReply({
                        content: "❌ Usuário não encontrado!"
                    });
                }

                const cardName = options.getString("card");
                
                // Se um nome específico foi fornecido, mostrar detalhes desse card
                if (cardName) {
                    const card = await db.cards.getCardByName(cardName);
                    if (!card) {
                        return interaction.editReply({
                            content: "❌ Card não encontrado!"
                        });
                    }

                    // Verificar se o usuário tem o card
                    const hasCard = user.cards.some(c => c.toString() === card.id);
                    if (!hasCard) {
                        return interaction.editReply({
                            content: `❌ ${targetUser.id === interaction.user.id ? "Você não possui" : `${targetUser.username} não possui`} este card!`
                        });
                    }

                    const embed = createEmbed({
                        color: settings.colors.default,
                        title: `${card.name} - ${card.rarity}`,
                        thumbnail: card.image,
                        description: card.description,
                        fields: [
                            {
                                name: "Valor",
                                value: `${icon.Ryo} ${card.price}`,
                                inline: true
                            },
                            {
                                name: "Valor de venda",
                                value: `${icon.Ryo} ${Math.floor(card.price / 2)}`,
                                inline: true
                            },
                            {
                                name: "Atributos",
                                value: [
                                    `**Força:** ${card.strength}`,
                                    `**Velocidade:** ${card.speed}`,
                                    `**Inteligência:** ${card.intelligence}`,
                                    `**Controle de Chakra:** ${card.chakraControl}`,
                                    `**Ninjutsu:** ${card.ninjutsu}`,
                                    `**Genjutsu:** ${card.genjutsu}`,
                                    `**Taijutsu:** ${card.taijutsu}`
                                ].join("\n")
                            },
                            {
                                name: "Informações",
                                value: [
                                    `**Clã:** ${card.clan}`,
                                    `**Vila:** ${card.village}`,
                                    `**Rank:** ${card.rank}`,
                                    `**Tipo de Chakra:** ${card.chakraType.join(", ")}`
                                ].join("\n")
                            },
                            {
                                name: "Habilidades Especiais",
                                value: card.specialAbilities.join(", ") || "Nenhuma"
                            }
                        ],
                        footer: {
                            text: `Inventário de ${targetUser.username}`,
                            iconURL: targetUser.displayAvatarURL()
                        }
                    });

                    return interaction.editReply({ embeds: [embed] });
                }

                // Caso contrário, listar todos os cards do inventário
                const inventory = await user.getInventory();
                if (!inventory.length) {
                    return interaction.editReply({
                        content: `❌ ${targetUser.id === interaction.user.id ? "Você não possui" : `${targetUser.username} não possui`} nenhum card no momento!`
                    });
                }

                // Ordenar cards por raridade (do mais raro para o mais comum)
                const rarityOrder = ["Divino", "Lendário", "Épico", "Raro", "Incomum", "Comum"];
                const sortedInventory = inventory.sort((a, b) => {
                    const rarityA = rarityOrder.indexOf(a.rarity);
                    const rarityB = rarityOrder.indexOf(b.rarity);
                    return rarityA - rarityB;
                });

                return interaction.editReply(
                    menus.cards.inventory({
                        currentPage: 1,
                        totalCards: inventory.length,
                        cards: sortedInventory,
                        userId: targetUser.id === interaction.user.id ? "self" : targetUser.id,
                        username: targetUser.username
                    })
                );
            }

            default: {
                return interaction.reply("Subcomando inválido.");
            }
        }
    }
});
