const DisabledCommands = require("../../Database/models/disabled-commands");
const Command = require("../Command");

module.exports = new Command({
    aliases: ["cmd"],
    botPermissions: ["SEND_MESSAGES"],
    cooldown: 3000,
    description: "Enable or disable commands",
    details: "Allows you to enable or disable specific commands in the current server",
    devOnly: false,
    dmOnly: false,
    globalCooldown: 0,
    guildOnly: true,
    maxArgs: 2,
    minArgs: 2,
    name: "command",
    noDisable: true,
    nsfw: false,
    testOnly: false,
    usage: "{prefix}command <enable/disable> <command>",
    userPermissions: ["MANAGE_GUILD"],
    category: "configuration",
    run: async ({ prefix, message, client, args }) => {
        let DisabledDoc = client.databaseCache.getDocument("command", message.guild.id);
        if (!DisabledDoc) DisabledDoc = new DisabledCommands({
            gId: message.guild.id,
            commands: [],
            categories: [],
        });

        const enabledDisabled = args[0];
        const commandName = args[1];
        const commands = new Set(client.commands.map(c => c.name));

        if (enabledDisabled !== "enable" && enabledDisabled !== "disable")
            return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments! Please use \`${prefix}command [enable/disable] [command]\` instead.` })}).catch(err => message.channel.send(`Invalid Arguments! Please use \`${prefix}command [enable/disable] [command]\` instead.`));

        if (!commands.has(commandName))
            return message.channel.send("", { embed: client.error({ msg: message, data: "That command does not exist." })}).catch(err => message.channel.send("That command does not exist."));

        if (enabledDisabled === "enable") {
            if (!DisabledDoc.commands.includes(commandName))
                return message.channel.send("", { embed: client.error({ msg: message, data: "That command is already enabled." })}).catch(err => message.channel.send("That command is already enabled."));
            const i = DisabledDoc.commands.findIndex((v) => v === commandName);
            DisabledDoc.commands.splice(i, 1);

        } else if (enabledDisabled === "disable") {
            if (client.commands.get(commandName).noDisable)
                return message.channel.send("", { embed: client.error({ msg: message, data: `**${commandName}** can not be disabled.` })}).catch(err => message.channel.send(`**${commandName}** can not be disabled.`));
            if (DisabledDoc.commands.includes(commandName))
                return message.channel.send("", { embed: client.error({ msg: message, data: "That command is already disabled" })}).catch(err => message.channel.send("That command is already disabled"));
            DisabledDoc.commands.push(commandName);
        }

        if (!client.databaseCache.getDocument("command", message.guild.id))
            client.databaseCache.insertDocument("command", DisabledDoc);
        else client.databaseCache.updateDocument("command", message.guild.id, DisabledDoc);

        return message.channel.send("", { embed: client.success({ msg: message, data: `Successfully ${enabledDisabled}d the **${commandName}** command` })}).catch(err => message.channel.send(`Successfully ${enabledDisabled}d the **${commandName}** command`));
    }
});