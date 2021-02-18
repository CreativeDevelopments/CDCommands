const requiredRoles = require("../../Database/models/required-roles");
const Command = require("../Command");

module.exports = new Command({
    aliases: ["reqroles"],
    botPermissions: ["MANAGE_ROLES"],
    cooldown: 500,
    description: "Set or remove required roles",
    details: "Allows you to set or remove required roles for a specific command in the current server",
    devOnly: false,
    dmOnly: false,
    globalCooldown: 0,
    guildOnly: true,
    maxArgs: 3,
    minArgs: 3,
    name: "requiredroles",
    noDisable: true,
    nsfw: false,
    testOnly: false,
    usage: "{prefix}requiredroles [add/remove] [role] [command]",
    userPermissions: ["MANAGE_ROLES"],
    category: "configuration",
    run: async ({ args, client, message, prefix }) => {

        let reqRolesDoc = client.databaseCache.getDocument("roles", message.guild.id);
        if (!reqRolesDoc) reqRolesDoc = new requiredRoles({
            gId: message.guild.id,
        });

        const addRemove = args[0];
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
        const command = args[2];

        if (addRemove !== "add" && addRemove !== "remove") 
            return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments! Please use \`${prefix}requiredroles [add/remove] [role] [command]\` instead.` })});

        if (!role)
            return message.channel.send("", { embed: client.error({ msg: message, data: `Please provide a valid role to ${addRemove}.` })});

        if (!client.commands.get(command))
            return message.channel.send("", { embed: client.error({ msg: message, data: "That command does not exist. Please provide a valid command." })});

        const reqRolesObject = reqRolesDoc.requiredRoles.find((ob) => ob.command === command);
        if (addRemove === "add") {
            if (reqRolesObject) {
                if (reqRolesObject.roles.find((s) => s === role.id))
                    return message.channel.send("", { embed: client.error({ msg: message, data: `**${role.name}** is already on the required roles list of **${command}**` })})
                reqRolesObject.roles.push(role.id);
            } else {
                reqRolesDoc.requiredRoles.push({
                    command,
                    roles: [role.id]
                });
            }
        } else if (addRemove === "remove") {
            if (reqRolesObject) {
                if (!reqRolesObject.roles.find((s) => s === role.id))
                    return message.channel.send("", { embed: client.error({ msg: message, data: `**${role.name}** is not on the required roles list for **${command}**` })});
                const i = reqRolesObject.roles.findIndex((s) => s === role.id);
                reqRolesObject.roles.splice(i, 1);
                // English is hard
            } else return message.channel.send("", { embed: client.error({ msg: message, data: `**${role.name}** is not on the required roles list for **${command}**` })});
        } 


        if (!client.databaseCache.getDocument("roles", message.guild.id))
            client.databaseCache.insertDocument("roles", reqRolesDoc);
        else client.databaseCache.updateDocument("roles", message.guild.id, reqRolesDoc);

        return message.channel.send("", { embed: client.success({ msg: message, data: `Successfully ${addRemove === "add" ? "added" : "removed"} **${role.name}** ${addRemove === "add" ? "to" : "from"} the required roles list of **${command}**` })});
    }
});