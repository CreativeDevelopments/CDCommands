const Event = require("./Event");
const {
  ValidatePermissions,
  ProperCase,
  ValidateRoles,
  FormatCooldown,
} = require("../Functions");
const { MessageEmbed } = require("discord.js");

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
    const language = client.getLanguage({
      guildId: message.guild ? message.guild.id : "",
      authorId: message.author.id,
    });

    // Guild Only
    if (command.guildOnly && !message.guild) {
      const res = client.defaultResponses.getValue(
        language,
        "GUILD_ONLY",
        "",
        client.defaultResponses.fileData[language].GUILD_ONLY.embed
          ? {
              description: [
                {
                  key: "COMMAND",
                  replace: ProperCase(command.name),
                },
              ],
            }
          : [
              {
                key: "COMMAND",
                replace: ProperCase(command.name),
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
    }
    // DM only
    if (command.dmOnly && message.guild) {
      const res = client.defaultResponses.getValue(
        language,
        "DM_ONLY",
        "",
        client.defaultResponses.fileData[language].DM_ONLY.embed
          ? {
              description: [
                {
                  key: "COMMAND",
                  replace: ProperCase(command.name),
                },
              ],
            }
          : [
              {
                key: "COMMAND",
                replace: ProperCase(command.name),
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
    }
    // NSFW Channel
    if (!message.channel.nsfw && command.nsfw) {
      const res = client.defaultResponses.getValue(
        language,
        "NSFW_ONLY",
        "",
        client.defaultResponses.fileData[language].NSFW_ONLY.embed
          ? {
              description: [
                {
                  key: "COMMAND",
                  replace: ProperCase(command.name),
                },
              ],
            }
          : [
              {
                key: "COMMAND",
                replace: ProperCase(command.name),
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
    }
    // Category/Command Disabled
    const DisabledDoc = client.databaseCache.getDocument(
      "disabledcommands",
      message.guild.id,
    );
    if (DisabledDoc && DisabledDoc.commands.includes(command.name)) {
      const res = client.defaultResponses.getValue(
        language,
        "DISABLED_COMMAND",
        "",
        client.defaultResponses.fileData[language].DISABLED_COMMAND.embed
          ? {
              description: [
                {
                  key: "COMMAND",
                  replace: ProperCase(command.name),
                },
              ],
            }
          : [
              {
                key: "COMMAND",
                replace: command.name,
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
    } else if (
      DisabledDoc &&
      DisabledDoc.categories.includes(command.category) &&
      !command.noDisable
    ) {
      const res = client.defaultResponses.getValue(
        language,
        "DISABLED_CATEGORY",
        "",
        client.defaultResponses.fileData[language].DISABLED_CATEGORY.embed
          ? {
              description: [
                {
                  key: "CATEGORY",
                  replace: command.category,
                },
              ],
            }
          : [
              {
                key: "CATEGORY",
                replace: command.category,
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
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
        language,
        "MISSING_CLIENT_PERMISSION",
        "",
        client.defaultResponses.fileData[language].MISSING_CLIENT_PERMISSION
          .embed
          ? {
              description: [
                {
                  key: "CLIENT_PERMISSIONS",
                  replace: clientPermCheck.perms,
                },
              ],
            }
          : [
              {
                key: "CLIENT_PERMISSIONS",
                replace: clientPermCheck.perms,
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
    }
    // Member Permissions
    if (memberPermCheck.perms !== null) {
      const res = client.defaultResponses.getValue(
        language,
        "MISSING_MEMBER_PERMISSION",
        "",
        client.defaultResponses.fileData[language].MISSING_MEMBER_PERMISSION
          .embed
          ? {
              description: [
                {
                  key: "MEMBER_PERMISSIONS",
                  replace: memberPermCheck.perms,
                },
              ],
            }
          : [
              {
                key: "MEMBER_PERMISSIONS",
                replace: memberPermCheck.perms,
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
    }
    // Required Roles
    const reqRolesDoc = client.databaseCache.getDocument(
      "requriedroles",
      message.guild.id,
    );
    if (reqRolesDoc) {
      const rolesRes = ValidateRoles(reqRolesDoc, message.member, command);
      if (rolesRes && !message.member.permissions.has("ADMINISTRATOR")) {
        const res = client.defaultResponses.getValue(
          language,
          "MISSING_ROLES",
          "",
          client.defaultResponses.fileData[language].MISSING_ROLES.embed
            ? {
                description: [
                  {
                    key: "ROLES",
                    replace: `**${rolesRes.roles}**`,
                  },
                  {
                    key: "COMMAND",
                    replace: command.name,
                  },
                ],
              }
            : [
                {
                  key: "ROLES",
                  replace: `**${rolesRes.roles}**`,
                },
                {
                  key: "COMMAND",
                  replace: command.name,
                },
              ],
        );
        if (res instanceof MessageEmbed)
          return message.channel.send({ embed: res });
        else return message.channel.send(res);
      }
    }
    // Developer only
    if (command.devOnly && !client.developers.includes(message.author.id)) {
      const res = client.defaultResponses.getValue(
        language,
        "DEVELOPER_ONLY",
        "",
        client.defaultResponses.fileData[language].DEVELOPER_ONLY.embed
          ? {
              description: [
                {
                  key: "COMMAND",
                  replace: command.name,
                },
              ],
            }
          : [
              {
                key: "COMMAND",
                replace: command.name,
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
    }
    // Test Server only
    if (command.testOnly && !client.testservers.includes(message.guild.id)) {
      const res = client.defaultResponses.getValue(
        language,
        "TEST_SERVER",
        "",
        client.defaultResponses.fileData[language].TEST_SERVER.embed
          ? {
              description: [
                {
                  key: "COMMAND",
                  replace: ProperCase(command.name),
                },
              ],
            }
          : [
              {
                key: "COMMAND",
                replace: ProperCase(command.name),
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
    }
    // Max args
    if (command.maxArgs !== Infinity && args.length > command.maxArgs) {
      const res = client.defaultResponses.getValue(
        language,
        "TOO_MANY_ARGS",
        "",
        client.defaultResponses.fileData[language].TOO_MANY_ARGS.embed
          ? {
              description: [
                {
                  key: "USAGE",
                  replace: `\`${command.usage.replace(/{prefix}/gi, prefix)}\``,
                },
              ],
            }
          : [
              {
                key: "USAGE",
                replace: `\`${command.usage.replace(/{prefix}/gi, prefix)}\``,
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
    }
    // Min args
    if (command.minArgs !== -1 && args.length < command.minArgs) {
      const res = client.defaultResponses.getValue(
        language,
        "TOO_FEW_ARGS",
        "",
        client.defaultResponses.fileData[language].TOO_MANY_ARGS.embed
          ? {
              description: [
                {
                  key: "USAGE",
                  replace: `\`${command.usage.replace(/{prefix}/gi, prefix)}\``,
                },
              ],
            }
          : [
              {
                key: "USAGE",
                replace: `\`${command.usage.replace(/{prefix}/gi, prefix)}\``,
              },
            ],
      );
      if (res instanceof MessageEmbed)
        return message.channel.send({ embed: res });
      else return message.channel.send(res);
    }
    // Validate arguments
    if (command.validator) {
      const valid = await command.validator.validate({
        message,
        args,
        client,
        prefix,
        language,
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
          language,
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
        const res = client.defaultResponses.getValue(
          language,
          "GLOBAL_COOLDOWN",
          "",
          client.defaultResponses.fileData[langauge].GLOBAL_COOLDOWN.embed
            ? {
                description: [
                  {
                    key: "COMMAND",
                    replace: ProperCase(command.name),
                  },
                  {
                    key: "COOLDOWN",
                    replace: FormatCooldown(remainingTime),
                  },
                ],
              }
            : [
                {
                  key: "COMMAND",
                  replace: ProperCase(command.name),
                },
                {
                  key: "COOLDOWN",
                  replace: FormatCooldown(remainingTime),
                },
              ],
        );
        if (res instanceof MessageEmbed)
          return message.channel.send({ embed: res });
        else return message.channel.send(res);
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
        const res = client.defaultResponses.getValue(
          language,
          "USER_COOLDOWN",
          "",
          client.defaultResponses.fileData[language].USER_COOLDOWN.embed
            ? {
                description: [
                  {
                    key: "COMMAND",
                    replace: command.name,
                  },
                  {
                    key: "COOLDOWN",
                    replace: FormatCooldown(remainingTime),
                  },
                ],
              }
            : [
                {
                  key: "COMMAND",
                  replace: command.name,
                },
                {
                  key: "COOLDOWN",
                  replace: FormatCooldown(remainingTime),
                },
              ],
        );
        if (res instanceof MessageEmbed)
          return message.channel.send({ embed: res });
        else return message.channel.send(res);
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

    return command.run({ message, args, client, prefix, language });
  }
});