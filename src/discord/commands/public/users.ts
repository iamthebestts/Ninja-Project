// src/commands/usuarios.ts
import { createCommand } from "#base";
import { db } from "#database";
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
} from "discord.js";

createCommand({
  name: "usuarios",
  description: "Gerencia informações dos usuários.",
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
  ],
  async run(interaction) {
    const { options } = interaction;
    switch (options.getSubcommand()) {
      case "ver": {
        const selectedUser =
          interaction.options.getUser("usuario") || interaction.member.user;
        const user = await db.users.get(selectedUser.id);

        if (!user) {
          return interaction.reply("Usuário não encontrado.");
        }
        const inventory = await user.getInventory();

        return await interaction.reply({
          content:
            `Informações do usuário:\n` +
            `ID: ${user.id}\n` +
            `Ryos: ${user.ryos}\n` +
            `Cartas no inventário: ${inventory.length}`,
        });
      }

      case "default": {
        return interaction.reply("Subcomando inválido.");
      }
    }
    return;
  },
});
