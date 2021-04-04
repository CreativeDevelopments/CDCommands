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
  usage: "{prefix}setprefix <new_prefix>",
  userPermissions: ["MANAGE_GUILD"],
  category: "configuration",
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
          client.defaultResponses.fileData[language].PREFIX_COMMAND.SAME_PREFIX
            .embed
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
    let prefixDoc = client.databaseCache.getDocument(
      "prefixes",
      message.guild.id,
    );
    if (!prefixDoc) prefixDoc = new prefixes({ gId: message.guild.id, prefix });

    const updatedPrefix = args.join(" ").trim();
    if (updatedPrefix === prefix) {
    }

    prefixDoc.prefix = updatedPrefix;

    if (client.databaseCache.getDocument("prefixes", message.guild.id))
      client.databaseCache.updateDocument("prefixes", prefixDoc);
    else client.databaseCache.insertDocument("prefixes", prefixDoc);

    const successRes = client.defaultResponses.getValue(
      language,
      "PREFIX_COMMAND",
      "SUCCESS",
      client.defaultResponses.fileData[language].PREFIX_COMMAND.SUCCESS.embed
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
