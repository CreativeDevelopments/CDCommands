const DisabledCommands = require("../../Database/models/disabled-commands");
const Command = require("../Command");

module.exports = new Command({
    aliases: ["categories"],
    botPermissions: ["SEND_MESSAGES"],
    cooldown: 500,
    description: "Enable or disable categories",
    details: "Allows you to enable or disable entire categories of bot commands in the current server",
    devOnly: false,
    dmOnly: false,
    globalCooldown: 0,
    guildOnly: true,
    maxArgs: 2,
    minArgs: 2,
    name: "category",
    noDisable: true,
    nsfw: false,
    testOnly: false,
    usage: "{prefix}category [enable/disable] [category]",
    userPermissions: ["MANAGE_GUILD"],
    category: "defaultCommands",
    run: ({ args, client, message, prefix }) => {
        let DisabledDoc = client.databaseCache.getDocument("command", message.guild.id);
        if (!DisabledDoc) DisabledDoc = new DisabledCommands({
            gId: message.guild.id,
            commands: [],
            categories: [],
        });

        const enabledDisabled = args[0];
        const categoryName = args[1];
        const categories = new Set(client.commands.map(c => c.category));

        if (enabledDisabled !== "enabled" && enabledDisabled !== "disable")
            return message.channel.send(`Invaled Syntax; Please use \`${prefix}command [enable/disable] [category]\` instead.`);

        if (!categories.has(categoryName))
            return message.channel.send("That category does not exist.");

        if (enabledDisabled === "enable") {
            if (!DisabledDoc.categories.includes(categoryName))
                return message.channel.send("That category is already enabled.");
            const i = DisabledDoc.categories.findIndex((v) => v === categoryName);
            DisabledDoc.categories.splice(i, 1);

        } else if (enabledDisabled === "disable") {
            if (DisabledDoc.categories.includes(categoryName))
                return message.channel.send("That category is already disabled");
            DisabledDoc.categories.push(categoryName);
        }

        if (!client.databaseCache.getDocument("command", message.guild.id))
            client.databaseCache.insertDocument("command", DisabledDoc);
        else client.databaseCache.updateDocument("command", message.guild.id, DisabledDoc);

        return message.channel.send(`Successfully ${enabledDisabled}d the **${categoryName}** category`);
    }
});