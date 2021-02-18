const { CDClient } = require("./CDClient");
/**
 * @template {keyof import("discord.js").ClientEvents} K
 */

module.exports = class Event {

    /**
     * @type {K}
     */
    name;

    /**
     * @function
     * @param {CDClient} client
     * @returns {Promise<any>}
     * 
     * @type {(client: CDClient, ...args: import("discord.js").ClientEvents[K]) => Promise<any>}
     */
    run;

    /**
     * @param {K} name
     * @param {(client: CDClient, ...args: import("discord.js").ClientEvents[K]) => Promise<any>} run
     */
    constructor(
        name,
        run,
    ) {
        this.name = name;
        this.run = run;
    }
}