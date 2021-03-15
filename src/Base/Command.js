<<<<<<< HEAD
const { Message } = require("discord.js");
=======
const {
  Message,
  GuildMember,
  GuildChannel,
  Role,
  GuildEmoji,
} = require("discord.js");
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
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

<<<<<<< HEAD
  /** @type {Validator} */
  validator;

=======
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
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

<<<<<<< HEAD
  /** @type {({ message, args, client, prefix, language }: { message: Message, args: string[]; client: CDClient; prefix: string; language: keyof import("./Handling/Languages.json")}) => Promise<unknown>;} */
=======
  /** @type {({ message, args, client, prefix }: { message: Message, args: string[]; client: CDClient; prefix: string }) => Promise<any>;} */
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
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
<<<<<<< HEAD
   * validator?: Validator;
=======
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
   * cooldown?: string | number;
   * globalCooldown?: string | number;
   * noDisable: boolean;
   * userPermissions?: import("discord.js").PermissionResolvable[];
   * botPermissions?: import("discord.js").PermissionResolvable[];
   * category: string;
<<<<<<< HEAD
   * run: ({ message, args, client, prefix, language }: { message: Message, args: string[]; client: CDClient; prefix: string; language: keyof import("./Handling/Languages.json")}) => Promise<unknown>;
=======
   * run: ({ message, args, client, prefix }: { message: Message, args: string[]; client: CDClient; prefix: string }) => Promise<any>;
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
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
<<<<<<< HEAD
    validator,
=======
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
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
<<<<<<< HEAD
    this.validator = validator;
=======
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
    this.usage = usage;
    this.testOnly = testOnly;
    this.nsfw = nsfw;
    this.noDisable = noDisable;
    this.userPermissions = userPermissions;
    this.run = run;
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
