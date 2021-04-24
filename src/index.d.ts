import {
  Client,
  ClientEvents,
  PermissionResolvable,
  Message,
} from "discord.js";
import { Model, Document } from "mongoose";

import { CDClient } from "./types/helper.types";
export class CDCommands {
  private _client: CDClient;
  private _commandsDir: string;
  private _eventsDir: string;
  private _featuresDir: string;
  private _testServers: string[];
  private _devs: string[];
  private _defaultPrefix: string;
  private _ignoreBots: string;
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
  private _cacheUpdateSpeed: number;

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
      ignoreBots?: boolean;
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
  public aliases: string;
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
  public cooldown: string | number;
  public globalCooldown: string | number;
  public noDisable: boolean;
  public userPermissions: PermissionResolvable[];
  public botPermissions: PermissionResolvable[];
  public category: string;
  public validator: Validator | undefined;

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
    language: keyof typeof import("./Base/Handling/Languages.json");
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
    validator?: Validator | undefined;
    init?: Command["init"];
    run: Command["run"];
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
    language: keyof typeof import("./Base/Handling/Languages.json");
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
    language: keyof typeof import("./Base/Handling/Languages.json");
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
  cooldown: Model<
    Document<{
      uId: string;
      type: string;
      name: string;
      cooldown: string;
    }>
  >;
  disabledCommands: Model<
    Document<{
      gId: string;
      commands: string[];
      categories: string[];
    }>
  >;
  prefixes: Model<
    Document<{
      gId: string;
      prefix: string;
    }>
  >;
  requiredRoles: Model<
    Document<{
      gId: string;
      requiredRoles: object[];
    }>
  >;
  guildLanguage: Model<
    Document<{
      gId: string;
      language: string;
    }>
  >;
  userLanguage: Model<
    Document<{
      uId: string;
      language: string;
    }>
  >;
};
