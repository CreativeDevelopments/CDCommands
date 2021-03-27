const { join } = require("path");
const colors = require("colors");
const fs = require("fs");
const { MessageEmbed } = require("discord.js");

/**
 * @template {import("../message.json")} T
 */
class MessageJSON {
  /**
   * @private
   * @type {string}
   */
  _path = "../message.json";

  /**
   * @private
   * @type {T}
   */
  _fileData;

  /**
   * @param {string=} messagePath
   */
  constructor(messagePath) {
    if (messagePath && messagePath !== "")
      this._path = join(require.main.path, messagePath);
    try {
      require(this._path);
    } catch (err) {
      throw new ReferenceError('An invalid "message.json" path was provided.');
    }

    this._fileData = require(this._path);
    console.log(Object.keys(this._fileData.en));
  }
  /**
   * @template {keyof import("./Languages.json")} Langs
   * @template {keyof (T[Langs])} V
   * @template {T[Langs][V] extends string ? "" : keyof T[Langs][V]} S
   * @template {"embed" | "string"} Is
   * @param {Langs} language
   * @param {V} key
   * @param {S} secondary_key
   * @param {{is: Is}} is
   * @param {is extends "string" ?
   * [{ key: keyof import("../json-schema/replacers.json"), replace: string }]
   * :
   * {
   *  title?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * };
   * url?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * };
   * author_name?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * }
   * author_iconURL?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * }
   * color?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * }
   * fields?: [
   *  {
   *    key: keyof import("../json-schema/replacers.json")["EMBED"]
   *    repalce: string
   *  }
   * ]
   * footer_text?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * }
   * footer_iconURL?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * }
   * timestamp?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * }
   * thumbnail_url?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * }
   * description?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * }
   * image?: {
   *   key: keyof import("../json-schema/replacers.json")["EMBED"]
   *   repalce: string
   * }
   * }} args
   * @returns {is extends "string" ? string : MessageEmbed}
   */
  getValue(language, key, secondary_key, { is }, args) {
    const lang_data = this._fileData[language];
    if (lang_data === undefined) throw new Error("Uknown language");
    let get = lang_data[key];
    if (get === undefined) throw new Error("Unknown primary key");
    if (typeof get === "object" && is !== "embed") get = get[secondary_key];
    if (get === undefined) throw new Error("Unknown secondary key");

    if (is === "string") {
      if (!(args instanceof Array))
        throw new Error(
          'Got "is" as "string" but "args" is not an instance of an Array.',
        );

      for (const replacer of args) {
        const regex = new RegExp(`{${replacer.key}}`, "g");
        get = get.replace(regex, replacer.replace);
      }

      return get;
    } else if (is === "embed") {
      for (const args_key of Object.keys(args)) {
        if (!args[args_key].key) {
          console.log(
            "[WARN]".yellow +
              ` Argument value "${args_key}" is missing a valid key value, skipping replacer.`,
          );
          continue;
        } else if (!args[args_key].replace) {
          console.log(
            "[WARN]".yellow +
              ` Argument value "${args_key}" is missing a valid replace value, skipping replacer.`,
          );
          continue;
        }
        if (args_key.includes("_")) {
          const _keys = args_key.split("_");
          const regex = new RegExp(`${args[args_key].key}`, "g");

          get[_keys[0]][_keys[1]] = get[_keys[0]][_keys[1]].replace(
            regex,
            args[args_key].replace,
          );
          continue;
        } else {
          const regex = new RegExp(`${args[args_key].key}`, "g");
          get[args_key] = get[args_key].replace(regex, args[args_key].replace);
        }
      }
      return new MessageEmbed(get);
    } else
      throw new Error(
        'Invalid "is" value. Please use either "string" or "embed"',
      );
  }
}

new MessageJSON("").getValue(
  "en",
  "HELP_COMMAND",
  "INVALID_COMMAND_CATEGORY",
  { is: "embed" },
  {
    author_iconURL: {
      key: "AUTHOR_URL",
      repalce: "https://www.google.com",
    },
  },
);

module.exports = MessageJSON;
