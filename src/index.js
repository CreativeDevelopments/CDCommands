const { Client, Collection, MessageEmbed } = require("discord.js");
const { readdirSync, existsSync } = require("fs");
const { CDClient } = require("./Base/CDClient");
const { categories, requiredroles, commands, help, setprefix } = require("./Base/DefaultCommands");

const Event = require("./Base/Event");
const Commands = require("./registry/Commands");
const database = require("./Database/database");
const Cache = require("./Base/Handling/CacheHandler");
const cooldown = require("./Database/models/cooldown");
const prefixes = require("./Database/models/prefixes");
const disabledCommands = require("./Database/models/disabled-commands");
const requiredRoles = require("./Database/models/required-roles");
const Cooldowns = require("./Base/Handling/CooldownHandler");
const Events = require("./registry/Events");

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
     * }} options 
     */
    constructor(client, options) {

        if (!options.commandsDir) options.commandsDir = "commands";
        if (!options.eventsDir) options.eventsDir = "events";
        if (!options.testServers) options.testServers = [];
        if (!options.devs) options.devs = [];

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

        this._client.success = ({ msg, data }) => {
            const embed = new MessageEmbed()
                .setColor('#2FDD2C')
                .setDescription(`${data}`)
                .setFooter(`Order request by ${msg.author.tag}`);
            return embed;
        };

        this._client.error = ({ msg, data }) => {
            const embed = new MessageEmbed()
                .setColor('#C93131')
                .setDescription(`${data}`);
            return embed;
        };

        this._client.load = ({ msg, data }) => {
            const embed = new MessageEmbed()
                .setColor('#00DCFF')
                .setDescription(`${data}`);
            return embed;
        };

        this._client.info = ({ msg, data }) => {
            const embed = new MessageEmbed()
                .setColor('#00DCFF')
                .setDescription(`${data}`);
            return embed;
        };

        this._init();
    }

    /** @private */
    async _init() {
        if (this._mongoURI) await database(this._mongoURI);
        else throw new Error("Using mongoose with CDCommands is required, as some features will not function properly.");
        
        this._client.databaseCache = new Cache({
            cooldowns: await cooldown.find(),
            disabledcommands: await disabledCommands.find(),
            prefixes: await prefixes.find(),
            requiredroles: await requiredRoles.find(),
            updateSpeed: this._cacheUpdateSpeed,
        });

        this._client.cooldowns = new Cooldowns(
            await cooldown.find(),
            this._client,
        );

        this._commands();
        this._events();
    }

    /** @private */
    _commands() {
        this._client = Commands(this._commandsDir, this._client, this._customHelpCommand);

        const customCommands = [setprefix, requiredroles, categories, commands, help];

        for (const command of customCommands) {
            if (command.name === "help" && !this._customHelpCommand && !this._client.commands.get("help")) {
                this._client.commands.set(command.name, command);
                for (const alias of command.aliases)
                    this._client.aliases.set(alias, command.name);
            } else if (!this._client.commands.get(command.name)) {
                this._client.commands.set(command.name, command);
                for (const alias of command.aliases)
                    this._client.aliases.set(alias, command.name);
            }
        }

        console.log(`CDCommands >> Loaded ${this._client.commands.size} commands`);
    }

    /** @private */
    _events() {
        let totalEvents = Events(this._eventsDir, this._client, this._customMessageEvent);

        // Default message event
        const MsgEvent = require("./Base/Message");
        if (!this._customMessageEvent) { 
            this._client.on(MsgEvent.name, MsgEvent.run.bind(null, this._client));
            totalEvents++;
        }

        console.log(`CDCommands >> Loaded ${totalEvents} events`);
    }


    /** @public */
    get defaultPrefix() {
        return this._defaultPrefix;
    }

    /** @public */
    get testServers() {

    }
}


module.exports = CDCommands;
module.exports.Event = require("./Base/Event");
module.exports.Command = require("./Base/Command");
module.exports.Models = {
    cooldown: require("./Database/models/cooldown"),
    disabledCommands: require("./Database/models/disabled-commands"),
    prefixes: require("./Database/models/prefixes"),
    requiredRoles: require("./Database/models/required-roles"), 
};