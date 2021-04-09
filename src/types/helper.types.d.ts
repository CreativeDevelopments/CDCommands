import { Client, MessageEmbed, Collection, Message, User } from "discord.js";
import { Model, Document } from "mongoose";
import { Parsed } from "parse-ms";

type MessageJSONEmbedArgs = [
  {
    key:
      | keyof typeof import("../Base/json-schema/replacers.json")["EMBED"]
      | keyof typeof import("../Base/json-schema/replacers.json");
    replace: string;
  },
];

type MessageJSONStringArgs = [
  {
    key: keyof typeof import("../Base/json-schema/replacers.json");
    replace: string;
  },
];

type MessageJSONArgs =
  | {
      title?: MessageJSONEmbedArgs;
      url?: MessageJSONEmbedArgs;
      author_name?: MessageJSONEmbedArgs;
      author_iconURL?: MessageJSONEmbedArgs;
      color?: MessageJSONEmbedArgs;
      fields?: [
        {
          name?: MessageJSONEmbedArgs;
          value?: MessageJSONEmbedArgs;
          inline?: MessageJSONEmbedArgs;
        },
      ];
      footer_text?: MessageJSONEmbedArgs;
      footer_iconURL?: MessageJSONEmbedArgs;
      timestamp?: MessageJSONEmbedArgs;
      thumbnail_url?: MessageJSONEmbedArgs;
      description?: MessageJSONEmbedArgs;
      image_url?: MessageJSONEmbedArgs;
    }
  | MessageJSONStringArgs;

export class Cache<
  T extends {
    [key: string]: {
      model: Model<any>;
      getBy: string;
    };
  }
> {
  private _cache: Collection<string, Collection<string, Document<any>>>;
  private _updateSpeed: number;
  private _options: { models: T; updateSpeed: number };

  public constructor(options: { models: T; updateSpeed: number });

  private _init(): Promise<void>;
  private _startUpdateCycle(): void;

  public getDocument(type: keyof T, findBy: string): Document<any>;
  public insertDocument(type: keyof T, doc: Document<any>): void;
  public updateDocument(type: keyof T, update: Document<any>): void;
  public deleteDocument(
    type: keyof T,
    findBy: string,
    document: Document<any>,
  ): Promise<void>;
}

export class MessageJSON<T extends typeof import("../Base/message.json")> {
  private _path: string;
  private _fileData: T;

  public constructor(messagePath?: string);

  public getValue<
    V extends keyof T["en"],
    S extends keyof T["en"][V] extends "embed"
      ? ""
      : T["en"][V] extends string
      ? ""
      : keyof T["en"][V]
  >(key: V, secondary_key: S, args: MessageJSONArgs): MessageEmbed | string;
}

export class Cooldowns {
  private _client: CDClient;
  private _cooldowns: Collection<string, Collection<string, Date>>;
  private _globalCoolDowns: Collection<string, Date>;

  public constructor(dbCooldowns: Array<Document<any>>, client: CDClient);

  private _init(DBcooldowns: Array<Document<any>>): void;

  public setCooldown(
    user: User,
    command: string,
    cooldown: Date,
    type: "global" | "local",
  ): void;

  public getRemainingCooldown(
    user: User,
    command: string,
    type: "global" | "local",
  ): Parsed;

  public isOnCooldown(
    user: User,
    command: string,
    cooldown: Date,
    type: "global" | "local",
  ): boolean;
}

export class CDClient extends Client {
  public commands: Collection<string, import("../Base/Command")>;
  public aliases: Collection<string, string>;
  public defaultPrefix: string;
  public databaseCache: Cache<{
    cooldowns: {
      model: Model<any>;
      getBy: string;
    };
    disabledcommands: {
      model: Model<
        Document<{
          gId: string;
          commands: string[];
          categories: string[];
        }>
      >;
      getBy: string;
    };
    prefixes: {
      model: Model<
        Document<{
          gId: string;
          prefix: string;
        }>
      >;
      getBy: string;
    };
    requriedroles: {
      model: Model<
        Document<{
          gId: string;
          requiredRoles: object[];
        }>
      >;
      getBy: string;
    };
    guildLanguage: {
      model: Model<
        Document<{
          gId: string;
          language: string;
        }>
      >;
      getBy: string;
    };
    userLanguage: {
      model: Model<
        Document<{
          uId: string;
          language: string;
        }>
      >;
      getBy: string;
    };
  }>;
  public defaultResponses: MessageJSON<typeof import("../Base/message.json")>;
  public cooldowns: Cooldowns;
  public developers: string[];
  public testservers: string[];
  public getLanguage: ({
    guildId,
    authorId,
  }: {
    guildId: string;
    authorId: string;
  }) => keyof typeof import("../Base/Handling/Languages.json");
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
