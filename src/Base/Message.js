const { Message } = require("discord.js");
const Event = require("./Event");
const { ValidatePermissions, ProperCase, ValidateRoles, FormatCooldown } = require("../Functions");

module.exports = new Event("message", async (client, message) => {

    const prefix = message.guild ? client.databaseCache.getDocument("prefix", message.guild.id) ? client.databaseCache.getDocument("prefix", message.guild.id).prefix : client.defaultPrefix : client.defaultPrefix;

    const args = message.content.trim().slice(prefix.length).split(" ");
    const commandName = args.shift();

    if (!message.content.startsWith(prefix)) return;

    const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
    if (command) {
        // Guild Only
        if (command.guildOnly && !message.guild)
        return message.channel.send("", { embed: client.error({ msg: message, data: `${ProperCase(command.name)} can only be used in a server.` })}).catch(err => message.channel.send(`${ProperCase(command.name)} can only be used in a server.`));
        // DM only    
        if (command.dmOnly && message.guild)
        return message.channel.send("", { embed: client.error({ msg: message, data: `${ProperCase(command.name)} can only be used in my DMs.`})}).catch(err => message.channel.send(`${ProperCase(command.name)} can only be used in my DMs.`));
        // NSFW Channel
        if (!message.channel.nsfw && command.nsfw) 
        return message.channel.send("", { embed: client.error({ msg: message, data: `This command is locked to NSFW channels only!`})}).catch(err => message.channel.send(`This command is locked to NSFW channels only!`));
        // Category/Command Disabled
        const DisabledDoc = client.databaseCache.getDocument("command", message.guild.id);
        if (DisabledDoc && DisabledDoc.commands.includes(command.name))
            return message.channel.send("", { embed: client.error({ msg: message, data: `The ${command.name} command is currently disabled in this server. You can not use it.`})}).catch(err => message.channel.send(`The ${command.name} command is currently disabled in this server. You can not use it.`));
        else if (DisabledDoc && DisabledDoc.categories.includes(command.category) && !command.noDisable)
            return message.channel.send("", { embed: client.error({ msg: message, data: `The ${command.category} category is currently disabled in this server. You can not use commands from this category.`})}).catch(err => message.channel.send(`The ${command.category} category is currently disabled in this server. You can not use commands from this category.`));
        const memberPermCheck = ValidatePermissions(message.member.permissions.toArray(), command.userPermissions);
        const clientPermCheck = ValidatePermissions(message.guild.me.permissions.toArray(), command.botPermissions);
        // Client Permissions
        if (clientPermCheck.perms !== null)
            return message.channel.send("", { embed: client.error({ msg: message, data: `Woah there! I'm missing ${clientPermCheck.perms} permissions! Please give me ${clientPermCheck.length > 1 ? "these" : "this"} ${clientPermCheck.length > 1 ? "permissions" : "permission"} before using that command!`})}).catch(err => message.channel.send(`Woah there! I'm missing ${clientPermCheck.perms}! Please give me ${clientPermCheck.length > 1 ? "these" : "this"} ${clientPermCheck.length > 1 ? "permissions" : "permission"} before using that command!`));
        // Member Permissions
        if (memberPermCheck.perms !== null)
            return message.channel.send("", { embed: client.error({ msg: message, data: `Woah there! You're missing ${memberPermCheck.perms} permissions! Please get ${memberPermCheck.length > 1 ? "those" : "that"} ${memberPermCheck.length > 1 ? "permissions" : "permission"} before using that command!`})}).catch(err => message.channel.send(`Woah there! You're missing ${memberPermCheck.perms}! Please get ${memberPermCheck.length > 1 ? "those" : "that"} ${memberPermCheck.length > 1 ? "permissions" : "permission"} before using that command!`));
        // Required Roles
        const reqRolesDoc = client.databaseCache.getDocument("roles", message.guild.id);
        if (reqRolesDoc) {
            const rolesRes = ValidateRoles(reqRolesDoc, message.member, command);
            if (rolesRes)
                return message.channel.send("", { embed: client.error({ msg: message, data: `Looks like you're missing the ${rolesRes.length > 1 ? "roles" : "role"} **${rolesRes.roles}**! Make sure you get ${rolesRes.length > 1 ? "those roles" : "that role"} before using **${command.name}**.`})}).catch(err => message.channel.send(`Looks like you're missing the ${rolesRes.length > 1 ? "roles" : "role"} **${rolesRes.roles}**! Make sure you get ${rolesRes.length > 1 ? "those roles" : "that role"} before using **${command.name}**.`));
        }
        // Developer only
        if (command.devOnly && !client.developers.includes(message.author.id))
            return message.channel.send("", { embed: client.error({ msg: message, data: `You can't use this ${command.name}. It is locked to developers only.`})}).catch(err => message.channel.send(`You can't use this ${command.name}. It is locked to developers only.`));
        // Test Server only
        if (command.testOnly && !client.testservers.includes(message.guild.id))
            return message.channel.send("", { embed: client.error({ msg: message, data: `${ProperCase(command.name)} is locked to test servers only and this server is not one.`})}).catch(err => message.channel.send(`${ProperCase(command.name)} is locked to test servers only and this server is not one.`));
        // Max args
        if (command.maxArgs !== Infinity && args.length > command.maxArgs)
            return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments [Too Many Arguments]! Please use \`${command.usage.replace(/{prefix}/gi, prefix)}\` instead`})}).catch(err => message.channel.send(`Invalid Arguments [Too Many Arguments]; Please use \`${command.usage.replace(/{prefix}/gi, prefix)}\` instead`));
        // Min args
        if (command.minArgs !== -1 && args.length < command.minArgs)
            return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments [Too Few Arguments]! Please use \`${command.usage.replace(/{prefix}/gi, prefix)}\` instead`})}).catch(err => message.channel.send(`Invalid Arguments [Too Few Arguments]; Please use \`${command.usage.replace(/{prefix}/gi, prefix)}\` instead`));
        // Global Cooldown
        if (client.cooldowns.isOnCooldown(message.author, commandName, "global")) {
            const remainingTime = client.cooldowns.getRemainingCooldown(message.author, commandName, "global");
            if (remainingTime !== undefined)
            return message.channel.send("", { embed: client.error({ msg: message, data: `${ProperCase(command.name)} is on global cooldown! Please wait ${FormatCooldown(remainingTime)} before using it again.`})}).catch(err => message.channel.send(`${ProperCase(command.name)} is on global cooldown! Please wait ${FormatCooldown(remainingTime)} before using it again.`));
        }
        // Cooldown
        if (client.cooldowns.isOnCooldown(message.author, commandName, "local")) {
            const remainingTime = client.cooldowns.getRemainingCooldown(message.author, commandName, "local");
            if (remainingTime !== undefined) 
                return message.channel.send("", { embed: client.error({ msg: message, data: `You are on cooldown! Please wait ${FormatCooldown(remainingTime)} before using ${command.name} again.`})}).catch(err => message.channel.send(`You are on cooldown! Please wait ${FormatCooldown(remainingTime)} before using ${command.name} again.`));
        }

        client.cooldowns.setCooldown(message.author, commandName, new Date(Date.now() + command.globalCooldown), "global");
        client.cooldowns.setCooldown(message.author, commandName, new Date(Date.now() + command.cooldown), "local");

        return command.run({ message, args, client, prefix });
    }

});