const { Message, GuildMember, GuildChannel, Role, GuildEmoji } = require("discord.js");
const { CDClient } = require("./CDClient");

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

    /** @type {({ message, args, client, prefix }: { message: Message, args: string[]; client: CDClient; prefix: string }) => Promise<any>;} */
    run;

    
    /**
     * @param {{ 
     * name: string; 
     * aliases: string[]; 
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
     * cooldown: string | number;
     * globalCooldown: string | number;
     * noDisable: boolean;
     * userPermissions: import("discord.js").PermissionResolvable[];
     * botPermissions: import("discord.js").PermissionResolvable[];
     * category: string;
     * run: ({ message, args, client, prefix }: { message: Message, args: string[]; client: CDClient; prefix: string }) => Promise<any>;
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
        devOnly,
        cooldown,
        globalCooldown,
        noDisable,
        userPermissions,
        botPermissions,
        category,
        run,
    }) {
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
        this.usage = usage;
        this.testOnly = testOnly;
        this.nsfw = nsfw;
        this.noDisable = noDisable;
        this.userPermissions = userPermissions;
        this.run = run; 
    };
}