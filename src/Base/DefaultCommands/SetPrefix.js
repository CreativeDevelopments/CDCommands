const Command = require("../Command");
const { MessageEmbed } = require("discord.js");
const prefixes = require("../../Database/models/prefixes");
const ArgumentValidator = require("../Handling/ArgumentValidator");

module.exports = new Command({
  aliases: ["updateprefix"],
  botPermissions: ["SEND_MESSAGES"],
  cooldown: 3000,
  description: "Set the Prefix of the bot",
  details: "Update or reset the prefix of the bot in the current server",
  devOnly: false,
  dmOnly: false,
  globalCooldown: 0,
  guildOnly: true,
  maxArgs: Infinity,
  minArgs: 1,
  name: "setprefix",
  noDisable: true,
  nsfw: false,
  testOnly: false,
  usage: "{prefix}setprefix <new prefix>",
  userPermissions: ["MANAGE_GUILD"],
  category: "configuration",
<<<<<<< HEAD
  validator: new ArgumentValidator({
    validate: ({ prefix, args }) => {
      if (args.join(" ").trim() === prefix) return "SAME_PREFIX";
    },
    onError: ({ message, client, error, language }) => {
      if (error === "SAME_PREFIX") {
        const res = client.defaultResponses.getValue(
          language,
          "PREFIX_COMMAND",
          "SAME_PREFIX",
          client.defaultResponses.fileData[language].PREFIX_COMMAND
            .SAME_PREFIX.embed
            ? {
                description: [],
              }
            : [],
        );
        if (res instanceof MessageEmbed) message.channel.send({ embed: res });
        else message.channel.send(res);
      }
    },
  }),
  run: async ({ args, client, message, prefix, language }) => {
=======
  run: async ({ args, client, message, prefix }) => {
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
    let prefixDoc = client.databaseCache.getDocument(
      "prefixes",
      message.guild.id,
    );
    if (!prefixDoc) prefixDoc = new prefixes({ gId: message.guild.id, prefix });

    const updatedPrefix = args.join(" ").trim();
<<<<<<< HEAD
    if (updatedPrefix === prefix) {
=======
    if (updatedPrefix === prefixDoc.prefix) {
      const res = client.defaultResponses.getValue(
        "PREFIX_COMMAND",
        "SAME_PREFIX",
        [],
      );
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((_) => message.channel.send(res));
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
    }

    prefixDoc.prefix = updatedPrefix;

    if (client.databaseCache.getDocument("prefixes", message.guild.id))
      client.databaseCache.updateDocument("prefixes", prefixDoc);
    else client.databaseCache.insertDocument("prefixes", prefixDoc);

    const successRes = client.defaultResponses.getValue(
<<<<<<< HEAD
      language,
      "PREFIX_COMMAND",
      "SUCCESS",
      client.defaultResponses.fileData[language].PREFIX_COMMAND
        .SUCCESS.embed
        ? {
            description: [
              {
                key: "GUILD_NAME",
                replace: message.guild.name,
              },
              {
                key: "PREFIX",
                replace: `\`${updatedPrefix}\``,
              },
            ],
          }
        : [
            {
              key: "GUILD_NAME",
              replace: message.guild.name,
            },
            {
              key: "PREFIX",
              replace: `\`${updatedPrefix}\``,
            },
          ],
    );
    if (successRes instanceof MessageEmbed)
      return message.channel.send({ embed: successRes });
    else return message.channel.send(successRes);
  },
});
=======
      "PREFIX_COMMAND",
      "SUCCESS",
      [
        {
          key: "GUILD_NAME",
          replace: message.guild.name,
        },
        {
          key: "PREFIX",
          replace: `\`${updatedPrefix}\``,
        },
      ],
    );
    return message.channel
      .send("", { embed: client.success({ msg: message, data: successRes }) })
      .catch((_) => message.channel.send(successRes));
  },
});
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
