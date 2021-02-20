const { Collection, Client, Message, MessageEmbed } = require("discord.js");
const Cache = require("./Handling/CacheHandler");
const Cooldowns = require("./Handling/CooldownHandler");

/**
 * @extends {Client}
 */
class CDClient extends Client {
    /** @type {Collection<string, import("./Command")>} */
    commands;
    /** @type {Collection<string, string>} */
    aliases;
    /** @type {string} */
    defaultPrefix;
    /** @type {Cache} */
    databaseCache;
    /** @type {Cooldowns} */
    cooldowns;
    /** @type {string[]} */
    developers;
    /** @type {string[]} */
    testservers;

    /** @type {({ msg, data }: { msg: Message; data: string }) => MessageEmbed;} */
    error;
    /** @type {({ msg, data }: { msg: Message; data: string }) => MessageEmbed;} */
    load;
    /** @type {({ msg, data }: { msg: Message; data: string }) => MessageEmbed;} */
    success;
    /** @type {({ msg, data }: { msg: Message; data: string }) => MessageEmbed;} */
    info;
    
}

module.exports.CDClient = CDClient;