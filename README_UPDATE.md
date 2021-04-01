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
    // What default commands you want to "disable" or not load (default: [])
    disabledDefaultCommands: [],
    // Whether or not you want to make your own message event (default: false)
    customMessageEvent: false,
  });

  console.log(`${client.user.username} has logged in!`);
});

client.login("BOT_TOKEN");
```

As long as you set everything up correctly, this should be all you technically need to get a barebones bot up and running.

# Creating a Basic Command

> Your commands folder, in this documentations case is "commands", may have as many subfolders as you wish, the handler will search through each folder and load any command that it encoutners. Note: _Commands **must** be an instance of the Command class, or they will not be loaded._ A bonus of using the class is that you get powerful intellisense both while setting up your command and while creating your "run" function!<br>
> Note: There are six commands that are loaded by default, and these can be picked to not load in the main class under the "disabledDefaultCommands" property. Although, this is not recommended as it will remove some of the bots basic functionality, unless of course, you want to make your own versions of the command. <br>

To create a command, all you need is a new file in your commands dirrectory and the Commands class from the package, then all you need to do is export a new instance of the class and you're done! New command!

```js
// ./commands/Ping.js
const { Command } = require("cdcommands");

module.exports = new Command();
```

Now, obviously, this command wont work, as there are no properties associated with it, so therefore your bot cant find the command or execute it in any way. So now we will need to add some properties to this command so your bot can both recognize the command and execute its function.

## Command Properties

The command class has many different properties that can help you get the most out of this handlers capabilities and to allow your bot to find and execute all the commands you create.<br>
We will also be requiring a new class from the module called "Validator", read on to learn more.

```js
// ./commands/Ping.js

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
// ./commands/Ping.js
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

To create a new event for your bot to listen to, all you need to do is create a new file in your events dirrectory, which in this case is "events", and import the class named "Event" from the module. After that, all you need to do is export a new instance of the class and there you have it! A new event file!

```js
// ./events/messageDelete.js
const { Event } = require("cdcommands");

module.exports = new Event();
```

Now, again, of course this event wont do anything for you, so we need to add a couple properties to the class. We are going to assign an event name, which is the same as assigning an event name in your regular `<Client>#on` listener, then we will also assign a callback function, which will have your client as `CDClient` as the first parameter, followed by the parameters that the regular listener has.

> Note: Event files **must** use the Event class or else they will not be loaded. A bonus of using the class is that you get powerful intellisense as if you were using a regular client listener!

```js
// ./events/messageDelete.js
const { Event } = require("cdcommands");

module.exports = new Event("messageDelete", (client, message) => {
  console.log(
    `${client.user.username} saw ${message.author.username} delete ${message.content}`,
  );
});
```

The above event, once your bot logs in, should log a message along the lines of `Application Name saw User delete Test` every time a user that the bot has access to deletes a message from any channel the bot can see. Since we are using the "messageDelete" event in this example, the parameters in the callback function are expected to be first your client, then followed by the message object that was deleted.

> Note: A message event file is loaded by default to allow all the different checks for permissions and others to work. The loading of this event can be disabled by setting the "customMessageEvent" property to **true** in the CDCommands class, though it is not recommended as it will break a lot of your commands functionality.

# Creating a Feature

Features are quite simple, they are loaded and run one time before your bot starts, but after all your commands and events load in. As of now there is no way to re-run features after startup, but there may be sometime in the future. Creating a Feature is extremely simple, just like everything else so far. All you need to do is create a new file in your features dirrectory, in this case it will be "features". This file can have whatever name you like, and all you need to do is import the "Feature" class from the module, and export a new instance of the class.

```js
// ./features/file_name.js
const { Feature } = require("cdcommands");

module.exports = new Feature();
```

Just like with your commands and your events, a feature set up in this way will do nothing for you. All we need to do to set it up is add a single callback function as a parameter in the class. This callback function will have a single parameter in it, which will be the client as CDClient.

```js
// ./features/file_name.js
const { Feature } = require("cdcommands");

module.exports = new Feature((client) => {
  console.log(
    `This is ${client.user.username} from "./features/file_name.js"!`,
  );
});
```

The above feature is extremely basic, and doesn't really do much for you in terms of functionallity, but it should log something along the lines of `This is Application Name from "./features/file_name.js"!` in your console. You can do whatever you want in this file, and it will be run along with your bot starting up. You can add your own listeners here, although we would recommend using an Event instead, or you could start an Interval for updating mutes in your servers.

> Note: Features will not be run if they are not created with the "Feature" class.

# Default Responses

## Language Support

# Client Utils
