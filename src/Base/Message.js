const { Message } = require("discord.js");
const Event = require("./Event");
const {
  ValidatePermissions,
  ProperCase,
  ValidateRoles,
  FormatCooldown,
} = require("../Functions");

module.exports = new Event("message", async (client, message) => {
  const prefix = message.guild
    ? client.databaseCache.getDocument("prefixes", message.guild.id)
      ? client.databaseCache.getDocument("prefixes", message.guild.id).prefix
      : client.defaultPrefix
    : client.defaultPrefix;

  const args = message.content.trim().slice(prefix.length).split(/ +/g);
  const commandName = args.shift().toLowerCase();

  if (!message.content.startsWith(prefix)) return;

  const command =
    client.commands.get(commandName) ||
    client.commands.get(client.aliases.get(commandName));
  if (command) {
    // Guild Only
    if (command.guildOnly && !message.guild) {
      const res = client.defaultResponses.getValue("GUILD_ONLY", "", [
        {
          key: "COMMAND",
          replace: ProperCase(command.name),
        },
      ]);
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    }
    // DM only
    if (command.dmOnly && message.guild) {
      const res = client.defaultResponses.getValue("DM_ONLY", "", [
        {
          key: "COMMAND",
          replace: ProperCase(command.name),
        },
      ]);
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    }
    // NSFW Channel
    if (!message.channel.nsfw && command.nsfw) {
      const res = client.defaultResponses.getValue("NSFW_ONLY", "", [
        {
          key: "COMMAND",
          replace: ProperCase(command.name),
        },
      ]);
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    }
    // Category/Command Disabled
    const DisabledDoc = client.databaseCache.getDocument(
      "disabledcommands",
      message.guild.id,
    );
    if (DisabledDoc && DisabledDoc.commands.includes(command.name)) {
      const res = client.defaultResponses.getValue("DISABLED_COMMAND", "", [
        {
          key: "COMMAND",
          replace: command.name,
        },
      ]);
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    } else if (
      DisabledDoc &&
      DisabledDoc.categories.includes(command.category) &&
      !command.noDisable
    ) {
      const res = client.defaultResponses.getValue("DISABLED_CATEGORY", "", [
        {
          key: "CATEGORY",
          replace: command.category,
        },
      ]);
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    }
    const memberPermCheck = ValidatePermissions(
      message.member.permissions.toArray(),
      command.userPermissions,
    );
    const clientPermCheck = ValidatePermissions(
      message.guild.me.permissions.toArray(),
      command.botPermissions,
    );
    // Client Permissions
    if (clientPermCheck.perms !== null) {
      const res = client.defaultResponses.getValue(
        "MISSING_CLIENT_PERMISSION",
        "",
        [
          {
            key: "CLIENT_PERMISSIONS",
            replace: clientPermCheck.perms,
          },
        ],
      );
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    }
    // Member Permissions
    if (memberPermCheck.perms !== null) {
      const res = client.defaultResponses.getValue(
        "MISSING_MEMBER_PERMISSION",
        "",
        [
          {
            key: "MEMBER_PERMISSIONS",
            replace: memberPermCheck.perms,
          },
        ],
      );
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    }
    // Required Roles
    const reqRolesDoc = client.databaseCache.getDocument(
      "requriedroles",
      message.guild.id,
    );
    if (reqRolesDoc) {
      const rolesRes = ValidateRoles(reqRolesDoc, message.member, command);
      if (rolesRes) {
        const res = client.defaultResponses.getValue("MISSING_ROLES", "", [
          {
            key: "ROLES",
            replace: `**${rolesRes.roles}**`,
          },
          {
            key: "COMMAND",
            replace: command.name,
          },
        ]);
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((err) => message.channel.send(res));
      }
    }
    // Developer only
    if (command.devOnly && !client.developers.includes(message.author.id)) {
      const res = client.defaultResponses.getValue("DEVELOPER_ONLY", "", [
        {
          key: "COMMAND",
          replace: command.name,
        },
      ]);
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    }
    // Test Server only
    if (command.testOnly && !client.testservers.includes(message.guild.id)) {
      const res = client.defaultResponses.getValue("TEST_SERVER", "", [
        {
          key: "COMMAND",
          replace: ProperCase(command.name),
        },
      ]);
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    }
    // Max args
    if (command.maxArgs !== Infinity && args.length > command.maxArgs) {
      const res = client.defaultResponses.getValue("TOO_MANY_ARGS", "", [
        {
          key: "USAGE",
          replace: `\`${command.usage.replace(/{prefix}/gi, prefix)}\``,
        },
      ]);
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    }
    // Min args
    if (command.minArgs !== -1 && args.length < command.minArgs) {
      const res = client.defaultResponses.getValue("TOO_FEW_ARGS", "", [
        {
          key: "USAGE",
          replace: `\`${command.usage.replace(/{prefix}/gi, prefix)}\``,
        },
      ]);
      return message.channel
        .send("", { embed: client.error({ msg: message, data: res }) })
        .catch((err) => message.channel.send(res));
    }
    // Validate arguments
    if (command.validator) {
      const valid = await command.validator.validate({
        message,
        args,
        client,
        prefix,
      });
      if (valid !== false && typeof valid !== "string") {
        if (command.validator.onSuccess !== undefined)
          await command.validator.onSuccess(message);
      } else {
        return command.validator.onError({
          message,
          client,
          prefix,
          args,
          error: typeof valid === "string" ? valid : "INVALID_ARGUMENT",
        });
      }
    }

    // Global Cooldown
    if (client.cooldowns.isOnCooldown(message.author, commandName, "global")) {
      const remainingTime = client.cooldowns.getRemainingCooldown(
        message.author,
        commandName,
        "global",
      );
      if (remainingTime !== undefined) {
        const res = client.defaultResponses.getValue("GLOBAL_COOLDOWN", "", [
          {
            key: "COMMAND",
            replace: ProperCase(command.name),
          },
          {
            key: "COOLDOWN",
            replace: FormatCooldown(remainingTime),
          },
        ]);
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((err) => message.channel.send(res));
      }
    }
    // Cooldown
    if (client.cooldowns.isOnCooldown(message.author, commandName, "local")) {
      const remainingTime = client.cooldowns.getRemainingCooldown(
        message.author,
        commandName,
        "local",
      );
      if (remainingTime !== undefined) {
        const res = client.defaultResponses.getValue("USER_COOLDOWN", "", [
          {
            key: "COMMAND",
            replace: command.name,
          },
          {
            key: "COOLDOWN",
            replace: FormatCooldown(remainingTime),
          },
        ]);
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((err) => message.channel.send(res));
      }
    }

    client.cooldowns.setCooldown(
      message.author,
      commandName,
      new Date(Date.now() + command.globalCooldown),
      "global",
    );
    client.cooldowns.setCooldown(
      message.author,
      commandName,
      new Date(Date.now() + command.cooldown),
      "local",
    );

    return command.run({ message, args, client, prefix });
  }
});