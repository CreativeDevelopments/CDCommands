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

        if (enabledDisabled !== "enable" && enabledDisabled !== "disable") {
            const res = client.defaultResponses.getValue("COMMANDS_COMMAND", "INVALED_ARGS_ERROR", [
                {
                    key: "USAGE",
                    replace: this.usage.replace(/{prefix}/g, prefix),
                }
            ]);
            return message.channel.send("", { embed: client.error({ msg: message, data: res })}).catch(_ => message.channel.send(res));
        }

        if (!commands.has(commandName)) {
            const res = client.defaultResponses.getValue("COMMANDS_COMMAND", "NON_EXISTANT_COMMAND", []);
            return message.channel.send("", { embed: client.error({ msg: message, data: res })}).catch(_ => message.channel.send(res));
        }

        if (enabledDisabled === "enable") {
            const res = client.defaultResponses.getValue("COMMANDS_COMMAND", "ALREADY_ENABLED", []);
            if (!DisabledDoc.commands.includes(commandName))
                return message.channel.send("", { embed: client.error({ msg: message, data: res })}).catch(_ => message.channel.send(res));
            const i = DisabledDoc.commands.findIndex((v) => v === commandName);
            DisabledDoc.commands.splice(i, 1);

        } else if (enabledDisabled === "disable") {
            if (client.commands.get(commandName).noDisable) {
                const res = client.defaultResponses.getValue("COMMANDS_COMMAND", "NO_DISABLE", [
                    {
                        key: "COMMAND",
                        replace: commandName,
                    }
                ]);
                return message.channel.send("", { embed: client.error({ msg: message, data: res })}).catch(_ => msg.channel.send(res));
            }

            if (DisabledDoc.commands.includes(commandName)) {
                const res = client.defaultResponses.getValue("COMMANDS_COMMAND", "ALREADY_DISABLED", []);
                return message.channel.send("", { embed: client.error({ msg: message, data: res })}).catch(_ => message.channel.send(res));
            }
            DisabledDoc.commands.push(commandName);
        }

        if (!client.databaseCache.getDocument("command", message.guild.id))
            client.databaseCache.insertDocument("command", DisabledDoc);
        else client.databaseCache.updateDocument("command", message.guild.id, DisabledDoc);

        const successRes = client.defaultResponses.getValue("COMMANDS_COMMAND", "SUCCESS", [
            {
                key: "ACTION",
                replace: `${enabledDisabled}d`,
            },
            {
                key: "COMMAND",
                replace: commandName,
            }
        ])

        return message.channel.send("", { embed: client.success({ msg: message, data: successRes })}).catch(_ => message.channel.send(successRes));
    }
});