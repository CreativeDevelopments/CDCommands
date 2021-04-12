const { Collection, User } = require("discord.js");
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
      const data = [...(await model.find())];
      for (const doc of data) {
        if (modelName === "cooldowns") {
          if (!this._cache.get(modelName)) {
            this._cache.set(
              modelName,
              new Collection().set(
                doc.type === "local" ? doc.uId : doc.name,
                doc.type === "local"
                  ? new Collection().set(doc.name, doc)
                  : doc,
              ),
            );
          } else {
            if (doc.type === "local") {
              if (!this._cache.get(modelName).get(doc.uId))
                this._cache
                  .get(modelName)
                  .set(doc.uId, new Collection().set(doc.name, doc));
              else this._cache.get(modelName).get(doc.uId).set(doc.name, doc);
            } else this._cache.get(modelName).set(doc.name, doc);
          }
        } else {
          if (!this._cache.get(modelName))
            this._cache.set(
              modelName,
              new Collection().set(
                doc[this._options.models[modelName].getBy] || doc.name,
                doc,
              ),
            );
          else
            this._cache
              .get(modelName)
              .set(doc[this._options.models[modelName].getBy] || doc.name, doc);
        }
      }
    }
    this._startUpdateCycle();
  }

  /**
   * @public
   * @param {keyof T} type
   * @param {string} findBy
   * @param {string=} command
   */
  getDocument(type, findBy, command) {
    if (!this._cache.get(type)) return undefined;
    if (type === "cooldown") {
      if (!this._cache.get(type).get(findBy)) return undefined;
      else return this._cache.get(type).get(findBy).get(command);
    } else return this._cache.get(type).get(findBy);
  }

  /**
   * @public
   * @param {keyof T} type
   * @param {Document<any>} doc
   */
  insertDocument(type, doc) {
    if (type === "cooldowns") {
      if (!this._cache.get(type)) this._cache.set(type, new Collection());

      if (doc.type === "local") {
        if (!this._cache.get(type).get(doc.uId)) {
          this._cache
            .get(type)
            .set(doc.uId, new Collection().set(doc.name, doc));
        } else this._cache.get(type).get(doc.uId).set(doc.name, doc);
      } else this._cache.get(type).set(doc.name, doc);
    } else {
      if (!this._cache.get(type)) {
        this._cache.set(
          type,
          new Collection().set(
            doc[this._options.models[type].getBy] || doc.name,
            doc,
          ),
        );
      } else {
        this._cache
          .get(type)
          .set(doc[this._options.models[type].getBy] || doc.name, doc);
      }
    }
  }

  /**
   * @public
   * @param {keyof T} type
   * @param {Document<any>} update
   */
  updateDocument(type, update) {
    this._cache
      .get(type)
      .set(update[this._options.models[type].getBy] || update.name, update);
  }

  /**
   * @public
   * @param {keyof T} type
   * @param {string} findBy
   * @param {Document<any>} document
   */
  async deleteDocument(type, findBy, document) {
    if (type === "cooldown") {
      if (document.uId) {
        this._cache.get(type).get(document.uId).delete(findBy);
        await document.delete();
      } else {
        this._cache.get(type).delete(findBy);
        await document.delete();
      }
    } else {
      this._cache.get(type).delete(findBy);
      await document.delete();
    }
  }

  /** @private */
  _startUpdateCycle() {
    setInterval(async () => {
      for (const [docName, collection] of this._cache) {
        if (docName === "cooldowns") {
          const model = this._models.get(docName);
          for (const [key, doc_or_collection] of collection) {
            if (!isNaN(parseInt(key)) && key.length === 18) {
              for (const [command, doc] of doc_or_collection) {
                const query = {};
                query["uId"] = doc.uId;
                query["name"] = command;
                query["type"] = "local";
                if (await model.findOne(query))
                  await model.findOneAndUpdate(query, doc);
                else await model.create(doc);
              }
            } else {
              const query = {};
              query["name"] = key;
              query["type"] = "global";
              if (await model.findOne(query))
                await model.findOneAndUpdate(query, doc_or_collection);
              else await model.create(doc_or_collection);
            }
          }
        } else {
          const model = this._models.get(docName);
          for (const [key, document] of collection) {
            const query = {};
            query[this._options.models[docName].getBy] = key;
            if (await model.findOne(query))
              await model.findOneAndUpdate(query, document);
            else await model.create(document);
          }
        }
      }
    }, this._updateSpeed);
  }
};
