<div style="text-align:center"><a href="https://discord.gg/jUNbV5u"><img src="./images/cdcommands.png"></a></div>

<br>

<div style="text-align:center">
<a href="https://discord.com/invite/jUNbV5u"><img src="https://img.shields.io/discord/769710808435261490.svg"></a>
<a href="https://www.npmjs.com/package/cdcommands"><img src="https://img.shields.io/npm/dt/cdcommands.svg"></a>
<a href="https://www.npmjs.com/package/cdcommands"><img src="https://img.shields.io/npm/dm/cdcommands.svg?style=color=blue"></a>
<a href="https://www.npmjs.com/package/cdcommands"><img src="https://img.shields.io/npm/v/cdcommands.svg?style=color=blue"></a>
<a href="https://github.com/CreativeDevelopments/CDCommands"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square"></a>
</div>

<br>

# Contents

- [Installation](#installation)
- [Setup](#setup)
- [Message.json](#message-json)
- [Creating a Command](#creating-a-command)
  - [Properties](#properties)
  - [Command](#command)
  - [Argument Validation](#argument-validation)
    - [Validator Functions](#validator-functions)
- [Creating an Event](#creating-an-event)
  - [Custom Message Event](#custom-message-event)
- [Creating a Feature](#creating-a-feature)
- [Defaults](#defaults)
  - [Embeds](#embeds)
  - [Logging](#logging)
- [Functions](#functions)
  - [ProperCase](#propercase)
  - [FormatPerms](#formatPerms)
- [Other](#other)

<br>

# Installation

We recommend that if you are going to use the mongoose package to install version 5.11.15, you can do this with this command below:

```
npm i cdcommands --save
npm i mongoose@5.11.15 --save
```

<br>

# Setup

```js
const Discord = require("discord.js");
const CDCommands = require("cdcommands");
require("dotenv").config(); // If you a using dotenv you need to install it with "npm i dotenv --save"

const client = new Discord.Client();

client.on("ready", () => {
  new CDCommands(client, {
    commandsDir: "commands",
    eventsDir: "events",
    featuresDir: "features",
    MessageJSONPath: "./path/to/message.json", // You can get the default message.json from our GitHub
    testServers: [], // Array of your test servers, these will be the servers that the testOnly: true commands work in
    devs: [], // Array of your bot developers IDs
    defaultPrefix: "prefix",
    mongoURI: process.env.MONGO_URI,
    cacheUpdateSpeed: 60000 * 5, // Needs to be a number, this example would be 5 minutes
    customHelpCommand: false, // Boolean
    customMessageEvent: false, // Boolean
  });
});

client.login(process.env.TOKEN);
```

<br>

# Message JSON

Setting up your message.json file is as easy as creating the file in your directory and adding the relative path in the MessageJsonPath property. On the first start of the project, a directory and file will be created, "~.vscode/settings.json". This is created to allow for autocomplete in your message.json files. You can get the default message.json file [here](https://sourceb.in/Vf0CoYk7x6).

```js
client.on("ready", () => {
  new CDCommands(client, {
    MessageJSONPath: "./path/to/message.json",
    ...
  });
});
```

<br>

# Creating a Command

Commands can have as many subfolders as you want.

## Properties:

```
name --> Name of command | String

aliases --> Different names the command can be run by | Array

description --> Brief description of what the command does | String

details --> More detailed description of the command, this appears on the "{prefix}help CommandName" help menu | String

minArgs --> Minimum Arguments Required | Number

maxArgs --> Maximum Arguments for a command | Number, use Infinite for no limit

usage: --> How to use the command, add "{prefix}" to the start | String

guildOnly: --> If the command should only work in guilds | Boolean

dmOnly --> If the command should only work in Direct Messages | Boolean

testOnly --> If the command should only work in the test servers specified in your main file | Boolean

devOnly --> If the command should be restricted to only the developers specified in your main file | Boolean

nsfw --> If the command should only work in NSFW channels | Boolean

cooldown --> If the user running the command should have a cooldown | Number

globalCooldown --> A cooldown across all servers | Number

noDisable --> If the command should not be able to be disabled | Boolean

userPermissions --> Array of permissions a user needs to run a command | Array

botPermissions --> Array of permissions the client needs to run the command | Array

category --> Category of the command | String
```

## Command

```js
// File Name: "ping.js"

const { Command, Validator } = require("cdcommands");

module.exports = new Command({
  name: "ping",
  aliases: ["pong"], // Optional
  description: "Tells you the bots ping",
  details: "More information", // This will be displayed when doing {prefix}help <Command Name>
  minArgs: 0,
  maxArgs: 0, // Use Infinity for infinite
  usage: "{prefix}ping",
  guildOnly: false,
  dmOnly: false,
  testOnly: false,
  devOnly: false,
  nsfw: false,
  cooldown: 0, // Optional - Defaults to 0 - In ms
  globalCooldown: 0, // Optional - Defaults to 0 - In ms
  noDisable: true,
  userPermissions: ["MANAGE_MESSAGES"], // Optional
  botPermissions: ["SEND_MESSAGES"], // Optional
  validator: new Validator({}), // Optional, more information below
  category: "Misc",
  run: async ({ message, args, client, prefix }) => {
    message.reply("Pong");
  },
});
```

## Argument Validation

In the command class, one parameter is accepted as an ArgumentValidator. To use this, require "Validator" from the package, and create a new instance of the class for the option. The class accepts three functions. "validate", "onSuccess", and "onError". "onSuccess" is optional. Each function takes its own parameters, validate is used to determine if the function on "onSuccess" or "onError" should be run. In the "validate" function, you can either return a boolean value, or a string to create your own error types. The default error type is "INVALID_ARGUMENT" (if no string is returned). You can see the example below for more information.

```js
// File Name: example.js
const { Command, Validator } = require("cdcommands");

module.exports = new Command({
  ...options,
  validator: new Validator({
    validate: ({ args, client, message, prefix }) => {
      if (args[0] !== "hi") return "INVALID_ARGS_0";
      else if (args[1] !== "hey") return "INVALID_ARGS_1";
    },
    onError: ({ args, message, prefix, client, error }) => {
      if (error === "INVALID_ARGS_0")
        message.channel.send("Hey, that's invalid args[0]");
      else if (error === "INVALID_ARGS_1")
        message.channel.send("Hey, that's invalid args[1]");
    },
    onSuccess: (message) => {
      // Do something BEFORE the command response is sent, could be a console log, could be a message
      message.channel.send(
        "Command Usage is validated! (Before Command Execution!)",
      );
    },
  }),
  run: ({ message, args, client, prefix }) => {
    // Command code
  },
});
```

## Validator Functions

### validate({ args, client, message, prefix });

`args: string[] - Represents the arguments of the given message`\
`client: CDClient - Represents the client instance (CDClient)`\
`message: Message - The message that was sent`\
`prefix: string - The prefix for the current guild, if applicable, if not, defaults to "defaultPrefix"`\
`@returns string | boolean | Promise<string | boolean>`

This function will execute the provided code, and return any given error values, to be used in `onError`, effectively acting as a middle man between the command being run and the commands execution. Ensuring that the command is run with the correct information provided.

### onError({ args, message, prefix, client, error });

`args: string[] - Represents the arguments of the given message`\
`message: Message - The message that was sent`\
`prefix: string - The prefix for the current guild, if applicable, if not, defaults to "defaultPrefix"`\
`client: CDClient - Represents the client instance (CDClient)`\
`error: string - One of the values that is returned by the validate function stated previously, or if none are returned, the default value of "INVALID_ARGUMENT" is passed.`\
`@returns void | Promise<void>`

This function will stop execution of the command before its even ran, and instead execute the blocker code provided in the function. You can do whatever you want in this function, inform a user the command was used incorrectly, log information to the console, whatever it is, it happens BEFORE the command is executed, and will end the command execution.

### onSuccess(message);

`message: Message - The message that was sent`\
`@returns void | Promise<void>`

This function is a non-blocking intermediate function that is executed BEFORE the command is executed. It is run if the message passes validation based off of the `validate` function stated previously. This function can do whatever you want. Log information about commands being run, let the user know something before the command is run. Whatever it is, it happens first, then the command is executed.

<br>

# Creating an Event

Events can have as many subfolders as you want. If you want to create a message event you need to enable "customMessageEvent" when

```js
// File Name: guildMemberAdd.js

const { Event } = require("cdcommands");

module.exports = new Event("guildMemberAdd", (client, member) => {
  console.log(`${member.user.tag} just joined the server!`);
});
```

<br>

## Custom Message Event

If you want to have our own message event you will need to set `customMessageEvent: true` in your main file. I'd suggest taking the default message event from [here](https://github.com/CreativeDevelopments/CDCommands/blob/main/src/Base/Message.js) and changing this.

<br>

# Creating a Feature

```js
// File Name: someFeature.js

const { Feature } = require("cdcommands");

module.exports = new Feature((client) => {
  console.log(`${client.user.username} from "someFeature.js"`);
});
```

### What is a Feature?

A feature is a piece of code that is run only once, when your bot is starting up. It will run after all your commands and events have been loaded in. You can have whatever you want in these files, and it will be run **once** on **start up**.
<br>

# Defaults

## Embeds

There are 4 different embeds - load, error, success and info:

Example:

```js
//File Name: example.js

run: ({ message, client }) => {
  message.channel.send("", {
    embed: client.error({ msg: message, data: "Invalid Arguments!" }),
  });

  message.channel.send("", {
    embed: client.info({ msg: message, data: "My ping is 50ms" }),
  });

  message.channel.send("", {
    embed: client.load({ msg: message, data: "Banning member..." }),
  });

  message.channel.send("", {
    embed: client.success({
      msg: message,
      data: "Successfully banned Exxon#0293",
    }),
  });
};
```

<div style="text-align:center">
<img src="./images/embeds.png">
</div>

<br>

## Logging

There are 5 different default logs - ready, info, load, database, error and warn:

Example:

```js
client.logReady({ data: "Logged in as Test Bot#8673" });
client.logInfo({ data: "CDCommands >> Loaded 71 commands" });
client.logWarn({ data: "You have not set your MongoURI" });
client.logError({ data: "Failed to connect to the database" });
client.logDatabase({ data: "Successfully connected to the database" });
```

<div style="text-align:center">
<img src="https://tom.creativedevelopments.org/GDQ_cmd_Ucmvrpl3Ur.png">
</div>

<br>

# Functions

There is currently only a few functions but more will be added soon. If you have any suggestions for new functions please join our [support server](https://discord.gg/jUNbV5u)

## ProperCase

```js
// File Name: example.js

const { Command } = require('cdcommands');
const { ProperCase } = require('cdcommands/src/Functions');

module.exports = new Command({
  name: 'test', //Fill out the rest as normal
  run: ({ message }) => {
    console.log(ProperCase('hello world'));
  }
})

// Console Log:
Hello World
```

<br>

## FormatPerms

```js
// File Name: example.js

const { Command } = require("cdcommands");
const { FormatPerms } = require("cdcommands/src/Functions");

module.exports = new Command({
  name: "roleperms", // Fill out the rest as normal
  run: ({ message }) => {
    const role = message.mentions.roles.first();
    message.channel.send(FormatPerms(role.permissions.toArray()));
  },
});
```

<br>

# Other

If you have any questions, suggestions or need helping setting it up join our [Support Server](https://discord.gg/jUNbV5u).

Stuff we are adding

<ul>
    <li>Default tickets with a ticket config command</li>
    <li>A way to have premiumOnly commands</li>
    <li>A default block command so you can block user Id's from using your bot</li>
</ul>
