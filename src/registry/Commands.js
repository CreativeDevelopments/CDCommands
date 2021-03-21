const { join } = require("path");
const Command = require("../Base/Command");
const { existsSync, readdirSync, lstatSync, mkdirSync } = require("fs");
/**
 * @param {string} commandsDir
 * @param {import("../Base/CDClient").CDClient} client
 * @param {boolean} customHelpCommand
 * @returns {import("../Base/CDClient").CDClient}
 */
function Commands(commandsDir, client, customHelpCommand) {
  if (!existsSync(join(require.main.path, commandsDir))) {
    client.logWarn({
      data: `No "${commandsDir}" directory found! Creating one...`,
    });
    mkdirSync(join(require.main.path, commandsDir), { recursive: true });
  }
  const folders = readdirSync(join(require.main.path, commandsDir));
  for (const folder of folders) {
    if (lstatSync(join(require.main.path, commandsDir, folder)).isDirectory())
      Commands(`${join(commandsDir, folder)}`, client, customHelpCommand);
    else {
      /** @type {Command} */
      const command = require(join(require.main.path, commandsDir, folder));
      if (command.name === "help" && !customHelpCommand) continue;
      if (client.commands.get(command.name)) {
        client.logError({
          data: `Command ${command.name} has occured more than once. Please make sure you have unique "name" properties.`,
        });
        continue;
      }
      if (!(command instanceof Command)) {
        client.logError({
          data: `Command file ${join(
            require.main.path,
            commandsDir,
            folder,
          )} is an invalid command. Please make sure all files are setup correctly.`,
        });
        continue;
      }
      client.commands.set(command.name, command);
      if (command.aliases && command.aliases.length > 0)
        for (const alias of command.aliases) {
          if (client.aliases.get(alias))
            client.logError({
              data: `Alias ${alias} has occured more than once. Please make sure you have unique "aliases" properties.`,
            });
          client.aliases.set(alias, command.name);
        }
    }
  }
  return client;
}

module.exports = Commands;
