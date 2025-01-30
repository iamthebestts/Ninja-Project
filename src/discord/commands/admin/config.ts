import { createCommand } from "#base";
import { menus } from "#menus";
import { ApplicationCommandType, PermissionFlagsBits } from "discord.js";

createCommand({
    name: "config",
    description: "⚙️ Configure o servidor",
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: [PermissionFlagsBits.Administrator],
    dmPermission: false,
    async run(interaction) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "❌ Você não tem permissão para usar este comando!",
                ephemeral: true
            });
        }
        
        return await menus.config.showConfig(interaction);
    }
});
