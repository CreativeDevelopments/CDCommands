const Command = require("../Command");
const prefixes = require("../../Database/models/prefixes");

module.exports = new Command({
    aliases: ["updateprefix"],
    botPermissions: ["SEND_MESSAGES"],
    cooldown: 3000,
    description: "Set the Prefix of the bot",
    details: "Update or reset the prefix of the bot in the current server",
    devOnly: false,
    dmOnly: false,
    globalCooldown: 0,
    guildOnly: true,
    maxArgs: Infinity,
    minArgs: 1,
    name: "setprefix",
    noDisable: true,
    nsfw: false,
    testOnly: false,
    usage: "{prefix}setprefix <new prefix>",
    userPermissions: ["MANAGE_GUILD"],
    category: "configuration",
    run: async ({ args, client, message, prefix }) => {
        let prefixDoc = client.databaseCache.getDocument("prefix", message.guild.id);
        if (!prefixDoc) prefixDoc = new prefixes({ gId: message.guild.id, prefix });

        const updatedPrefix = args.join(" ").trim();
        if (updatedPrefix === prefixDoc.prefix) {
            const res = client.defaultResponses.getValue("PREFIX_COMMAND", "SAME_PREFIX", []);
            return message.channel.send("", { embed: client.error({ msg: message, data: res })}).catch(_ => message.channel.send(res));
        }

        prefixDoc.prefix = updatedPrefix;

        if (client.databaseCache.getDocument("prefix", message.guild.id))
            client.databaseCache.updateDocument("prefix", message.guild.id, prefixDoc);
        else 
            client.databaseCache.insertDocument("prefix", prefixDoc);

        const successRes = client.defaultResponses.getValue("PREFIX_COMMAND", "SUCCESS", [
            {
                key: "GUILD_NAME",
                replace: message.guild.name,
            },
            {
                key: "PREFIX",
                replace: `\`${updatedPrefix}\``,
            }
        ]);
        return message.channel.send("", { embed: client.success({ msg: message, data: successRes })}).catch(_ => message.channel.send(successRes));
    }
});