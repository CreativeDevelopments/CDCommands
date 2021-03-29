const { MessageEmbed } = require("discord.js");
const DisabledCommands = require("../../Database/models/disabled-commands");
const Command = require("../Command");
const ArgumentValidator = require("../Handling/ArgumentValidator");

module.exports = new Command({
  aliases: ["categories"],
  botPermissions: ["SEND_MESSAGES"],
  cooldown: 3000,
  description: "Enable or disable categories",
  details:
    "Allows you to enable or disable entire categories of bot commands in the current server",
  devOnly: false,
  dmOnly: false,
  globalCooldown: 0,
  guildOnly: true,
  maxArgs: 2,
  minArgs: 2,
  name: "category",
  noDisable: true,
  nsfw: false,
  testOnly: false,
  usage: "{prefix}category <enable/disable> <category>",
  userPermissions: ["MANAGE_GUILD"],
  category: "configuration",
  validator: new ArgumentValidator({
    validate: ({ args, client, message }) => {
      const categories = new Set(client.commands.map((c) => c.category));

      if (args[0] !== "enable" && args[0] !== "disable")
        return "INVALID_ARGS_0";
      else if (!categories.has(args[1])) return "INVALID_ARGS_1";
    },
    onError: ({ client, message, error, prefix, args }) => {
      const language = client.getLanguage({
        guildId: message.guild.id,
        authorId: message.author.id,
      });

      if (error === "INVALID_ARGS_0") {
        const res = client.defaultResponses.getValue(
          language,
          "CATEGORY_COMMAND",
          "INVALID_ARGS_ERROR",
          client.defaultResponses.fileData[language].CATEGORY_COMMAND
            .INVALID_ARGS_ERROR.embed
            ? {
                description: [
                  {
                    key: "USAGE",
                    replace: `${prefix}category <enable/disable> <category>`,
                  },
                ],
              }
            : [
                {
                  key: "USAGE",
                  replace: `${prefix}category <enable/disable> <category>`,
                },
              ],
        );

        if (res instanceof MessageEmbed) message.channel.send({ embed: res });
        else message.channel.send(res);
      } else if (error === "INVALID_ARGS_1") {
        const res = client.defaultResponses.getValue(
          language,
          "CATEGORY_COMMAND",
          "NON_EXISTANT_CATEGORY",
          client.defaultResponses.fileData[language].CATEGORY_COMMAND
            .NON_EXISTANT_CATEGORY.embed
            ? {
                description: [
                  {
                    key: "CATEGORY",
                    replace: args[0],
                  },
                ],
              }
            : [
                {
                  key: "CATEGORY",
                  replace: args[0],
                },
              ],
        );
        if (res instanceof MessageEmbed) message.channel.send({ embed: res });
        else message.channel.send(res);
      }
    },
  }),
  run: ({ args, client, message, prefix }) => {
    let DisabledDoc = client.databaseCache.getDocument(
      "disabledcommands",
      message.guild.id,
    );
    if (!DisabledDoc)
      DisabledDoc = new DisabledCommands({
        gId: message.guild.id,
        commands: [],
        categories: [],
      });

    const enabledDisabled = args[0].toLowerCase();
    const categoryName = args[1];

    if (enabledDisabled === "enable") {
      const res = client.defaultResponses.getValue(
        "CATEGORY_COMMAND",
        "ALREADY_ENABLED",
        [
          {
            key: "CATEGORY",
            replace: categoryName,
          },
        ],
      );
      if (!DisabledDoc.categories.includes(categoryName))
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => message.channel.send(res));
      const i = DisabledDoc.categories.findIndex((v) => v === categoryName);
      DisabledDoc.categories.splice(i, 1);
    } else if (enabledDisabled === "disable") {
      const res = client.defaultResponses.getValue(
        "CATEGORY_COMMAND",
        "ALREADY_DISABLED",
        [
          {
            key: "CATEGORY",
            replace: categoryName,
          },
        ],
      );
      if (DisabledDoc.categories.includes(categoryName))
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => message.channel.send(res));
      DisabledDoc.categories.push(categoryName);
    }

    if (!client.databaseCache.getDocument("disabledcommands", message.guild.id))
      client.databaseCache.insertDocument("disabledcommands", DisabledDoc);
    else client.databaseCache.updateDocument("disabledcommands", DisabledDoc);

    const successRes = client.defaultResponses.getValue(
      "CATEGORY_COMMAND",
      "SUCCESS",
      [
        {
          key: "ACTION",
          replace: `${enabledDisabled}d`,
        },
        {
          key: "CATEGORY",
          replace: categoryName,
        },
      ],
    );
    return message.channel
      .send("", { embed: client.success({ msg: message, data: successRes }) })
      .catch((_) => message.channel.send(successRes));
  },
});
