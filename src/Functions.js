const { GuildMember } = require("discord.js");
const { Document } = require("mongoose");
const parseMilliseconds = require("parse-ms");
const Command = require("./Base/Command");

/**
 * @param {import("discord.js").PermissionResolvable[]} memberPermissions 
 * @param {import("discord.js").PermissionResolvable[]} requiredPermissions
 * @returns {{perms: string | null; length: number}}
 */
function ValidatePermissions(memberPermissions, requiredPermissions) {
    /** @type {import("discord.js").PermissionResolvable[]} */
    const missingPerms = requiredPermissions.filter(perm => !memberPermissions.includes(perm));
    
    return {
        perms: missingPerms.length > 0 ? missingPerms.map((p, i, a) => a.length > 1 ? i === a.length - 1 ? `, and ${ProperCase(p.split("_").join(" "))}` : i === 0 ? ProperCase(p.split("_").join(" ")) : `, ${ProperCase(p.split("_").join(" "))}` : ProperCase(p.split("_").join(" "))).join("") : null,
        length: missingPerms.length,
    }
}
/**
 * @param {string} string 
 * @returns {string}
 */
function ProperCase(string) {
    return string.toLowerCase().replace(/(\b\w)/gi, w => w.toUpperCase());
}
/**
 * @param {Document<any>} rolesDocument 
 * @param {GuildMember} member 
 * @param {Command} command
 */
function ValidateRoles(rolesDocument, member, command) {
    const memberRoles = member.roles.cache.array().map((r) => r.id).filter((s) => s !== member.guild.id);
    const roles = rolesDocument.requiredRoles.filter((ob) => ob.command === command.name)[0];
    if (roles) {
        const reqRoles = roles.roles;
        /** @type {string[]} */
        const missingRoles = reqRoles.filter(reqRole => !memberRoles.includes(reqRole));
        if (missingRoles.length)
            return {
                roles: missingRoles.map((s, i, a) => a.length > 1 ? i === a.length - 1 ? `and ${member.guild.roles.cache.get(s).name}` : `${member.guild.roles.cache.get(s).name}, ` : member.guild.roles.cache.get(s).name).join(""),
                length: missingRoles.length,
            }
    }
}

/** @param {import("discord.js").PermissionResolvable[]} permissions */
function FormatPerms(permissions) { 
    return permissions.map((p) => ProperCase(p.replace(/_/g, " "))).join(", ");
}

/** 
 * @param {number | 
 * { 
 * days: number; 
 * hours: number; 
 * minutes: number; 
 * seconds: number; 
 * milliseconds: number; 
 * microseconds: number; 
 * nanoseconds: number; 
 * }} cooldown 
 */
function FormatCooldown(cooldown) {
    const totalTime = typeof cooldown === "object" ? cooldown : parseMilliseconds(cooldown);
    if (totalTime.milliseconds > 0)
        totalTime.seconds += parseFloat((totalTime.milliseconds / 1000).toFixed(1));
    /**
     * @type {["days", "hours", "minutes", "seconds", "milliseconds", "microseconds", "nanoseconds"]}
     */
    const keys = Object.keys(totalTime);
    const importantTimes = keys.splice(0, 4);

    const arr = [];
    for (const key of importantTimes) {
        if (totalTime[key] > 0)
            arr.push(`${totalTime[key]} ${totalTime[key] === 1 ? key.slice(0, key.length - 2) : key}`);
    }
    return arr.join(", ");
}

module.exports = {
    ValidatePermissions,
    ProperCase,
    ValidateRoles,
    FormatPerms,
    FormatCooldown,
};
