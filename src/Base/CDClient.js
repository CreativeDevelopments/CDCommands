const { Collection, Client, Message, MessageEmbed } = require("discord.js");
const { Model } = require("mongoose");
const Cache = require("./Handling/CacheHandler");
const Cooldowns = require("./Handling/CooldownHandler");
const MessageJSON = require("./Handling/MessageJSON");

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
  /**
   * @type {Cache<{
   * cooldowns: {
   *   model: Model<any>,
   *   getBy: string,
   * };
   * disabledcommands: {
   *   model: Model<any>,
   *   getBy: string,
   * };
   * prefixes: {
   *   model: Model<any>,
   *   getBy: string,
   * };
   * requriedroles: {
   *   model: Model<any>,
   *   getBy: string,
   * };
   * language: {
   *   model: Model<any>,
   *   getBy: string,
   * }
   * }>}
   */
  databaseCache;
  /** @type {MessageJSON<import("./message.json")>} */
  defaultResponses;
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
  /** @type {({ data }: { data: string }) => console.log;} */
  logReady;
  /** @type {({ data }: { data: string }) => console.log;} */
  logInfo;
  /** @type {({ data }: { data: string }) => console.log;} */
  logError;
  /** @type {({ data }: { data: string }) => console.log;} */
  logWarn;
  /** @type {({ data }: { data: string }) => console.log;} */
  logDatabase;
}

module.exports.CDClient = CDClient;
