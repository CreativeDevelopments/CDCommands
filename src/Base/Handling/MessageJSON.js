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
    if (messagePath && messagePath !== "") this._path = join(require.main.path, this._path, "message.json");
    try {
        require(this._path);
    } catch (err) {
      throw new ReferenceError("An invaled \"message.json\" path was provided.");
    }
    
    this._fileData = require(this._path);
  }
  /**
   * @param {keyof T} key
   * @returns {string} 
   */
  getValue(key) {
    return this._fileData[key];
  }

  /**
   * Writes a new value to the specified key value in the "message.json" file, if the key already exists.
   * @template {string} K
   * @param {string} key 
   * @param {K} value 
   * @returns {K}
   */
  setValue(key, value) {
    if (!this._fileData[key]) throw new ReferenceError("Unknown key value.");
    this._fileData[key] = value;
    fs.writeFileSync(this._path, this._fileData);
    return value;
  }


}

module.exports = MessageJSON;