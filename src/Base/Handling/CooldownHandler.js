const { Collection, User } = require("discord.js");
const { Document } = require("mongoose");
const cooldownDoc = require("../../Database/models/cooldown");
const parsems = require("parse-ms");

module.exports = class Cooldowns {
    /**
     * @private 
     * @type {import("../CDClient").CDClient} 
     */
    _client;
    /**
     * @private
     * @type {Collection<string, Collection<string, Date>>} 
     */
    _cooldowns = new Collection();

    /**
     * @private
     * @type {Collection<string, Date>}
     */
    _globalCoolDowns = new Collection();

    /**
     * @param {Array<Document<any>>} dbCooldowns 
     * @param {import("../CDClient").CDClient} client
     */
    constructor(
        dbCooldowns,
        client,
    ) {
        this._init(dbCooldowns);
        this._client = client;
    }

    /**
     * @private
     * @param {Array<Document<any>>} DBcooldowns
     */
    _init(DBcooldowns) {
        for (const cldwn of DBcooldowns) {
            if (cldwn.type === "global")
                this._globalCoolDowns.set(cldwn.name, cldwn.cooldown);
            else this._cooldowns.set(cldwn.uId, (new Collection()).set(cldwn.name, cldwn.cooldown));
        }
    }

    /**
     * @public
     * @param {User} user 
     * @param {string} command 
     * @param {Date} cooldown 
     * @param {"global" | "local"} type
     * @returns {void}
     */
    setCooldown(user, command, cooldown, type) {
        if (type === "local") {
            if (this._cooldowns.get(user.id) === undefined)
                this._cooldowns.set(user.id, (new Collection()).set(command, cooldown));
            if ((Math.ceil(cooldown.valueOf() - Date.now()) / 1000 / 60) >= 5)
                this._client.databaseCache.insertDocument("cooldown", new cooldownDoc({ uId: user.id, name: command, cooldown, type: "local" }))
            else this._cooldowns.get(user.id).set(command, cooldown);
        } else if (type === "global") {
            this._globalCoolDowns.set(command, cooldown);
            if ((Math.ceil(cooldown.valueOf() - Date.now()) / 1000 / 60) >= 5)
                this._client.databaseCache.insertDocument("cooldown", new cooldownDoc({ name: command, cooldown, type: "global" }))
        } else throw new TypeError("Invalid \"type\" parameter. Please ensure you pass \"global\" or \"local\"");
        
    }

    /**
     * @public
     * @param {User} user 
     * @param {string} command
     * @param {"global" | "local"} type
     */
    getRemainingCooldown(user, command, type) {
        if (type === "local") {
            if (this._cooldowns.get(user.id) === undefined) return undefined;
            if (this._cooldowns.get(user.id).get(command) === undefined) return undefined;
            const remainingTime = parsems(this._cooldowns.get(user.id).get(command).valueOf() - Date.now());
            return remainingTime;
        } else if (type === "global") {
            if (this._globalCoolDowns.get(command) === undefined) return undefined;
            const remainingTime = parsems(this._globalCoolDowns.get(command).valueOf() - Date.now());
            return remainingTime;
        } else throw new TypeError("Invalid \"type\" parameter. Please ensure you pass \"global\" or \"local\"");
    }

    /**
     * @public
     * @param {User} user 
     * @param {string} command 
     * @param {"global" | "local"} type
     * @returns {boolean}
     */
    isOnCooldown(user, command, type) {
        if (type === "local") {
            if (this._cooldowns.get(user.id) !== undefined && this._cooldowns.get(user.id).get(command) !== undefined) {
                const date = this._cooldowns.get(user.id).get(command);
                if (date.valueOf() > Date.now())
                    return true;
                else {
                    this._cooldowns.get(user.id).delete(command);
                    cooldownDoc.findOne({ uId: user.id, name: command, type: "local" }).then((c) => {
                        if (c !== null) this._client.databaseCache.deleteDocument("cooldown", c);
                    });
                    return false;
                }
            }
        } else if (type === "global") {
            if (this._globalCoolDowns.get(command) !== undefined) {
                const date = this._globalCoolDowns.get(command);
                if (date.valueOf() > Date.now())
                    return true;
                else {
                    this._globalCoolDowns.delete(command);
                    cooldownDoc.findOne({ name: command, type: "global" }).then((c) => {
                        if (c !== null) this._client.databaseCache.deleteDocument("cooldown", c);
                    });
                    return false;
                }
            }
        } else throw new TypeError("Invalid \"type\" parameter. Please ensure you pass \"global\" or \"local\"");
    }
}