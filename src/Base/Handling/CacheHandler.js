const { Collection } = require("discord.js");
const { Document, Model } = require("mongoose");
const prefixes = require("../../Database/models/prefixes");
const cooldown = require("../../Database/models/cooldown");
const requiredRoles = require("../../Database/models/required-roles");
const disabledCommands = require("../../Database/models/disabled-commands");
/**
 * @template {{
 * [key: string]: {
 * model: Model<any>;
 * getBy: string;
 * }
 * }} T
 */
module.exports = class Cache {

  /**
   * @private
   * @type {Collection<string, Collection<string, Document<any>>>}
   */
  _cache = new Collection();
  /**
   * @private
   * @type {number} 
   */
  _updateSpeed;

  /**
   * @private
   * @type {{
   * models: T;
   * updateSpeed: number;
   * }}
   */
  _options;

  /**
   * @private
   * @type {Collection<string, Model<any>>}
   */
  _models = new Collection();
  /**
   * @param {{
   * models: T;
   * updateSpeed: number;
   * }} options
   */
  constructor(options) {
    if (!options.models) options.models = {};
    this._options = options;
    this._updateSpeed = options.updateSpeed;

    for (const key of Object.keys(options.models))
      this._models.set(key, options.models[key].model);
    this._init();
  }

  /**
   * @private
   */
  async _init() {
    for (const [modelName, model] of this._models) {
      const data = await model.find();
      for (const doc of data) {
        if (!this._cache.get(modelName)) this._cache.set(modelName, new Collection().set(doc[this._options.models[modelName].getBy], doc));
        else this._cache.set(doc[this._options.models[modelName].getBy], doc);
      }
    }
    this._startUpdateCycle();
  }

  /**
   * @public
   * @param {keyof T} type 
   * @param {string} findBy
   */
  getDocument(type, findBy) {
    if (!this._cache.get(type))
      return undefined;
    else 
      return this._cache.get(type).get(findBy);
  }

  /**
   * @public
   * @param {keyof T} type  
   * @param {Document<any>} doc 
   */
  insertDocument(type, doc) {
    if (!this._cache.get(type)) this._cache.set(type, new Collection().set(doc[this._options.models[type].getBy], doc))
    else this._cache.get(type).set(doc[this._options.models[type].getBy], doc);
  }

  /** 
   * @public
   * @param {keyof T} type
   * @param {Document<any>} update
   */
  updateDocument(type, update) {
    this._cache.get(type).set(update[this._options.models[type].getBy], update);
  }

  /**
   * @public
   * @param {keyof T} type 
   * @param {string} findBy 
   */
  async deleteDocument(type, findBy) {
    this._cache.get(type).delete(findBy)
    const query = {};
    query[this._options.models[type].getBy] = findBy;

    await this._models.get(type).findOneAndDelete(query)
  }

  /** @private */
  _startUpdateCycle() {
    setInterval(async () => {
      for (const [docName, collection] of this._cache) {
        for (const [key, document] of collection) {
          const model = this._models.get(docName);
          const query = {};
          query[this._options.models[docName].getBy] = key;
          if (await model.findOne(query))
            await model.findOneAndUpdate(query, document);
          else await model.create(document);
        }
      }
    }, this._updateSpeed);
  }
}
