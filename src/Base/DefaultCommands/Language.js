const { MessageEmbed } = require("discord.js");
const guildLanguage = require("../../Database/models/guildLanguage");
const userLanguage = require("../../Database/models/userLanguage");
const Command = require("../Command");
const ArgumentValidator = require("../Handling/ArgumentValidator");
const valid_codes = Object.keys(require("../Handling/Languages.json"));

module.exports = new Command({
  name: "language",
  aliases: ["lang"],
  category: "configuration",
  description: "Allows the configuration of the bot language",
  details:
    "Allows the guild owner/guild member to configure their desired language of the bot, if the bot has the requested language setup",
  devOnly: false,
  dmOnly: false,
  guildOnly: true,
  usage: "{prefix}language <ISO 639-1 Code>",
  maxArgs: 1,
  minArgs: 1,
  noDisable: true,
  nsfw: false,
  testOnly: false,
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  userPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  cooldown: 5000,
  globalCooldown: 0,
  validator: new ArgumentValidator({
    validate: ({ args, client }) => {
      if (!valid_codes.includes(args[0])) return "INVALID_ISO_CODE";
      if (!Object.keys(client.defaultResponses.fileData).includes(args[0]))
        return "UNPROVIDED_LANGUAGE";
    },
    onError: ({ args, prefix, client, message, error }) => {
      /** @type {keyof import("../Handling/Languages.json")} */
      // const language = client.databaseCache.getDocument(
      //   "userLanguage",
      //   message.author.id,
      // )
      //   ? client.databaseCache.getDocument("userLanguage", message.author.id)
      //       .language
      //   : client.databaseCache.getDocument("guildLanguage", message.guild.id)
      //   ? client.databaseCache.getDocument("guildLanguage", message.guild.id)
      //       .language
      //   : "en";
      const language = client.getLanguage({
        guildId: message.guild.id,
        authorId: message.author.id,
      });

      if (error === "INVALID_ISO_CODE") {
        let res = client.defaultResponses.getValue(
          language,
          "LANGUAGE_COMMAND",
          "INVALID_ISO_CODE",
          client.defaultResponses.fileData.en.LANGUAGE_COMMAND.INVALID_ISO_CODE
            .embed !== undefined
            ? {
                description: [{ key: "ISO_CODE", replace: args[0] }],
              }
            : [
                {
                  key: "ISO_CODE",
                  replace: args[0],
                },
              ],
        );

        if (res instanceof MessageEmbed) message.channel.send({ embed: res });
        else message.channel.send(res);
      } else if (error === "UNPROVIDED_LANGUAGE") {
        let res = client.defaultResponses.getValue(
          language,
          "LANGUAGE_COMMAND",
          "UNPROVIDED_LANGUAGE",
          client.defaultResponses.fileData.en.LANGUAGE_COMMAND
            .UNPROVIDED_LANGUAGE.embed !== undefined
            ? {
                description: [
                  { key: "ISO_CODE", replace: args[0] },
                  {
                    key: "PROVIDED_CODES",
                    replace: Object.keys(client.defaultResponses.fileData).join(
                      ", ",
                    ),
                  },
                ],
              }
            : [
                {
                  key: "ISO_CODE",
                  replace: args[0],
                },
                {
                  key: "PROVIDED_CODES",
                  replace: Object.keys(client.defaultResponses.fileData).join(
                    ", ",
                  ),
                },
              ],
        );

        if (res instanceof MessageEmbed) message.channel.send({ embed: res });
        else message.channel.send(res);
      }
    },
  }),
  async run({ prefix, args, client, message }) {
    const owner =
      message.author.id ===
      (await message.guild.members.fetch(message.guild.owner.id)).id;
    if (owner) {
      const document =
        client.databaseCache.getDocument("guildLanguage", message.guild.id) ||
        new guildLanguage({
          gId: message.guild.id,
        });

      document.language = args[0];

      if (!client.databaseCache.getDocument("guildLanguage", message.guild.id))
        client.databaseCache.insertDocument("guildLanguage", document);
      else client.databaseCache.updateDocument("guildLanguage", document);
    } else {
      const document =
        client.databaseCache.getDocument("userLanguage", message.author.id) ||
        new userLanguage({
          uId: message.author.id,
        });

      document.language = args[0];

      if (!client.databaseCache.getDocument("userLanguage", message.author.id))
        client.databaseCache.insertDocument("userLanguage", document);
      else client.databaseCache.updateDocument("userLanguage", document);
    }

    /** @type {keyof import("../Handling/Languages.json")} */
    const language = client.getLanguage({
      guildId: message.guild.id,
      authorId: message.author.id,
    });

    const res = client.defaultResponses.getValue(
      language,
      "LANGUAGE_COMMAND",
      "SUCCESS",
      client.defaultResponses.fileData.en.LANGUAGE_COMMAND.SUCCESS.embed
        ? {
            description: [
              {
                key: "USER_GUILD",
                replace: owner ? message.guild.name : message.author.username,
              },
              {
                key: "ISO_CODE",
                replace: `**${args[0]}**`,
              },
            ],
          }
        : [
            {
              key: "USER_GUILD",
              replace: owner ? message.guild.name : message.author.username,
            },
            {
              key: "ISO_CODE",
              replace: `**${args[0]}**`,
            },
          ],
    );

    if (res instanceof MessageEmbed)
      return message.channel.send({ embed: res });
    else return message.channel.send(res);
  },
});
