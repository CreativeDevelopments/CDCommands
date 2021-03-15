const Command = require("../Command");
const { MessageEmbed } = require("discord.js");
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
<<<<<<< HEAD
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
          client.defaultResponses.fileData[language].COMMANDS_COMMAND.NO_DISABLE
            .embed
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
      client.defaultResponses.fileData[language].COMMANDS_COMMAND.SUCCESS.embed
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
=======
  run: async ({ prefix, message, client, args }) => {
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
    const commands = new Set(client.commands.map((c) => c.name));

    if (enabledDisabled !== "enable" && enabledDisabled !== "disable") {
      const res = client.defaultResponses.getValue(
        "COMMANDS_COMMAND",
        "INVALID_ARGS_ERROR",
        [
          {
            key: "USAGE",
            replace: this.usage.replace(/{prefix}/g, prefix),
          },
        ],
      );
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((_) => message.channel.send(res));
    }

    if (!commands.has(commandName)) {
      const res = client.defaultResponses.getValue(
        "COMMANDS_COMMAND",
        "NON_EXISTANT_COMMAND",
        [
          {
            key: "COMMAND",
            replace: commandName,
          },
        ],
      );
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((_) => message.channel.send(res));
    }

    if (enabledDisabled === "enable") {
      const res = client.defaultResponses.getValue(
        "COMMANDS_COMMAND",
        "ALREADY_ENABLED",
        [
          {
            key: "COMMAND",
            replace: commandName,
          },
        ],
      );
      if (!DisabledDoc.commands.includes(commandName))
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => message.channel.send(res));
      const i = DisabledDoc.commands.findIndex((v) => v === commandName);
      DisabledDoc.commands.splice(i, 1);
    } else if (enabledDisabled === "disable") {
      if (client.commands.get(commandName).noDisable) {
        const res = client.defaultResponses.getValue(
          "COMMANDS_COMMAND",
          "NO_DISABLE",
          [
            {
              key: "COMMAND",
              replace: commandName,
            },
          ],
        );
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => msg.channel.send(res));
      }

      if (DisabledDoc.commands.includes(commandName)) {
        const res = client.defaultResponses.getValue(
          "COMMANDS_COMMAND",
          "ALREADY_DISABLED",
          [
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
            {
              key: "COMMAND",
              replace: commandName,
            },
          ],
<<<<<<< HEAD
    );

    if (successRes instanceof MessageEmbed)
      return message.channel.send({ embed: successRes });
    else return message.channel.send(successRes);
  },
});
=======
        );
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => message.channel.send(res));
      }
      DisabledDoc.commands.push(commandName);
    }

    if (!client.databaseCache.getDocument("disabledcommands", message.guild.id))
      client.databaseCache.insertDocument("disabledcommands", DisabledDoc);
    else client.databaseCache.updateDocument("disabledcommands", DisabledDoc);

    const successRes = client.defaultResponses.getValue(
      "COMMANDS_COMMAND",
      "SUCCESS",
      [
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

    return message.channel
      .send("", { embed: client.success({ msg: message, data: successRes }) })
      .catch((_) => message.channel.send(successRes));
  },
});
>>>>>>> 6b07f04 (prettier decided to format everything, but what actually happened is only in the Ticket.js, index.js, CDClient.js and tests folder)
