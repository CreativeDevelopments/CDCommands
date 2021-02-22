// const { CDClient } = require("../index");
const { existsSync, readdirSync, statSync, lstatSync } = require("fs");
const Command = require("../Base/Command");
const { log } = require('mustang-log')
/**
 * @param {string} commandsDir 
 * @param {import("../Base/CDClient").CDClient} client
 * @param {boolean} customHelpCommand
 * @returns {import("../Base/CDClient").CDClient}
 */
function Commands(commandsDir, client, customHelpCommand) {
    if (!existsSync(`${require.main.path}\\${commandsDir}`)) log('Please make sure your commands directory exists.', 'ERROR', true);
    const folders = readdirSync(`${require.main.path}\\${commandsDir}`);
    for (const folder of folders) {
        if (lstatSync(`${require.main.path}\\${commandsDir}\\${folder}`).isDirectory())
            Commands(`${commandsDir}\\${folder}`, client, customHelpCommand)
        else {
            /** @type {Command} */
            const command = require(`${require.main.path}\\${commandsDir}\\${folder}`);
            if (command.name === "help" && !customHelpCommand) continue; 
            if (client.commands.get(command.name)) log(`Command ${command.name} has occured more than once. Please make sure you have unique "name" properties.`, 'ERROR', true);
            client.commands.set(command.name, command);
            if (command.aliases && command.aliases.length > 0) 
                for (const alias of command.aliases) {
                    if (client.aliases.get(alias)) log(`Alias ${alias} has occured more than once. Please make sure you have unique "aliases" properties.`, 'ERROR', true);
                    client.aliases.set(alias, command.name);
                }
        }
    }
    return client;
}

module.exports = Commands;