import { Client, ClientEvents, PermissionResolvable } from "discord.js";
import { Model } from "mongoose";
import { CDClient } from "./Base/CDClient";
import Event from "./Base/Event";

export default class CDCommands {
    private _client: CDClient;
    private _commandsDir: string;
    private _eventsDir: string;
    private _testServers: string[];
    private _devs: string[];
    private _defaultPrefix: string;
    private _mongoURI: string;
    private _customMessageEvent: boolean;
    private _customHelpCommand: boolean;
    private _cacheUpdateSpeed = 90 * 1000;

    public constructor(
        client: Client,
        options: {
            commandsDir?: string;
            eventsDir?: string;
            testServers?: string[];
            customMessageEvent?: boolean;
            customHelpCommand?: boolean;
            devs?: string[];
            defaultPrefix: string;
            mongoURI: string;
            cacheUpdateSpeed?: number;
        }
    );

    private _init(): Promise<void>;
    private _commands(): Promise<void>;
    private _events(): Promise<void>;

    public readonly defaultPrefix: string;
    public readonly testServers: string[];
}

export class Event {
    public name: keyof ClientEvents;
    public run(client: CDClient, ...args: ClientEvents[keyof ClientEvents]): Promise<any>;

    public constructor(name: Event["name"], run: Event["run"]);
}

export class Command {
    public name: string;
    public aliases?: string[];
    public description: string;
    public details: string;
    public minArgs: number;
    public maxArgs: number;
    public usage: string;
    public guildOnly: boolean;
    public testOnly: boolean;
    public dmOnly: boolean;
    public nsfw: boolean;
    public devOnly: boolean;
    public cooldown?: string | number;
    public globalCooldown?: string | number;
    public noDisable: boolean;
    public userPermissions?: PermissionResolvable[];
    public botPermissions?: PermissionResolvable[];
    public category: string;
    public run(context: { message: Message; args: string[]; client: CDClient; prefix: string }): Promise<any>;

    constructor(options: {
        name: string;
        aliases?: string[];
        description: string;
        details: string;
        minArgs: number;
        maxArgs: number;
        usage: string;
        guildOnly: boolean;
        testOnly: boolean;
        dmOnly: boolean;
        nsfw: boolean;
        devOnly: boolean;
        cooldown?: string | number;
        globalCooldown?: string | number;
        noDisable: boolean;
        userPermissions?: PermissionResolvable[];
        botPermissions?: PermissionResolvable[];
        category: string;
        run: ({
            message,
            args,
            client,
            prefix,
        }: {
            message: Message;
            args: string[];
            client: CDClient;
            prefix: string;
        }) => Promise<any>;
    });
}

export const Models: {
    cooldown: Model<{
        uId: string;
        type: string;
        name: string;
        cooldown: string;
    }>;
    disabledCommands: Model<{
        gId: string;
        commands: string[];
        categories: string[];
    }>;
    prefixes: Model<{
        gId: string;
        prefix: string;
    }>;
    requiredRoles: Model<{
        gId: string;
        requiredRoles: object[];
    }>;
};
