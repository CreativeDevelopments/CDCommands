const Command = require("../Command");
const { MessageEmbed } = require('discord.js');
const ArgumentValidator = require("../Handling/ArgumentValidator");
const DisabledCommands = require("../../Database/models/disabled-commands");

module.exports = new Command({
  aliases: ["cmd"],
  botPermissions: ["SEND_MESSAGES"],
  cooldown: 3000,
  description: "Enable or disable commands",
  details:
    "Allows you to enable or disable specific commands in the current server",
  devOnly: false,
  dmOnly: false,
  globalCooldown: 0,
  guildOnly: true,
  maxArgs: 2,
  minArgs: 2,
  name: "command",
  noDisable: true,
  nsfw: false,
  testOnly: false,
  usage: "{prefix}command <enable/disable> <command>",
  userPermissions: ["MANAGE_GUILD"],
  category: "configuration",
  validator: new ArgumentValidator({
    validate: ({ args, client, message, prefix }) => {
      const commands = new Set(client.commands.map((c) => c.name));
      if (args[0] !== "enable" && args[0] !== "disable")
        return "INVALID_ARGS_0";
      else if (!commands.has(args[1])) return "INVALID_ARGS_1";
    },
    onError: ({ args, prefix, message, client, error, language }) => {
      if (error === "INVALID_ARGS_0") {
        const res = client.defaultResponses.getValue(
          language,
          "COMMANDS_COMMAND",
          "INVALID_ARGS_ERROR",
          client.defaultResponses.fileData[language].COMMANDS_COMMAND
            .INVALID_ARGS_ERROR.embed
            ? {
                description: [
                  {
                    key: "USAGE",
                    replace: `\`${prefix}command <enable/disable> <command>\``,
                  },
                ],
              }
            : [
                {
                  key: "USAGE",
                  replace: `\`${prefix}command <enable/disable> <command>\``,
                },
              ],
        );
        
        if (res instanceof MessageEmbed) message.channel.send({ embed: res });
        else message.channel.send(res);
      } else if (error === "INVALID_ARGS_1") {
        const res = client.defaultResponses.getValue(
          language,
          "COMMANDS_COMMAND",
          "NON_EXISTANT_COMMAND",
          client.defaultResponses.fileData[language].COMMANDS_COMMAND
            .NON_EXISTANT_COMMAND.embed
            ? {
                description: [
                  {
                    key: "COMMAND",
                    replace: args[0],
                  },
                ],
              }
            : [
                {
                  key: "COMMAND",
                  replace: args[1],
                },
              ],
        );
        if (res instanceof MessageEmbed) message.channel.send({ embed: res });
        else message.channel.send(res);
      }
    },
  }),
  run: async ({ message, client, args, language }) => {
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
    const commandName = args[1];

    if (enabledDisabled === "enable") {
      const res = client.defaultResponses.getValue(
        language,
        "COMMANDS_COMMAND",
        "ALREADY_ENABLED",
        client.defaultResponses.fileData[language].COMMANDS_COMMAND
          .ALREADY_ENABLED.embed
          ? {
              description: [
                {
                  key: "COMMAND",
                  replace: commandName,
                },
              ],
            }
          : [
              {
                key: "COMMAND",
                replace: commandName,
              },
            ],
      );
      if (!DisabledDoc.commands.includes(commandName)) {
        if (res instanceof MessageEmbed)
          return message.channel.send({ embed: res });
        else return message.channel.send(res);
      }
      
      const i = DisabledDoc.commands.findIndex((v) => v === commandName);
      DisabledDoc.commands.splice(i, 1);
    } else if (enabledDisabled === "disable") {
      if (client.commands.get(commandName).noDisable) {
        const res = client.defaultResponses.getValue(
          language,
          "COMMANDS_COMMAND",
          "NO_DISABLE",
          client.defaultResponses.fileData[language].COMMANDS_COMMAND
            .NO_DISABLE.embed
            ? {
                description: [
                  {
                    key: "COMMAND",
                    replace: commandName,
                  },
                ],
              }
            : [
                {
                  key: "COMMAND",
                  replace: commandName,
                },
              ],
        );
        if (res instanceof MessageEmbed)
          return message.channel.send({ embed: res });
        else return message.channel.send(res);
      }

      if (DisabledDoc.commands.includes(commandName)) {
        const res = client.defaultResponses.getValue(
          language,
          "COMMANDS_COMMAND",
          "ALREADY_DISABLED",
          client.defaultResponses.fileData[language].COMMANDS_COMMAND
            .ALREADY_DISABLED.embed
            ? {
                description: [
                  {
                    key: "COMMAND",
                    replace: commandName,
                  },
                ],
              }
            : [
                {
                  key: "COMMAND",
                  replace: commandName,
                },
              ],
        );
        if (res instanceof MessageEmbed)
          return message.channel.send({ embed: res });
        else return message.channel.send(res);
      }
      DisabledDoc.commands.push(commandName);
    }

    if (!client.databaseCache.getDocument("disabledcommands", message.guild.id))
      client.databaseCache.insertDocument("disabledcommands", DisabledDoc);
    else client.databaseCache.updateDocument("disabledcommands", DisabledDoc);

    const successRes = client.defaultResponses.getValue(
      language,
      "COMMANDS_COMMAND",
      "SUCCESS",
      client.defaultResponses.fileData[language].COMMANDS_COMMAND
        .SUCCESS.embed
        ? {
            description: [
              {
                key: "ACTION",
                replace: `${enabledDisabled}d`,
              },
              {
                key: "COMMAND",
                replace: commandName,
              },
            ],
          }
        : [
            {
              key: "ACTION",
              replace: `${enabledDisabled}d`,
            },
            {
              key: "COMMAND",
              replace: commandName,
            },
          ],
    );

    if (successRes instanceof MessageEmbed)
      return message.channel.send({ embed: successRes });
    else return message.channel.send(successRes);
  },
});
