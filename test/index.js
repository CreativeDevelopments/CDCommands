const CDCommands = require("../src/index");
const client = new (require("discord.js").Client)();

client.on("ready", () => {
  new CDCommands(client, {
    defaultPrefix: "<",
    mongoURI: "mongodb+srv://Exxon:7Xrxg41gBLXSSNYZ@cluster0.piwbb.mongodb.net/cdcommands-language?authSource=admin&replicaSet=atlas-usdmyg-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true",
    cacheUpdateSpeed: 90 * 1000,
    commandsDir: "commands",
    customHelpCommand: false,
    customMessageEvent: false,
    devs: [],
    eventsDir: "events",
    testServers: [],
  });
});

client.login("NzY3NzkyMjA0Njg5MTc4Njc0.X43ENg.mEwW1iRTOQ2kIlPn7evBGyzh91U");