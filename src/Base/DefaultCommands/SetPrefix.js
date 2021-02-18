const Command = require("../Command");
const prefixes = require("../../Database/models/prefixes");

module.exports = new Command({
    aliases: ["updateprefix"],
    botPermissions: ["SEND_MESSAGES"],
    cooldown: 500,
    description: "Set the Prefix of the bot",
    details: "Update or reset the prefix of the bot in the current server",
    devOnly: false,
    dmOnly: false,
    globalCooldown: 500,
    guildOnly: true,
    maxArgs: Infinity,
    minArgs: 1,
    name: "setprefix",
    noDisable: true,
    nsfw: false,
    testOnly: false,
    usage: "{prefix}setprefix [new prefix]",
    userPermissions: ["MANAGE_GUILD"],
    category: "defaultCommands",
    run: async ({ args, client, message, prefix }) => {
        let prefixDoc = client.databaseCache.getDocument("prefix", message.guild.id);
        if (!prefixDoc) prefixDoc = new prefixes({ gId: message.guild.id, prefix });

        const updatedPrefix = args.join(" ").trim();
        if (updatedPrefix === prefixDoc.prefix)
            return message.channel.send("Please choose a **new** prefix to set.");

        prefixDoc.prefix = updatedPrefix;

        if (client.databaseCache.getDocument("prefix", message.guild.id))
            client.databaseCache.updateDocument("prefix", message.guild.id, prefixDoc);
        else 
            client.databaseCache.insertDocument("prefix", prefixDoc);

        return message.channel.send(`Successfully updated ${message.guild.name}'s prefix to \`${updatedPrefix}\``);
    }
});