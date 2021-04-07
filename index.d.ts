import {
  Client,
  ClientEvents,
  PermissionResolvable,
  MessageEmbed,
  Collection,
  Message,
} from "discord.js";
import { Model } from "mongoose";
import Cache from "./src/Base/Handling/CacheHandler";
import MessageJSON from "./src/Base/Handling/MessageJSON";
import Cooldowns from "./src/Base/Handling/CooldownHandler";
import Event from "./src/Base/Event";
import ArgumentValidator from "./src/Base/Handling/ArgumentValidator";

class CDClient extends Client {
  commands: Collection<string, import("./src/Base/Command")>;
  aliases: Collection<string, string>;
  defaultPrefix: string;
  databaseCache: Cache<{
    cooldowns: {
      model: Model<any>;
      getBy: string;
    };
    disabledcommands: {
      model: Model<any>;
      getBy: string;
    };
    prefixes: {
      model: Model<any>;
      getBy: string;
    };
    requriedroles: {
      model: Model<any>;
      getBy: string;
    };
    guildLanguage: {
      model: Model<any>;
      getBy: string;
    };
    userLanguage: {
      model: Model<any>;
      getBy: string;
    };
  }>;
  defaultResponses: MessageJSON<typeof import("./src/Base/message.json")>;
  cooldowns: Cooldowns;
  developers: string[];
  testservers: string[];
  getLanguage: ({
    guildId,
    authorId,
  }: {
    guildId: string;
    authorId: string;
  }) => keyof typeof import("./src/Base/Handling/Languages.json");
  error: ({ msg, data }: { msg: Message; data: string }) => MessageEmbed;
  load: ({ msg, data }: { msg: Message; data: string }) => MessageEmbed;
  success: ({ msg, data }: { msg: Message; data: string }) => MessageEmbed;
  info: ({ msg, data }: { msg: Message; data: string }) => MessageEmbed;
  logReady: ({ data }: { data: string }) => void;
  logInfo: ({ data }: { data: string }) => void;
  logError: ({ data }: { data: string }) => void;
  logWarn: ({ data }: { data: string }) => void;
  logDatabase: ({ data }: { data: string }) => void;
}

export default class CDCommands {
  public constructor(
    client: Client,
    options: {
      commandsDir?: string;
      eventsDir?: string;
      featuresDir?: string;
      testServers?: string[];
      customMessageEvent?: boolean;
      MessageJSONPath?: string;
      disabledDefaultCommands: Array<
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
  public constructor(
    name: T,
    run: (
      client: CDClient,
      ...args: ClientEvents[T]
    ) => Promise<unknown> | unknown,
  );
}

export class Command {
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
    validator?: ArgumentValidator;
    init?: (client: CDClient) => Promise<unknown> | unknown;
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

export class Feature {
  constructor(run: (client: CDClient) => unknown | Promise<unknown>);
}

export class Validator {
  constructor(options: {
    validate: ({
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
    }) => boolean | string | Promise<boolean | string>;
    onError: ({
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
      language: keyof typeof import("./src/Base/Handling/Languages.json");
    }) => void | Promise<void>;
    onSuccess?: (message: Message) => void | Promise<void>;
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
  guildLanguage: Model<{
    gId: string;
    language: string;
  }>;
  userLanguage: Model<{
    uId: string;
    language: string;
  }>;
};
