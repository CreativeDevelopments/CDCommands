import {
  Client,
  ClientEvents,
  PermissionResolvable,
  MessageEmbed,
  Collection,
  Message,
} from "discord.js";
import { Model, Document } from "mongoose";
// import Cache from "./src/Base/Handling/CacheHandler";
// import MessageJSON from "./src/Base/Handling/MessageJSON";
// import Cooldowns from "./src/Base/Handling/CooldownHandler";
// import Event from "./src/Base/Event";
// import ArgumentValidator from "./src/Base/Handling/ArgumentValidator";

class Cache<
  T extends {
    [key: string]: {
      model: Model<any>;
      getBy: string;
    };
  }
> {
  private _cache: Collection<
    string,
    Collection<string, Document<any>>
  > = new Collection();
  private _updateSpeed: number;
  private _options: { models: T; updateSpeed: number };

  public constructor(options: { models: T; updateSpeed: number });

  private async _init(): Promise<void>;
  private _startUpdateCycle(): void;

  public getDocument(type: keyof T, findBy: string): Document<any>;
  public insertDocument(type: keyof T, doc: Document<any>): void;
  public updateDocument(type: keyof T, update: Document<any>): void;
  public async deleteDocument(type: keyof T, findBy: string): Promise<void>;
}

class MessageJSON {}
class Cooldowns {}
class ArgumentValidator {}

class CDClient extends Client {
  public commands: Collection<string, import("./src/Base/Command")>;
  public aliases: Collection<string, string>;
  public defaultPrefix: string;
  public databaseCache: Cache<{
    cooldowns: {
      model: Model<{
        uId: string;
        type: string;
        name: string;
        cooldown: string;
      }>;
      getBy: string;
    };
    disabledcommands: {
      model: Model<{
        gId: string;
        commands: string[];
        categories: string[];
      }>;
      getBy: string;
    };
    prefixes: {
      model: Model<{
        gId: string;
        prefix: string;
      }>;
      getBy: string;
    };
    requriedroles: {
      model: Model<{
        gId: string;
        requiredRoles: object[];
      }>;
      getBy: string;
    };
    guildLanguage: {
      model: Model<{
        gId: string;
        language: string;
      }>;
      getBy: string;
    };
    userLanguage: {
      model: Model<{
        uId: string;
        language: string;
      }>;
      getBy: string;
    };
  }>;
  public defaultResponses: MessageJSON<
    typeof import("./src/Base/message.json")
  >;
  public cooldowns: Cooldowns;
  public developers: string[];
  public testservers: string[];
  public getLanguage: ({
    guildId,
    authorId,
  }: {
    guildId: string;
    authorId: string;
  }) => keyof typeof import("./src/Base/Handling/Languages.json");
  public error: ({ msg, data }: { msg: Message; data: string }) => MessageEmbed;
  public load: ({ msg, data }: { msg: Message; data: string }) => MessageEmbed;
  public success: ({
    msg,
    data,
  }: {
    msg: Message;
    data: string;
  }) => MessageEmbed;
  public info: ({ msg, data }: { msg: Message; data: string }) => MessageEmbed;
  public logReady: ({ data }: { data: string }) => void;
  public logInfo: ({ data }: { data: string }) => void;
  public logError: ({ data }: { data: string }) => void;
  public logWarn: ({ data }: { data: string }) => void;
  public logDatabase: ({ data }: { data: string }) => void;
  constructor();
}

export default class CDCommands {
  private _client: CDClient;
  private _commandsDir: string;
  private _eventsDir: string;
  private _featuresDir: string;
  private _testServers: string[];
  private _devs: string[];
  private _defaultPrefix: string;
  private _mongoURI: string;
  private _customMessageEvent: boolean;
  private _disabledDefaultCommands: (
    | "help"
    | "command"
    | "category"
    | "language"
    | "requiredroles"
    | "setprefix"
  )[];
  private _cacheUpdateSpeed: number = 90 * 1000;

  public constructor(
    client: Client,
    options: {
      commandsDir?: string;
      eventsDir?: string;
      featuresDir?: string;
      testServers?: string[];
      customMessageEvent?: boolean;
      MessageJSONPath?: string;
      disabledDefaultCommands?: Array<
        | "help"
        | "command"
        | "category"
        | "language"
        | "requiredroles"
        | "setprefix"
      >;
      devs?: string[];
      defaultPrefix: string;
      mongoURI: string;
      cacheUpdateSpeed?: number;
    },
  );

  public readonly defaultPrefix: string;
  public readonly testServers: string[];
}

export class Event<T extends keyof ClientEvents> {
  public name: T;
  public run: (
    client: CDClient,
    ...args: ClientEvents[T]
  ) => Promise<unknown> | unknown;

  public constructor(
    name: T,
    run: (
      client: CDClient,
      ...args: ClientEvents[T]
    ) => Promise<unknown> | unknown,
  );
}

export class Command {
  public name: string;
  public aliases: string = [];
  public description: string;
  public details: string;
  public minArgs: number;
  public maxArgs: number;
  public usage: string;
  public guildOnly: boolean = false;
  public testOnly: boolean = false;
  public dmOnly: boolean = false;
  public nsfw: boolean = false;
  public devOnly: boolean = false;
  public cooldown: string | number = 0;
  public globalCooldown: string | number = 0;
  public noDisable: boolean = false;
  public userPermissions: PermissionResolvable[] = [];
  public botPermissions: PermissionResolvable[] = [];
  public category: string;
  public validator: ArgumentValidator | undefined = undefined;

  public init: (client: CDClient) => Promise<unknown> | unknown;
  public run: ({
    message,
    args,
    client,
    prefix,
    language,
  }: {
    message: Message;
    args: string[];
    client: CDClient;
    prefix: string;
    language: keyof typeof import("./src/Base/Handling/Languages.json");
  }) => Promise<unknown> | unknown;

  constructor(options: {
    name: string;
    aliases?: string[];
    description: string;
    details: string;
    minArgs: number;
    maxArgs: number;
    usage: string;
    guildOnly?: boolean;
    testOnly?: boolean;
    dmOnly?: boolean;
    nsfw?: boolean;
    devOnly?: boolean;
    cooldown?: string | number;
    globalCooldown?: string | number;
    noDisable?: boolean;
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    category: string;
    validator?: ArgumentValidator | undefined;
    init?: (client: CDClient) => Promise<unknown> | unknown;
    run: ({
      message,
      args,
      client,
      prefix,
      language,
    }: {
      message: Message;
      args: string[];
      client: CDClient;
      prefix: string;
      language: keyof typeof import("./src/Base/Handling/Languages.json");
    }) => Promise<unknown> | unknown;
  });
}

export class Feature {
  constructor(run: (client: CDClient) => unknown | Promise<unknown>);
}

export class Validator {
  private _validate: ({
    message,
    args,
    client,
    prefix,
    language,
  }: {
    message: Message;
    args: string[];
    client: CDClient;
    prefix: string;
    language: keyof import("./Languages.json");
  }) => boolean | string | Promise<boolean | string>;
  private _onError: ({
    error,
    client,
    message,
    prefix,
    args,
    language,
  }: {
    error: string;
    client: CDClient;
    message: Message;
    prefix: string;
    args: string[];
    language: keyof import("./Languages.json");
  }) => unknown | Promise<unknown>;
  private _onSuccess: (message: Message) => unknown | Promise<unknown>;

  constructor(options: {
    validate: Validator["_validate"];
    onError: Validator["_onError"];
    onSuccess?: Validator["_onSuccess"];
  });

  public readonly onError: Validator["_onError"];
  public readonly onSuccess: Validator["_onSuccess"];
  public readonly validate: Validator["_validate"];
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
  guildLanguage: Model<{
    gId: string;
    language: string;
  }>;
  userLanguage: Model<{
    uId: string;
    language: string;
  }>;
};
