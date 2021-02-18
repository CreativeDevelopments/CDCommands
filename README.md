# Installation
```
npm install cdcommands
```

# Setup
```js
const Discord = require('discord.js');
const CDCommands = require('cdcommands');

const client = new Discord.Client();

client.on('ready', () => {
    new CDCommands(client, {
        commandsDir: 'commands',
        eventsDir: 'events',
        testServers: [],
        devs: [],
        defaultPrefix: '',
        mongoURI: '',
        cacheUpdateSpped: Number,
        customHelpCommand: false,
        customMessageEvent: false,
    })
})

client.login('TOKEN')
```

# Creating a Command
```js
const { Command } = require('cdcommands');

module.exports = new Command({
    name: 'ping',
    aliases: ['pong'],
    description: 'Tells you the bots ping',
    details: 'More information',
    minArgs: 0,
    maxArgs: 0, //Use Infinity for infinite
    usage: '{prefix}ping',
    guildOnly: false,
    dmOnly: false,
    testOnly: false,
    devOnly: false,
    nsfw: false,
    cooldown: 0, //In MS
    globalCooldown: 0,
    noDisable: true,
    userPermissions: [],
    botPermissions: ['SEND_MESSAGES'],
    category: 'Misc',
    run: async({ message, args, client, prefix }) => {
        message.channel.send("", { embed: client.success({ msg: message, data: 'Pong' }) })
    }
})

