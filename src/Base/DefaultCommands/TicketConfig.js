const Command = require('../Command')
const { MessageEmbed } = require('discord.js')

module.exports = new Command({
    name: 'ticketconfig',
    aliases: ['tconfig', 'ticketconf', 'tconf'],
    description: 'Configure your ticket settings',
    details: 'Max = Max Number of Tickets someone can have open\nRoles = Support Roles\nClaim = Enable / Disable claiming tickets\nCategory = Category ID or Name for where tickets are opened\nClose = Category ID or Name for where closed tickets go\nLog = Logs channel for tickets',
    minArgs: 2,
    maxArgs: Infinity,
    usage: '{prefix}ticketconfig <Max / Role / Claim / Category / Close / Log / List> <Options>',
    guildOnly: true,
    dmOnly: false,
    testOnly: false,
    devOnly: false,
    nsfw: false,
    cooldown: 5000,
    noDisable: false,
    userPermissions: ['MANAGE_GUILD'],
    botPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
    category: 'tickets',
    run: async({ args, client, message, prefix }) => {

        const ticketConfDoc = client.databaseCache.getDocument('ticketconf', message.guild.id)

        const option1 = args[0].toLowerCase();

        if (option1 !== 'max' && option1 !== 'roles' && option1 !== 'claim' && option1 !== 'category' && option1 !== 'close' && option1 !== 'log' && option1 !== 'list') 
            return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments! Please use \`${prefix}ticketconfig <Max / Roles / Claim / Cateogry> <Options>\` instead!`})}).catch(err => message.reply(`Invalid Arguments! Please use \`${prefix}ticketconfig <Max / Roles / Claim / Cateogry> <Options>\` instead!`))
        

        if (option1 === 'max') {
            const maxNumber = args[1]
            if (!maxNumber || isNaN(maxNumber))
                return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments! Please use \`${prefix}ticketconfig max <Max Number of Tickets>\` instead.`})}).catch(err => message.reply(`Invalid Arguments! Please use \`${prefix}ticketconfig max <Max Number of Tickets>\` instead.`))
            
            if (maxNumber === ticketConfDoc.maxTickets)
                return message.channel.send("", { embed: client.error({ msg: message, data: `The max tickets a user can have is already set to \`${maxNumber}\`. If you want to change this please choose a different number!`})}).catch(err => message.reply(`The max tickets a user can have is already set to ${maxNumber}. If you want to change this please choose a different number!`))
            

            if (client.databaseCache.getDocument('ticketconf', message.guild.id))
                client.databaseCache.updateDocument('ticketconf', message.guild.id, { guildId: message.guild.id, maxTickets: maxNumber })
            else
                client.databaseCache.insertDocument('ticketconf', { guildId: message.guild.id, maxTickets: maxNumber})
            
            return message.channel.send("", { embed: client.success({ msg: message, data: `Successfully updated the max number of tickers per user to \`${maxNumber}\``})}).catch(err => message.reply(`Successfully updated the max number of tickers per user to \`${maxNumber}\``))
        }


        if (option1 === 'role') {
            
            const role = message.guild.roles.cache.get(args[1]) || message.mentions.roles.first() || message.guild.roles.cache.find(r => r.name === args[1])

            if (!role)
                return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments! Please use \`${prefix}ticketconfig role <@Role / Role ID or Role Name>\` instead!`})}).catch(err => message.reply(`Invalid Arguments! Please use \`${prefix}ticketconfig role <@Role / Role ID or Role Name>\` instead!`))
            
            if (client.databaseCache.getDocument('ticketconf', message.guild.id))
                client.databaseCache.updateDocument('ticketconf', message.guild.id, { guildId: message.guild.id, supportRole: role.id})
            else
                client.databaseCache.insertDocument('ticketconf', { guildId: message.guild.id, supportRole: role.id})
            
            return message.channel.send("", { embed: client.success({ msg: message, data: `Successfully updated the support role to ${role}`})}).catch(err => msg.reply(`Successfully updated the support role to ${role}`))
        } 


        if (option1 === 'claim') {

            if (!args[1])
                return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments! Please use \`${prefix}ticketconfig Claim <On / Off>\` instead!`})}).catch(err => message.reply(`Invalid Arguments! Please use \`${prefix}ticketconfig Claim <On / Off>\` instead!`))

            const onOff = args[1].toLowerCase()
            if (onOff !== 'on' && onOff !== 'off') 
                return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments! Please use \`${prefix}ticketconfig Claim <On / Off>\` instead!`})}).catch(err => message.reply(`Invalid Arguments! Please use \`${prefix}ticketconfig Claim <On / Off>\` instead!`))
            
            if (onOff === ticketConfDoc.claim)
                return message.channel.send("", { embed: client.error({ msg: message, data: `This guild's settings already have claiming tickets set to \`${onOff}\`. If you want to change this please choose a different setting!`})}).catch(err => message.reply(`This guild's settings already have claiming tickets set to ${onOff}. If you want to change this please choose a different setting!`))
            
            if (client.databaseCache.getDocument('ticketconf', message.guild.id))
                client.databaseCache.updateDocument('ticketconf', message.guild.id, { guildId: message.guild.id, claim: onOff })
            else
                client.databaseCache.insertDocument('ticketconf', { guildId: message.guild.id, claim: onOff})
            
            return message.channel.send("", { embed: client.success({ msg: message, data: `Successfully updated the claim settings to \`${onOff}\``})}).catch(err => message.reply(`Successfully updated the claim settings to \`${onOff}\``))
        }


        if (option1 === 'category') {

            const cat = args[1]
            if (!cat) 
                return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments! Please use \`${prefix}ticketconfig category <Category ID or Name>\` instead!`})}).catch(err => message.reply(`Invalid Arguments! Please use \`${prefix}ticketconfig category <Category ID or Name>\` instead!`))
            
            const fCat = message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name === cat)
            if (!fCat)
                return message.channel.send("", { embed: client.error({ msg: message, data: `I failed to find a category with that ID or name, please try again!`})}).catch(err => message.reply(`I failed to find a category with that ID or name, please try again!`))
            
            if (fCat.type !== 'category')
                return message.channel.send("", { embed: client.error({ msg: message, data: 'The category ID or Name given is not a category. Please make sure you are using the ID or name of a **category**!'})}).catch(err => message.reply('The category ID or Name given is not a category. Please make sure you are using the name or ID of a **category**!'))
            
            if (client.databaseCache.getDocument('ticketconf', message.guild.id))
                client.databaseCache.updateDocument('ticketconf', message.guild.id, { guildId: message.guild.id, category: fCat.id })
            else
                client.databaseCache.insertDocument('ticketconf', { guildId: message.guild.id, category: fCat.id })
                
            return message.channel.send("", { embed: client.success({ msg: message, data: `Successfully updated the category for tickets to \`${fCat.name}\``})}).catch(err => message.reply(`Successfully updated the category for tickets to \`${fCat.name}\``))
        }


        if (option1 === 'close') {
            
            const cat = args[1]
            if (!cat)
                return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments! Please use \`${prefix}ticketconfig close <Category ID or Name>\` instead!`})}).catch(err => msg.reply(`Invalid Arguments! Please use \`${prefix}ticketconfig close <Category ID or Name>\` instead!`))
            
            const fCat = message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name === cat)
            if (!fCat)
                return message.channel.send("", { embed: client.error({ msg: message, data: 'I failed to find a category with that ID or name, please try again!'})}).catch(err => msg.reply('I failed to find a category with that ID or name, please try again!'))
            
            if (!fCat.type !== 'category')
                return message.channel.send("", { embed: client.error({ msg: message, data: 'The category ID or name given is not a category. Please make sure you are using the ID or name of a **category**!'})}).catch(err => msg.reply('The category ID or name given is not a category. Please make sure you are using the ID or name of a **category**!'))
            
            if (client.databaseCache.getDocument('ticketconf', message.guild.id))
                client.databaseCache.updateDocument('ticketconf', message.guild.id, { guildId: message.guild.id, close: fCat.id})
            else
                client.databaseCache.insertDocument('ticketconf', { guildId: message.guild.id, close: fCat.id})
            
            return message.channel.send("", { embed: client.success({ msg: message, data: `Successfully updated the category for tickets to \`${fCat.name}\``})}).catch(err => msg.reply(`Successfully updated the category for tickets to \`${fCat.name}\``))
        }


        if (option1 === 'log') {

            const chan = message.guild.channels.cache.get(args[1]) || message.guild.channels.cache.find(c => c.name === args[1].toLowerCase()) || message.mentions.channels.first() || message.channel
            if (!chan || chan.type === 'category')
                return message.channel.send("", { embed: client.error({ msg: message, data: `Invalid Arguments! Please use \`${prefix}ticketconf log <Channel ID, Name, #channel or leave blank for current channel>\` instead!`})}).catch(err => msg.reply(`Invalid Arguments! Please use \`${prefix}ticketconf log <Channel ID, Name, #channel or leave blank for current channel>\` instead!`))
            
            if (client.databaseCache.getDocument('ticketconf', message.guild.id))
                client.databaseCache.updateDocument('ticketconf', message.guild.id, { guildId: message.guild.id, log: chan.id})
            else
                client.databaseCache.insertDocument('ticketconf', { guildId: message.guild.id, log: chan.id})

            return message.channel.send("", { embed: client.success({ msg: message, data: `Successfully updated the log channel for tickets to ${chan}`})}).catch(err => msg.reply(`Successfully updated the log channel for tickets to ${chan}`))
        }


        if (option1 === 'list') {

            const results = client.databaseCache.getDocument('ticketconf', message.guild.id)
            if (!results)
                return message.channel.send("", { embed: client.error({ msg: message, data: `This guild has not configured the ticket settings! You can do this with \`${prefix}ticketconfig\``})})
            
            const role = message.guild.roles.cache.get(result.supportRole)
            const maxTickets = results.maxTickets
            const claim = results.claim
            const category = message.guild.channels.cache.get(results.category)
            const close = message.guild.channels.cache.get(results.close)
            const log = message.guild.channels.cache.get(results.log)

            const embed = new MessageEmbed()
            .setColor('#00DCFF')
            .setTitle(`Ticket Configuration Settings for ${message.guild.name}`)
            .addFields(
                { name: 'Max number of tickets per user', value: `${maxTickets || 1}`, inline: true },
                { name: 'Can tickets be claimed', value: `${claim || true}`, inline: true },
                { name: 'Support Role', value: `${role || 'None'}`, inline: true },
                { name: 'Ticket Category Name', value: `${category.name || 'None'}`, inline: true },
                { name: 'Category Name for closed tickets', value: `${close.name || 'None'}`, inline: true },
                { name: 'Log Channel', value: `${log || 'None'}`, inline: true }
            )
            .setFooter(`You can change the configuration settings with ${prefix}ticketconfig`)
            .setTimestamp()

            message.channel.send(embed)
        }
    }
    
})