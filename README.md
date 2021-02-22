<center><a href="https://discord.gg/jUNbV5u"><img src ="https://nodei.co/npm/cdcommands.png"></a></center>


# [Support Server](https://discord.gg/jUNbV5u)

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
        cacheUpdateSpeed: Number, 
        customHelpCommand: false,
        customMessageEvent: false,
    })
})

client.login('TOKEN')
```

# Creating a Command
```js
// File name: "ping.js"

const { Command } = require('cdcommands');

module.exports = new Command({
    name: 'ping',
    aliases: ['pong'], // Optional
    description: 'Tells you the bots ping',
    details: 'More information',
    minArgs: 0,
    maxArgs: 0, // Use Infinity for infinite
    usage: '{prefix}ping',
    guildOnly: false,
    dmOnly: false,
    testOnly: false,
    devOnly: false,
    nsfw: false,
    cooldown: 0, // Optional -Defaults to 0 - In ms
    globalCooldown: 0, // Optional - Defaults to 0 - In ms
    noDisable: true,
    userPermissions: ['MANAGE_MESSAGES'], // Optional
    botPermissions: ['SEND_MESSAGES'], // Optional
    category: 'Misc',
    run: async({ message, args, client, prefix }) => {
        message.reply('Pong')
    }
})
```
<br></br>

# Creating an Event

```js
// File name: guildMemberAdd.js

const { Event } = require('cdcommands')

module.exports = new Event('guildMemberAdd', (client, member) => {

    console.log(`${member.user.tag} just joined the server!`)
    
})
```
<br></br>

# Default Embeds
There are 4 different embeds - load, error, success, info:

Example:
```js
message.channel.send("", { embed: client.error({ msg: message, data: 'Invalid Arguments!' }) })

message.channel.send("", { embed: client.info({ msg: message, data: 'My ping is 50ms' }) })

message.channel.send("", { embed: client.load({ msg: message, data: 'Banning member...' }) })

message.channel.send("", { embed: client.success({ msg: message, data: 'Successfully banned Exxon#0293' }) })
```
<img src="https://tom.creativedevelopments.org/TRH_Discord_LfYaBkTeFt.png">
<img src="https://tom.creativedevelopments.org/XWE_Discord_67xrVcLyYb.png">
<img src="https://tom.creativedevelopments.org/HKO_Discord_kc1rgwMZgh.png">
<img src="https://tom.creativedevelopments.org/HIO_Discord_mfbpVKWQmo.png">
<br></br>

### You can change the default embeds if you go to node_modules/cdcommands/src/index.js --> You can also add emotes so it can show like this (The bot must be in the server the emotes are from.):
<img src="https://tom.creativedevelopments.org/NCW_Discord_RXhMQeJ2EV.png">
<img src="https://tom.creativedevelopments.org/DUV_Discord_w5nstRebUr.png">
<img src="https://tom.creativedevelopments.org/IKM_Discord_kHl2IfnSvY.png">
<br></br>

# Functions

There is currently only one main function but more will be added in the future. 

```js
// File name: test.js
// Directory: ./commands/general/test.js
// This will be changed so you can do const { ProperCase } = require('cdcommands') soon.

const { Command } = require('cdcommands')
const { ProperCase } = require('../../node_modules/cdcommands/src/Functions')

module.exports = new Command({
    name: 'test',  // Fill out the rest as normal
    run: ({ message }) = { 
        console.log(ProperCase('hello there')) 
    }
})

// Console Log:
Hello There
```


