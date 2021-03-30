  
const { Message } = require("discord.js");
const { CDClient } = require("./CDClient");
const Validator = require("./Handling/ArgumentValidator");

module.exports = class Command {
  /** @type {string} */
  name;

  /** @type {string[]} */
  aliases;

  /** @type {string} */
  description;

  /** @type {string} */
  details;

  /** @type {number} */
  minArgs;

  /** @type {number} */
  maxArgs;

  /** @type {string} */
  usage;

  /** @type {boolean} */
  guildOnly;

  /** @type {boolean} */
  testOnly;

  /** @type {boolean} */
  dmOnly;

  /** @type {boolean} */
  nsfw;

  /** @type {boolean} */
  devOnly;

  /** @type {Validator} */
  validator;

  /** @type {number} */
  cooldown;

  /** @type {number} */
  globalCooldown;

  /** @type {boolean} */
  noDisable;

  /** @type {import("discord.js").PermissionResolvable[]} */
  userPermissions;

  /** @type {import("discord.js").PermissionResolvable[]} */
  botPermissions;

  /** @type {string} */
  category;

  /** @type {({ message, args, client, prefix, language }: { message: Message, args: string[]; client: CDClient; prefix: string; language: keyof import("./Handling/Languages.json")}) => Promise<unknown>;} */
  run;

  /**
   * @param {{
   * name: string;
   * aliases?: string[];
   * description: string;
   * details: string;
   * minArgs: number;
   * maxArgs: number;
   * usage: string;
   * guildOnly: boolean;
   * testOnly: boolean;
   * dmOnly: boolean;
   * nsfw: boolean;
   * devOnly: boolean;
   * validator?: Validator;
   * cooldown?: string | number;
   * globalCooldown?: string | number;
   * noDisable: boolean;
   * userPermissions?: import("discord.js").PermissionResolvable[];
   * botPermissions?: import("discord.js").PermissionResolvable[];
   * category: string;
   * run: ({ message, args, client, prefix, language }: { message: Message, args: string[]; client: CDClient; prefix: string; language: keyof import("./Handling/Languages.json")}) => Promise<unknown>;
   *}} CommandOptions
   */
  constructor({
    name,
    aliases,
    description,
    details,
    minArgs,
    maxArgs,
    usage,
    guildOnly,
    testOnly,
    dmOnly,
    nsfw,
    validator,
    devOnly,
    cooldown,
    globalCooldown,
    noDisable,
    userPermissions,
    botPermissions,
    category,
    run,
  }) {
    if (!aliases) aliases = [];
    if (!userPermissions) userPermissions = [];
    if (!botPermissions) botPermissions = [];
    if (!cooldown) cooldown = 0;
    if (!globalCooldown) globalCooldown = 0;

    this.aliases = aliases;
    this.botPermissions = botPermissions;
    this.cooldown = cooldown;
    this.description = description;
    this.details = details;
    this.devOnly = devOnly;
    this.dmOnly = dmOnly;
    this.globalCooldown = globalCooldown;
    this.guildOnly = guildOnly;
    this.maxArgs = maxArgs;
    this.minArgs = minArgs;
    this.category = category;
    this.name = name;
    this.validator = validator;
    this.usage = usage;
    this.testOnly = testOnly;
    this.nsfw = nsfw;
    this.noDisable = noDisable;
    this.userPermissions = userPermissions;
    this.run = run;
  }
};