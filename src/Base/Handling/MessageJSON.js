const { join } = require("path");

const fs = require("fs");

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
   * @template {"embed" | "string"} is
   * @param {Langs} language
   * 
   * @param {V} key
   * @param {S} secondary_key
   * @param {{ is: is }}
   * @param {
   * is extends "string" ?
   * [{ key: keyof import("../json-schema/replacers.json"), replace: string }]
   * : 
   * } args
   * @returns {import("../message.json")[V] extends keyof string ? import("../message.json")[V] : import("../message.json")[V][S]}

   */
  getValue(language, key, secondary_key, { is }, args) {
    // let value = this._fileData[key];
    // if (typeof value === "object") value = value[secondary_key];
    // for (const replacer of args) {
    //   const regex = new RegExp(`{${replacer.key}}`, "g");
    //   value = value.replace(regex, replacer.replace);
    // }
    // return value;
    this.getValue("en", "");
  }
}

new MessageJSON("./").getValue(
  "en",
  "HELP_COMMAND",
  "INVALID_COMMAND_CATEGORY",
  { is: "string" },
);
module.exports = MessageJSON;
