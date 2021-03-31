[![](./images/cdcommands.png)](https://discord.gg/jUNbV5u)
[![](https://img.shields.io/discord/769710808435261490.svg)](https://discord.gg/jUNbV5u)
[![](https://img.shields.io/npm/dt/cdcommands.svg)](https://www.npmjs.com/package/cdcommands)
[![](https://img.shields.io/npm/dm/cdcommands.svg?style=color=blue)](https://www.npmjs.com/package/cdcommands)
[![](https://img.shields.io/npm/v/cdcommands.svg?style=color=blue)](https://www.npmjs.com/package/cdcommands)
[![](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/CreativeDevelopments/CDCommands)

# Table of Contents

- [Installation](#installation)
- [Initial Setup](#initial-setup)
- [Creating a Basic Command](#creating-a-basic-command)
  - [Command Properties](#command-properties)
    - [Argument Validation](#argument-validation)
      - [Validate](#the-validate-function)
      - [On Error](#the-onerror-function)
      - [On Success](#the-onsuccess-function)
- [Creating an Event](#creating-an-event)
- [Creating a Feature](#creating-a-feature)
- [Default Responses](#default-responses)
  - [Language Support](#language-support)
- [Client Utils](#client-utils)

# Installation

To avoid unwanted warnings with mongoose/mongodb, we recommend installing a previous version (v5.11.15) or waiting until this issue is fixed in the next release.

```
$ npm install mongoose@5.11.15
$ npm install cdcommands
```

# Initial Setup

To setup your bot project with CDCommands, all you need to do is initialize the main class inside of your client ready event!

```js
const { Client } = require("discord.js");
const CDCommands = require("cdcommands");

const client = new Client();

client.on("ready", () => {
  new CDCommands(client, {
    // Path to your commands folder (default: "commands")
    commandsDir: "commands",
    // Path to your events folder (default: "events")
    eventsDir: "events",
    // Path to your features folder (default: "features")
    featuresDir: "features",
    // Path to message.json file (default: inside node_modules folder)
    MessageJSONPath: "message.json",
    // An array of your test servers (default: [])
    testServers: [],
    // Array of bot developers (default: [])
    devs: [],
    // The default prefix you wish to set
    defaultPrefix: "?",
    // Your mongodb connection uri
    mongoURI: "URI_HERE",
    // How frequently the cache will update the database (default: 90 seconds)
    cacheUpdateSpeed: 60000 * 5,
    // Whether or not you want to make your own help command (default: false)
    customHelpCommand: false,
    // Whether or not you want to make your own message event (default: false)
    customMessageEvent: false,
  });
});

client.login("BOT_TOKEN");
```

As long as you set everything up correctly, this should be all you technically need to get a barebones bot up and running.

# Creating a Basic Command

> Your commands folder, in this documentations case is "commands", may have as many subfolders as you wish, the handler will search through each folder and load any command that it encoutners. _Commands **must** be an instance of the Command class, or they will not be loaded._ <br>

To create a command, all you need is a new file in your commands dirrectory and the Commands class from the package, then all you need to do is export a new instance of the class and you're done! New command!

```js
const { Command } = require("cdcommands");

module.exports = new Command();
```

Now, obviously, this command wont work, as there are no properties associated with it, so therefore your bot cant find the command or execute it in any way. So now we will need to add some properties to this command so your bot can both recognize the command and execute its function.

## Command Properties

The command class has many different properties that can help you get the most out of this handlers capabilities and to allow your bot to find and execute all the commands you create.<br>
We will also be requiring a new class from the module called "Validator", read on to learn more.

```js
const { Command, Validator } = require("cdcommands");

module.exports = new Command({
  // The commands main name. Used to find the command. (type: string)
  name: "ping",
  // An array of command aliases that can also be used to find and
  // execute the command. (type: Array<string>)
  aliases: ["pong"],
  // The category the command fits into. This is used to sort commands
  // for the help menu. (type: string)
  category: "general",
  // A short description of the command that is used in help menus
  // (type: string)
  description: "Gets the bots connection latency",
  // A more detailed description of what the command does, also is
  // used in help menus. (type: string)
  details: "View the bots current websocket and message latency",
  // The minimum number of arguments the command expects (type: number)
  minArgs: 0,
  // The maximum number of arguments the command expects (type: number)
  // Tip: Use Infinity for no maximum
  maxArgs: Infinity,
  // The expected usage of the command. Has no functionality other than
  // being displayed in the help menu. (type: string)
  // Tip: Use {prefix} to display the current guild prefix
  usage: "{prefix}ping",
  // Whether or not the command can be used only in a guild or not.
  // (type: boolean)
  guildOnly: false,
  // Whether or not the command can only be used in direct messages.
  // (type: boolean)
  // Tip: Set both guildOnly and dmOnly to true to "disable" a command.
  dmOnly: false,
  // Whether or not the command is NSFW, and can only be used in such
  // channels (type: boolean)
  nsfw: false,
  // Whether or not the command can only be used by the developers
  // specified in the "dev" array. (type: boolean)
  devOnly: false,
  // Whether or not the command can be disabled by the default disable
  // command (type: boolean)
  noDisable: false,
  // The amount of time until the same user can use said command again
  // (in milliseconds), use "globalCooldown" for a cross-server
  // global affect. (type: number)
  // Note: Both "cooldown" and "globalCooldown" are measured in ms
  cooldown: 500,
  // The amount of time until anyone can use said command again
  // (in milliseconds), use "cooldown" for a non-cross-server local
  // affect. (type: number)
  // Tip: Use 0 on either "cooldown" or "globalCooldown" for no cooldown
  globalCooldown: 0,
  // An array of permissions that the member will need to be able to run
  // the command. Isn't used if "dmOnly" is true.
  // (type: Array<PermissionResolvable>)
  userPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  // An array of permissions that the bot will need to be able to run
  // the command. Isn't used if "dmOnly" is true.
  // (type: Array<PermissionResolvable>)
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  // More information will be provided below. (type: Validator)
  validate: new Validator(),
  // The function that you want run when the command is used.
  // 5 different parameters are passed along for you to use.
  // message, args, client, prefix, and language
  /* (type: ({ message, args, client, prefix, language }: 
  { message: Message, args: string[], client: CDClient, prefix: string, language: string }) => Promise<unknown>) */
  run: ({ message, args, client, prefix, language }) => {
    return message.channel.send(`My latency is **${client.ws.ping}ms**!`);
  },
});
```

The above command, when run using either **?ping** or **?pong**, should have the bot respond with some message along the lines of:

> My latency is **58ms**!<br>

## Argument Validation

The "validate" property may be slightly confusing to new users, so we decided to explain it with its own section! The validate property will accept a class called "Validator", this class provides 3 functions that you can customize to your liking, _"validate", "onSuccess", and "onError"_, each performing their own actions. Out of the three, onSuccess is optional, and the other two are required for functionality.<br>

```js
const { Command, Validator } = require("cdcommands");

module.exports = new Command({
  ...commandOptions,
  validate: new Validator({
    validate: ({ message, args, client, prefix, language }) => {
      if (args[0] !== "test") return "INCORRECT_ARGS";
    },
    onError: ({ error, message, args, client, prefix, language }) => {
      if (error === "INCORRECT_ARGS")
        message.channel.send('args[0] was not equal to "test"');
    },
    onSuccess: (message) => {
      console.log('Command "ping" was run successfully!');
    },
  }),
});
```

Replacing the validate property shown previously with the one shown above will now validate your command! Now if you don't provide your first argument as "test", you will get a response saying `args[0] was not equal to "test"`. You now must run your command as **?ping test** or **?pong test**.

### The validate function

The validate function does exactly what it sounds like it will do. It validates the command in any way that you provide in the validate function. You can return either a string, as shown above, to use in your "onError" property, or return a boolean/undefined to default to a generic error code of **"INVALID_ARGUMENT"**. Whatever string is returned from the validate function is passed into the "onError" function as the parameter "error".<br>
**Parameter Types**

- `message: import("discord.js").Message`
- `args: Array<string>`
- `client: CDClient`
- `prefix: string`
- `language: keyof import("cdcommands/src/Base/Handling/Languages.json")`

### The onError function

The onError function will execute before the command is run, and terminate execution of the command. It will send whatever you wish, based of errors created in the "validate" function. You can send whatever message you want for each error type, or just log something to your terminal. Whatever it is, it will happen before the command executes and will terminate any further execution.<br>
**Parameter Types**

- `error: string`
- `message: import("discord.js").Message`
- `args: Array<string>`
- `client: CDClient`
- `prefix: string`
- `language: keyof import("cdcommands/src/Base/Handling/Languages.json")`

### The onSuccess function

The onSuccess function is optional, and will execute before the command is run like the "onError" function, but unlike that function, this one is non-blocking, and will just execute the provided code before the command is run.<br>
**Parameter Types**

- `message: import("discord.js").Message`

# Creating an Event

# Creating a Feature

# Default Responses

## Language Support

# Client Utils
