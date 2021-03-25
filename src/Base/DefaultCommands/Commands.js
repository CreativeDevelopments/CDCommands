const DisabledCommands = require("../../Database/models/disabled-commands");
const Command = require("../Command");
const ArgumentValidator = require("../Handling/ArgumentValidator");

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
    onError: ({ args, prefix, message, client, error }) => {
      if (error === "INVALID_ARGS_0") {
        const res = client.defaultResponses.getValue(
          "COMMANDS_COMMAND",
          "INVALID_ARGS_ERROR",
          [
            {
              key: "USAGE",
              replace: `${prefix}command <enable/disable> <command>`,
            },
          ],
        );
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => message.channel.send(res));
      } else if (error === "INVALID_ARGS_1") {
        const res = client.defaultResponses.getValue(
          "COMMANDS_COMMAND",
          "NON_EXISTANT_COMMAND",
          [
            {
              key: "COMMAND",
              replace: args[1],
            },
          ],
        );
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => message.channel.send(res));
      }
    },
  }),
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