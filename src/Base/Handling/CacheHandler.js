const { Collection } = require("discord.js");
const { Document } = require("mongoose");
const prefixes = require("../../Database/models/prefixes");
const cooldown = require("../../Database/models/cooldown");
const requiredRoles = require("../../Database/models/required-roles");
const disabledCommands = require("../../Database/models/disabled-commands");

module.exports = class Cache {
    /** 
     * @private
     * @readonly
     * @type {Collection<string, Document<any>>} 
     */
    _cooldowns = new Collection();
    /** 
     * @private
     * @readonly
     * @type {Collection<string, Document<any>>} 
     */
    _disabledcommands = new Collection();
    /** 
     * @private
     * @readonly
     * @type {Collection<string, Document<any>>} 
     */
    _prefixes = new Collection();
    /** 
     * @private
     * @readonly
     * @type {Collection<string, Document<any>>} 
     */
    _requiredroles = new Collection();
    /**
     * @private
     * @type {number} 
     */
    _updateSpeed;

    /**
     * @param {{
     * cooldowns: Array<Document<any>>;
     * disabledcommands: Array<Document<any>>;
     * prefixes: Array<Document<any>>;
     * requiredroles: Array<Document<any>>;
     * updateSpeed: number;
     * }} options
     */
    constructor(options) {
        this._setCooldowns(options.cooldowns);
        this._setDisabledCommands(options.disabledcommands);
        this._setPrefixes(options.prefixes);
        this._setRequiredRoles(options.requiredroles);
        this._updateSpeed = options.updateSpeed;

        this._startUpdateCycle();
    }

    /**
     * @public
     * @param {"cooldown" | "command" | "prefix" | "roles"} type 
     * @param {string} findBy
     */
    getDocument(type, findBy) {
        return this[
            type === "cooldown" ? "_cooldowns" : 
            type === "command" ? "_disabledcommands" : 
            type === "prefix" ? "_prefixes" : 
            "_requiredroles"].get(findBy);
    }

    /**
     * @public
     * @param {"cooldown" | "command" | "prefix" | "roles"} type  
     * @param {Document<any>} doc 
     */
    insertDocument(type, doc) {
        this[
            type === "cooldown" ? "_cooldowns" : 
            type === "command" ? "_disabledcommands" : 
            type === "prefix" ? "_prefixes" : 
            "_requiredroles"].set(doc[type === "cooldown" ? "uId" : "gId"], doc);
    }

    /** 
     * @public
     * @param {"cooldown" | "command" | "prefix" | "roles"} type
     * @param {string} findBy
     * @param {Document<any>} update
     */
    updateDocument(type, findBy, update) {
        this[
            type === "cooldown" ? "_cooldowns" : 
            type === "command" ? "_disabledcommands" : 
            type === "prefix" ? "_prefixes" : 
            "_requiredroles"].set(findBy, update);
    }

    /**
     * @public
     * @param {"cooldown" | "command" | "prefix" | "roles"} type 
     * @param {{ gId: string; uId?: string; name?: string; command?: string; }} findBy 
     */
    async deleteDocument(type, findBy) {
        this[
            type === "cooldown" ? "_cooldowns" : 
            type === "command" ? "_disabledcommands" : 
            type === "prefix" ? "_prefixes" : 
            "_requiredroles"].delete(findBy[type === "cooldown" ? "uId" : "gId"]);
        
        if (type === "cooldown")
            await cooldown.findOneAndDelete({ uId: findBy.uId, name: findBy.name });
        else if (type === "command")
            await prefixes.findOneAndDelete({ gId: findBy.gId });
        else if (type === "roles")
            await requiredRoles.findOneAndDelete({ gId: findBy.gId, command: findBy.command });
        else if (type === "prefix")
            await prefixes.findOneAndDelete({ gId: findBy.gId });
            
    }

    /** @private */
    _startUpdateCycle() {
        setInterval(async () => {
            for (const cldwn of this._cooldowns.array()) {
                if (await cooldown.findOne({ uId: cldwn.uId, name: cldwn.name })) 
                    await cooldown.findOneAndUpdate({ uId: cldwn.uId, name: cldwn.name }, cldwn);
                else await cooldown.create(cldwn);
            }
            for (const cmd of this._disabledcommands.array()) {
                if (await disabledCommands.findOne({ gId: cmd.gId })) 
                    await disabledCommands.findOneAndUpdate({ gId: cmd.gId }, cmd);
                else await disabledCommands.create(cmd);
            }
            for (const prefx of this._prefixes.array()) {
                if (await prefixes.findOne({ gId: prefx.gId })) 
                    await prefixes.findOneAndUpdate({ gId: prefx.gId }, prefx);
                else await prefixes.create(prefx);
            }
            for (const reqroles of this._requiredroles.array()) {
                if (await requiredRoles.findOne({ gId: reqroles.gId, command: reqroles.command })) 
                    await requiredRoles.findOneAndUpdate({ gId: reqroles.gId, command: reqroles.command }, reqroles);
                else await requiredRoles.create(reqroles);
            }
        }, this._updateSpeed);
    }

    /** 
     * @private 
     * @param {Array<Document<any>>} cooldowns
     */
    _setCooldowns(cooldowns) {
        for (const cooldown of cooldowns)
            this._cooldowns.set(cooldown.uId, cooldown);
    }

    /**
     * @private
     * @param {Array<Document<any>>} disabledcommands 
     */
    _setDisabledCommands(disabledcommands) {
        for (const cmd of disabledcommands)
            this._disabledcommands.set(cmd.gId, cmd);
    }
    /**
     * @private
     * @param {Array<Document<any>>} prefixes 
     */
    _setPrefixes(prefixes) {
        for (const prefix of prefixes)
            this._prefixes.set(prefix.gId, prefix);
    }
    /**
     * @private
     * @param {Array<Document<any>>} requiredroles 
     */
    _setRequiredRoles(requiredroles) {
        for (const roles of requiredroles) 
            this._requiredroles.set(roles.gId, roles);
    }
}