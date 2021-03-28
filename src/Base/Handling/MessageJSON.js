const { join } = require("path");
const langs = Object.keys(require("./Languages.json"));
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
  }
  /**
   * @template {keyof (T["en"])} V
   * @template {keyof T["en"][V] extends "embed" ? "" : T["en"][V] extends string ? "" : keyof T["en"][V]} S
   * @param {keyof import("./Languages.json")} language
   * @param {V} key
   * @param {S} secondary_key
   * @param {{
   *  title?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }];
   * url?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }];
   * author_name?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }]
   * author_iconURL?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }]
   * color?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }]
   * fields?: [
   *  {
   *    name?: [{
   *      key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *      replace: string
   *    }]
   *    value?: [{
   *      key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *      replace: string
   *    }]
   *    inline?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   *  }]
   *  }
   * ]
   * footer_text?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }]
   * footer_iconURL?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }]
   * timestamp?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }]
   * thumbnail_url?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }]
   * description?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }]
   * image_url?: [{
   *   key: keyof import("../json-schema/replacers.json")["EMBED"] | keyof import("../json-schema/replacers.json")
   *   replace: string
   * }]} | [{ key: keyof import("../json-schema/replacers.json"), replace: string }]} args
   * @returns {MessageEmbed | string}
   */
  getValue(language, key, secondary_key, args) {
    const lang_data = this._fileData[language];
    if (lang_data === undefined || !langs.includes(language))
      return console.log(
        "[ERROR] ".red +
          `Language "${language}" is unknown. Please provide a valid language.`,
      );
    let get = lang_data[key];
    if (get === undefined)
      return console.log(
        "[ERROR] ".red +
          `Primary key "${key}" is unknown. Please provide a valid primary key.`,
      );

    if (typeof get === "object" && !Object.keys(get).includes("embed"))
      get = get[secondary_key];
    if (get === undefined)
      return console.log(
        "[ERROR] ".red +
          `Secondary key "${secondary_key}" is unknown. Please provide a valid secondary key.`,
      );
    try {
      if (!Object.keys(get).includes("embed")) {
        if (!(args instanceof Array))
          return console.log(
            "[ERROR] ".red +
              'Result is of type "string" but "args" is not an instance of an Array. Use an Array instead.',
          );

        for (const replacer of args) {
          const regex = new RegExp(`{${replacer.key}}`, "g");
          get = get.replace(regex, replacer.replace);
        }

        return get;
      } else {
        if (args instanceof Array)
          return console.log(
            "[ERROR] ".red +
              'Result is an "embed" but "args" is an instance of an Array. Use an Object instead.',
          );

        for (const args_key of Object.keys(args)) {
          if (args_key === "fields") {
            const fields_keys = args[args_key];
            for (let i = 0; i < fields_keys.length; i++) {
              const args_keys_inline_etc = fields_keys[i];
              const get_field = get["embed"][args_key][i];

              const { inline, value, name } = args_keys_inline_etc;

              if (inline instanceof Array) {
                for (let i = 0; i < inline.length; i++) {
                  const key_value = inline[i];
                  if (!key_value.key) {
                    console.log(
                      "[WARN] ".yellow +
                        `Argument value at position "${i}" in "${args_key}->inline" is missing a valid key value, skipping replacer.`,
                    );
                    continue;
                  }
                  if (!key_value.replace) {
                    console.log(
                      "[WARN] ".yellow +
                        `Argument value at position "${i}" in "${args_key}->inline" is missing a valid replace value, skipping replacer.`,
                    );
                    continue;
                  }
                  const inlineRegex = new RegExp(`{${key_value.key}}`, "g");
                  get_field["inline"] = get_field["inline"].replace(
                    inlineRegex,
                    key_value.replace,
                  );
                }
              } else if (!(inline instanceof Array) && inline !== undefined)
                console.log(
                  "[WARN] ".yellow +
                    `Got "inline" value in "fields" at position "${i}" as non-Array.`,
                );

              if (value instanceof Array) {
                for (let i = 0; i < value.length; i++) {
                  const key_value = value[i];
                  if (!key_value.key) {
                    console.log(
                      "[WARN] ".yellow +
                        `Argument value at position "${i}" in "${args_key}->value" is missing a valid key value, skipping replacer.`,
                    );
                    continue;
                  }
                  if (!key_value.replace) {
                    console.log(
                      "[WARN] ".yellow +
                        `Argument value at position "${i}" in "${args_key}->value" is missing a valid replace value, skipping replacer.`,
                    );
                    continue;
                  }
                  const valueRegex = new RegExp(`{${key_value.key}}`, "g");
                  get_field["value"] = get_field["value"].replace(
                    valueRegex,
                    key_value.replace,
                  );
                }
              } else if (!(value instanceof Array) && value !== undefined)
                console.log(
                  "[WARN] ".yellow +
                    `Got "value" value in "fields" at position "${i}" as non-Array.`,
                );
              if (name instanceof Array) {
                for (let i = 0; i < name.length; i++) {
                  const key_value = name[i];
                  if (!key_value.key) {
                    console.log(
                      "[WARN] ".yellow +
                        `Argument value at position "${i}" in "${args_key}->name" is missing a valid key value, skipping replacer.`,
                    );
                    continue;
                  }
                  if (!key_value.replace) {
                    console.log(
                      "[WARN] ".yellow +
                        `Argument value at position "${i}" in "${args_key}->name" is missing a valid replace value, skipping replacer.`,
                    );
                    continue;
                  }
                  const nameRegex = new RegExp(`{${key_value.key}}`, "g");
                  get_field["name"] = get_field["name"].replace(
                    nameRegex,
                    key_value.replace,
                  );
                }
              } else if (!(name instanceof Array) && name !== undefined)
                console.log(
                  "[WARN] ".yellow +
                    `Got "name" value in "fields" at position "${i}" as non-Array.`,
                );
            }
            continue;
          }

          for (let i = 0; i < args[args_key].length; i++) {
            const key_value = args[args_key][i];
            if (!key_value.key) {
              console.log(
                "[WARN] ".yellow +
                  `Argument value at position "${i}" in "${args_key}" is missing a valid key value, skipping replacer.`,
              );
              continue;
            } else if (!key_value.replace) {
              console.log(
                "[WARN] ".yellow +
                  `Argument value at position "${i}" in "${args_key}" is missing a valid replace value, skipping replacer.`,
              );
              continue;
            }
            if (args_key.includes("_")) {
              const _keys = args_key.split("_");
              const regex = new RegExp(`{${key_value.key}}`, "g");

              get["embed"][_keys[0]][_keys[1]] = get["embed"][_keys[0]][
                _keys[1]
              ].replace(regex, key_value.replace);
              continue;
            } else {
              const regex = new RegExp(`{${key_value.key}}`, "g");
              get["embed"][args_key] = get["embed"][args_key].replace(
                regex,
                key_value.replace,
              );
            }
          }
        }
        return new MessageEmbed(get.embed);
      }
    } catch (err) {
      return undefined;
    }
  }

  get fileData() {
    return this._fileData;
  }
}

// new MessageJSON("").getValue("en", "GUILD_ONLY", "", {

// })

module.exports = MessageJSON;
