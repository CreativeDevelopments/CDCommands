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
    if (messagePath && messagePath !== "") this._path = join(require.main.path, messagePath);
    try {
        require(this._path);
    } catch (err) {
      throw new ReferenceError("An invaled \"message.json\" path was provided.");
    }
    
    this._fileData = require(this._path);
  }
  /**
   * @template {keyof T} V
   * @template {keyof import("../message.json")[V] extends keyof string ? "" : keyof import("../message.json")[V]} S
   * @param {V} key
   * @param {S} secondary_key
   * @param {[{ key: keyof import("../json-schema/replacers.json"), replace: string }]} args
   * @returns {import("../message.json")[V] extends keyof string ? import("../message.json")[V] : import("../message.json")[V][S]} 
   */
  getValue(key, secondary_key, args) {
    let value = this._fileData[key];
    if (typeof value === "object")
      value = value[secondary_key];

    for (const replacer of args) {
      const regex = new RegExp(`{${replacer.key}}`, "g")
      value = value.replace(regex, replacer.replace);
    }

    return value;
  }

  /**
   * Writes a new value to the specified key value in the "message.json" file, if the key already exists.
   * @template {string} K
   * @param {string} key 
   * @param {K} value 
   * @returns {K}
   */
  setValue(key, value) {
    if (!this._fileData[key]) throw new ReferenceError(`Unknown key: \"${key}\"`);
    this._fileData[key] = value;
    fs.writeFileSync(this._path, this._fileData);
    return value;
  }

}
module.exports = MessageJSON;