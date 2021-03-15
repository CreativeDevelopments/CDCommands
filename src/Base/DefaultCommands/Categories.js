const DisabledCommands = require("../../Database/models/disabled-commands");
const Command = require("../Command");

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
  run: function ({ args, client, message, prefix }) {
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
    const categories = new Set(client.commands.map((c) => c.category));

    if (enabledDisabled !== "enable" && enabledDisabled !== "disable") {
      const res = client.defaultResponses.getValue(
        "CATEGORY_COMMAND",
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

    if (!categories.has(categoryName)) {
      const res = client.defaultResponses.getValue(
        "CATEGORY_COMMAND",
        "NON_EXISTANT_CATEGORY",
        [
          {
            key: "CATEGORY",
            replace: categoryName,
          },
        ],
      );
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((_) => message.channel.send(res));
    }

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
