const CDCommands = require("../src/index");
const client = new (require("discord.js").Client)();

client.on("ready", () => {
  new CDCommands(client, {
    defaultPrefix: "<",
    mongoURI: "",
    cacheUpdateSpeed: 90 * 1000,
    commandsDir: "commands",
    customHelpCommand: false,
    customMessageEvent: false,
    devs: [],
    eventsDir: "events",
    testServers: [],
  });
});

client.login("");
