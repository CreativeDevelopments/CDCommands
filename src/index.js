const { Client, Collection, MessageEmbed } = require("discord.js");
const colors = require("colors");
const { mkdirSync, writeFileSync } = require("fs");
const { Model } = require("mongoose");
const { CDClient } = require("./Base/CDClient");
const {
  categories,
  requiredroles,
  commands,
  help,
  setprefix,
  language: lang,
  ticketconfig,
} = require("./Base/DefaultCommands");
const Commands = require("./registry/Commands");
const Events = require("./registry/Events");
const database = require("./Database/database");
const cooldown = require("./Database/models/cooldown");
const prefixes = require("./Database/models/prefixes");
const disabledCommands = require("./Database/models/disabled-commands");
const requiredRoles = require("./Database/models/required-roles");
const guildLanguage = require("./Database/models/guildLanguage");
const userLanguage = require("./Database/models/userLanguage");
const ticketConfig = require("./Database/models/ticketConfig");
const ticketSystem = require("./Database/models/tickets");
const Cooldowns = require("./Base/Handling/CooldownHandler");
const MessageJSON = require("./Base/Handling/MessageJSON");
const FeatureHandler = require("./Base/Handling/FeatureHandler");
const Cache = require("./Base/Handling/CacheHandler");
const Ticket = require("./Tickets");
class CDCommands {
  /**
   * @private
   * @type {CDClient}
   */
  _client;
  /**
   * @private
   * @type {string}
   */
  _commandsDir;
  /**
   * @private
   * @type {string}
   */
  _eventsDir;
  /**
   * @private
   * @type {string[]}
   */
  _testServers;
  /**
   * @private
   * @type {string[]}
   */
  _devs;
  /**
   * @private
   * @type {string}
   */
  _defaultPrefix;
  /**
   * @private
   * @type {string}
   */
  _mongoURI;
  /**
   * @private
   * @type {boolean}
   */
  _customMessageEvent;
  /**
   * @private
   * @type {boolean}
   */
  _customHelpCommand;
  /** @private */
  _cacheUpdateSpeed = 90 * 1000;

  /**
   * @param {Client} client
   * @param {{
   * commandsDir?: string;
   * eventsDir?: string;
   * testServers?: string[];
   * customMessageEvent?: boolean;
   * customHelpCommand?: boolean;
   * devs?: string[];
   * defaultPrefix: string;
   * mongoURI: string;
   * cacheUpdateSpeed?: number;
   * MessageJSONPath?: string;
   * }} options
   */
  constructor(client, options) {
    try {
      mkdirSync("./.vscode");
      writeFileSync(
        "./.vscode/settings.json",
        JSON.stringify(
          {
            "json.schemas": [
              {
                fileMatch: ["message.json", "messages.json"],
                url:
                  "./node_modules/cdcommands/src/Base/json-schema/message.json",
              },
            ],
          },
          null,
          2,
        ),
      );
      console.log(
        "[Success] ".green +
          ".vscode/settings.json has been initialized, you can now use intellisense with your" +
          " message.json ".green +
          "file!",
      );
    } catch (err) {}

    if (!options.commandsDir) options.commandsDir = "commands";
    if (!options.eventsDir) options.eventsDir = "events";
    if (!options.testServers) options.testServers = [];
    if (!options.devs) options.devs = [];
    if (!options.MessageJSONPath) options.MessageJSONPath = "";

    this._client = client;
    this._commandsDir = options.commandsDir;
    this._eventsDir = options.eventsDir;
    this._testServers = options.testServers;
    this._defaultPrefix = options.defaultPrefix;
    this._mongoURI = options.mongoURI;
    this._customMessageEvent = options.customMessageEvent;
    this._customHelpCommand = options.customHelpCommand;
    this._devs = options.devs;
    if (options.cacheUpdateSpeed && options.cacheUpdateSpeed > 0)
      this._cacheUpdateSpeed = options.cacheUpdateSpeed;

    this._client.commands = new Collection();
    this._client.aliases = new Collection();
    this._client.defaultPrefix = options.defaultPrefix;
    this._client.developers = this._devs;
    this._client.testservers = this._testServers;
    this._client.defaultResponses = new MessageJSON(options.MessageJSONPath);
    this._client.tickets = new Ticket(this._client, []);

    this._client.success = ({ msg, data }) => {
      const embed = new MessageEmbed()
        .setColor("#2FDD2C")
        .setDescription(`${data}`)
        .setFooter(`Order request by ${msg.author.tag}`);
      return embed;
    };

    this._client.error = ({ msg, data }) => {
      const embed = new MessageEmbed()
        .setColor("#C93131")
        .setDescription(`${data}`);
      return embed;
    };

    this._client.load = ({ msg, data }) => {
      const embed = new MessageEmbed()
        .setColor("#00DCFF")
        .setDescription(`${data}`);
      return embed;
    };

    this._client.info = ({ msg, data }) => {
      const embed = new MessageEmbed()
        .setColor("#00DCFF")
        .setDescription(`${data}`);
      return embed;
    };

    this._client.logReady = ({ data }) =>
      console.log(
        `${colors.brightGreen("[READY]")}`.white + colors.white(` ${data}`),
      );
    this._client.logError = ({ data }) =>
      console.log(
        `${colors.brightRed("[ERROR]")}`.white + colors.white(` ${data}`),
      );
    this._client.logWarn = ({ data }) =>
      console.log(
        `${colors.yellow("[WARN]")}`.white + colors.white(` ${data}`),
      );
    this._client.logInfo = ({ data }) =>
      console.log(
        `${colors.brightCyan("[INFO]")}`.white + colors.white(` ${data}`),
      );
    this._client.logDatabase = ({ data }) =>
      console.log(
        `${colors.brightGreen("[DATABASE]")}`.white + colors.white(` ${data}`),
      );

    this._init();
  }

  /**
   * @private
   * @param {{ [key: string]: { model: Model<any>; getBy: string } }} models
   */
  async _init() {
    if (this._mongoURI) await database(this._mongoURI);
    else
      this._client.logError({
        data:
          "Using mongoose with CDCommands is required, as some features will not function properly.",
      });

    this._client.databaseCache = new Cache({
      models: {
        cooldowns: {
          model: cooldown,
          getBy: "uId",
        },
        disabledcommands: {
          model: disabledCommands,
          getBy: "gId",
        },
        prefixes: {
          model: prefixes,
          getBy: "gId",
        },
        requriedroles: {
          model: requiredRoles,
          getBy: "gId",
        },
        guildLanguage: {
          model: guildLanguage,
          getBy: "gId",
        },
        userLanguage: {
          model: userLanguage,
          getBy: "uId",
        },
        ticketconfig: {
          model: ticketConfig,
          getBy: "gId",
        },
        ticketsystem: {
          model: ticketSystem,
          getBy: "gId",
        },
      },
      updateSpeed: this._cacheUpdateSpeed,
    });

    this._client.cooldowns = new Cooldowns(await cooldown.find(), this._client);

    this._client.getLanguage = ({ authorId, guildId }) => {
      if (!authorId || typeof authorId !== "string")
        this._client.logError({
          data:
            'An invalid "authorId" was provided for fn "getLanguage", unable to get author language, using "guildId" instead',
        });
      if (
        (!guildId || typeof guildId !== "string") &&
        (!authorId || typeof authorId !== "string")
      )
        this._client.logError({
          data:
            'An invalid "guildId" was provided for fn "getLanguage", unable to get guildLanguage, defaulting to "en" instead',
        });
      const uDBLang = this._client.databaseCache.getDocument(
        "userLanguage",
        authorId,
      );
      const gDBLang = this._client.databaseCache.getDocument(
        "guildLanguage",
        guildId,
      );

      return uDBLang ? uDBLang.language : gDBLang ? gDBLang.language : "en";
    };

    this._commands();
    this._events();
    new FeatureHandler(this._client, this._featuresDir);
  }

  /** @private */
  _commands() {
    this._client = Commands(
      this._commandsDir,
      this._client,
      this._customHelpCommand,
    );

    const customCommands = [
      setprefix,
      requiredroles,
      categories,
      commands,
      help,
      lang,
      ticketconfig,
    ];

    for (const command of customCommands) {
      if (
        command.name === "help" &&
        !this._customHelpCommand &&
        !this._client.commands.get("help")
      ) {
        this._client.commands.set(command.name, command);
        for (const alias of command.aliases)
          this._client.aliases.set(alias, command.name);
      } else if (!this._client.commands.get(command.name)) {
        this._client.commands.set(command.name, command);
        for (const alias of command.aliases)
          this._client.aliases.set(alias, command.name);
      }
    }

    this._client.logInfo({
      data: `CDCommands >> Loaded ${this._client.commands.size} commands`,
    });
  }

  /** @private */
  _events() {
    let totalEvents = Events(
      this._eventsDir,
      this._client,
      this._customMessageEvent,
    );

    // Default message event
    const MsgEvent = require("./Base/Message");
    if (!this._customMessageEvent) {
      this._client.on(MsgEvent.name, MsgEvent.run.bind(null, this._client));
      totalEvents++;
    }

    this._client.logInfo({
      data: `CDCommands >> Loaded ${totalEvents} events`,
    });
  }

  /** @public */
  get defaultPrefix() {
    return this._defaultPrefix;
  }

  /** @public */
  get testServers() {
    return this._testServers;
  }
}

module.exports = CDCommands;
module.exports.Event = require("./Base/Event");
module.exports.Command = require("./Base/Command");
module.exports.Ticket = require("./Tickets");
module.exports.Validator = require("./Base/Handling/ArgumentValidator");
module.exports.Feature = require("./Base/Feature");
module.exports.Models = {
  cooldown: require("./Database/models/cooldown"),
  disabledCommands: require("./Database/models/disabled-commands"),
  prefixes: require("./Database/models/prefixes"),
  requiredRoles: require("./Database/models/required-roles"),
  guildLanguage: require("./Database/models/guildLanguage"),
  userLanguage: require("./Database/models/userLanguage"),
  ticketConfig: require("./Database/models/ticketConfig"),
  ticketSystem: require("./Database/models/tickets"),
};
