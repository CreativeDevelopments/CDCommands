const Command = require("../Command");
const { ProperCase, FormatCooldown, FormatPerms } = require("../../Functions");
const { MessageEmbed, MessageReaction, User } = require("discord.js");

module.exports = new Command({
    aliases: ["commands"],
    botPermissions: ["EMBED_LINKS"],
    cooldown: 500,
    description: "Help Command",
    details: "A help command to recieve help",
    devOnly: false,
    dmOnly: false,
    globalCooldown: 500,
    guildOnly: false,
    maxArgs: 1,
    minArgs: 0,
    name: "help",
    noDisable: true,
    nsfw: false,
    testOnly: false,
    usage: "{prefix}help [command]",
    userPermissions: ["SEND_MESSAGES"],
    category: "defaultCommands",
    run: async ({ args, prefix, message, client }) => {
        const command_category = args[0] ? args[0] : undefined;
        

        const command = client.commands.get(command_category) || client.commands.get(client.aliases.get(command_category));
        const category = client.commands.filter((c) => c.category === command_category);

        if (!command && category.size < 1 && command_category)
            return message.channel.send(`${ProperCase(command_category)} is not a valid command or category. Use \`${prefix}help\` to view all command categories.`);

        const helpEmbed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor(client.user.username, client.user.displayAvatarURL({ format: "png" }))
            .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL({ format: "png", dynamic: true }))
            .setTimestamp();

        if (command) {
            helpEmbed
                .setTitle(`${ProperCase(command.name)} Help Menu`)
                .setDescription(`*${command.details}*\n\nUsage: **${command.usage.replace(/{prefix}/gi, prefix)}**\nRequired Member Permissions: **${FormatPerms(command.userPermissions)}**\nRequired Bot Permissions: **${FormatPerms(command.botPermissions)}**\nCooldown: **${FormatCooldown(command.cooldown)}**\nGlobal Cooldown: **${FormatCooldown(command.globalCooldown)}**`);
            return message.channel.send(helpEmbed);
        } else if (category.size > 0) {
            helpEmbed
                .setTitle(`${ProperCase(command_category)} Help Menu`);

            const cateCommands = category.array();

            /** @type {Command[][]} */
            const pages = [];
            for (let i = 0; i < cateCommands.length; i += 5) 
                pages.push(cateCommands.slice(i, i + 5));

            let curPage = 0;
            const page1 = pages[curPage];
            pages.length > 1 ? helpEmbed.setAuthor(`Page: 1/${pages.length}`, client.user.displayAvatarURL({ format: "png" })) : null;
            helpEmbed
                .setDescription(page1.map((c) => `**${c.name}** → ${c.description}\nAliases: ${c.aliases.join(" ")}\nUsage: ${c.usage.replace(/{prefix}/gi, prefix)}`).join("\n\n"))
                .setFooter(`Use ${prefix}help [command] for more info`, message.author.displayAvatarURL({ format: "png" }));

            const helpMessage = await message.channel.send(helpEmbed);

            if (pages.length > 1) {
                const emojis = ["⬅️", "❌", "➡️"];
                emojis.forEach((e) => helpMessage.react(e));

                /**
                 * @param {MessageReaction} reaction 
                 * @param {User} user 
                 */
                const filter = (reaction, user) => message.author.id === user.id && emojis.includes(reaction.emoji.name);

                const collector = helpMessage.createReactionCollector(filter, { time: 90 * 1000 });

                collector.on("collect", async (reaction, user) => {
                    switch (reaction.emoji.name) {
                        case "⬅️":
                            if (curPage > 0)
                                curPage--;
                        break;
                        case "➡️":
                            if (curPage < pages.length - 1)
                                curPage++;
                        break;
                        case "❌":
                            await helpMessage.reactions.removeAll();
                            return collector.stop();
                    }

                    helpEmbed
                        .setAuthor(`Page: ${curPage + 1}/${pages.length}`, client.user.displayAvatarURL({ format: "png" }))
                        .setDescription(pages[curPage].map((c) => `**${c.name}** → ${c.description}\nAliases: ${c.aliases.join(" ")}\nUsage: ${c.usage.replace(/{prefix}/gi, prefix)}`).join("\n\n"))
                    await reaction.users.remove(user);
                    await helpMessage.edit(helpEmbed);
                });

            }

        } else {
            helpEmbed
                .setTitle("Help Menu")
                .setFooter(`Use ${prefix}help [category] for more info`);

            const categories = Array.from(new Set(client.commands.map((c) => c.category)));
            /** @type {string[][]} */
            const pages = [];

            for (let i = 0; i < categories.length; i += 6)
                pages.push(categories.slice(i, i + 6));


            pages.length > 1 ? helpEmbed.setAuthor(`Page: 1/${pages.length}`, client.user.displayAvatarURL({ format: "png" })) : null;
            let curPage = 0;
            for (const category of pages[curPage])
                helpEmbed.addField(`${category} [${client.commands.filter(c => c.category === category).size}]`, client.commands.filter(c => c.category === category).array().slice(0, 3).map((c) => `\`${c.name}\``).join(", ") + "...")

            const helpMessage = await message.channel.send(helpEmbed);

            if (pages.length > 1) {
                const emojis = ["⬅️", "❌", "➡️"];
                emojis.forEach((e) => helpMessage.react(e));

                /**
                 * @param {MessageReaction} reaction 
                 * @param {User} user 
                 */
                const filter = (reaction, user) => message.author.id === user.id && emojis.includes(reaction.emoji.name);

                const collector = helpMessage.createReactionCollector(filter, { time: 90 * 1000 });

                collector.on("collect", async (reaction, user) => {

                    const reactedEmbed = new MessageEmbed()
                        .setColor("BLUE")
                        .setAuthor(`Page: ${curPage + 1}/${pages.length}`, client.user.displayAvatarURL({ format: "png" }))
                        .setTimestamp()
                        .setTitle("Help Menu")
                        .setFooter(`Use ${prefix}help [category] for more info`);

                    switch (reaction.emoji.name) {
                        case "⬅️":
                            if (curPage > 0)
                                curPage--;
                        break;
                        case "➡️":
                            if (curPage < pages.length - 1)
                                curPage++;
                        break;
                        case "❌":
                            await helpMessage.reactions.removeAll();
                            return collector.stop();
                    }

                    for (const category of pages[curPage])
                    reactedEmbed.addField(`${category} [${client.commands.filter(c => c.category === category).size}]`, client.commands.filter(c => c.category === category).array().slice(0, 3).map((c) => `\`${c.name}\``).join(", ") + "...");
                        
                    await reaction.users.remove(user);
                    await helpMessage.edit(reactedEmbed);
                });
            }
        }


    }
});