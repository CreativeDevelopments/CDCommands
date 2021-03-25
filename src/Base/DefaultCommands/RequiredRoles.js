const requiredRoles = require("../../Database/models/required-roles");
const Command = require("../Command");
const ArgumentValidator = require("../Handling/ArgumentValidator");

module.exports = new Command({
  aliases: ["reqroles"],
  cooldown: 3000,
  description: "Set or remove required roles",
  details:
    "Allows you to set or remove required roles for a specific command in the current server",
  devOnly: false,
  dmOnly: false,
  globalCooldown: 0,
  guildOnly: true,
  maxArgs: 3,
  minArgs: 3,
  name: "requiredroles",
  noDisable: true,
  nsfw: false,
  testOnly: false,
  usage: "{prefix}requiredroles [add/remove] [role] [command]",
  userPermissions: ["MANAGE_ROLES"],
  botPermissions: ["SEND_MESSAGES"],
  category: "configuration",
  validator: new ArgumentValidator({
    validate: ({ args, client, message, prefix }) => {
      const role =
        message.mentions.roles.first() ||
        message.guild.roles.cache.get(args[1]);
      if (args[0] !== "add" && args[0] !== "remove") return "INVALID_ARGS_0";
      else if (!role) return "NO_ROLE";
      else if (!client.commands.get(args[2])) return "UNKNOWN_COMMAND";
    },
    onError: ({ args, prefix, message, client, error }) => {
      if (error === "INVALID_ARGS_0") {
        const res = client.defaultResponses.getValue(
          "ROLES_COMMAND",
          "INVALID_ARGUMENTS",
          [
            {
              key: "USAGE",
              replace: `${prefix}requiredroles [add/remove] [role] [command`,
            },
          ],
        );
        message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => msg.channel.send(res));
      } else if (error === "NO_ROLE") {
        const res = client.defaultResponses.getValue(
          "ROLES_COMMAND",
          "INVALID_ROLE",
          [
            {
              key: "ACTION",
              replace: args[0],
            },
          ],
        );
        message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => message.channel.send(res));
      } else if (error === "UNKNOWN_COMMAND") {
        const res = client.defaultResponses.getValue(
          "ROLES_COMMAND",
          "INVALID_COMMAND",
          [
            {
              key: "COMMAND",
              replace: args[2],
            },
          ],
        );
        message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => message.channel.send(res));
      }
    },
  }),
  run: async ({ args, client, message, prefix }) => {
    let reqRolesDoc = client.databaseCache.getDocument(
      "requriedroles",
      message.guild.id,
    );
    if (!reqRolesDoc)
      reqRolesDoc = new requiredRoles({
        gId: message.guild.id,
      });

    const addRemove = args[0];
    const role =
      message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    const command = args[2];

    const reqRolesObject = reqRolesDoc.requiredRoles.find(
      (ob) => ob.command === command,
    );
    if (addRemove === "add") {
      if (reqRolesObject) {
        if (reqRolesObject.roles.find((s) => s === role.id)) {
          const res = client.defaultResponses.getValue(
            "ROLES_COMMAND",
            "ALREADY_ADDED",
            [
              {
                key: "ROLE",
                replace: `**${role.name}**`,
              },
              {
                key: "COMMAND",
                replace: `**${command}**`,
              },
            ],
          );
          return message.channel
            .send("", { embed: client.error({ msg: message, data: res }) })
            .catch((_) => message.channel.send(res));
        }
        reqRolesObject.roles.push(role.id);
      } else {
        reqRolesDoc.requiredRoles.push({
          command,
          roles: [role.id],
        });
      }
    } else if (addRemove === "remove") {
      if (reqRolesObject) {
        if (!reqRolesObject.roles.find((s) => s === role.id)) {
          const res = client.defaultResponses.getValue(
            "ROLES_COMMAND",
            "ALREADY_REMOVED",
            [
              {
                key: "ROLE",
                replace: `**${role.name}**`,
              },
              {
                key: "COMMAND",
                replace: `**${command}**`,
              },
            ],
          );
          return message.channel
            .send("", { embed: client.error({ msg: message, data: res }) })
            .catch((_) => message.channel.send(res));
        }
        const i = reqRolesObject.roles.findIndex((s) => s === role.id);
        reqRolesObject.roles.splice(i, 1);
      } else {
        const res = client.defaultResponses.getValue(
          "ROLES_COMMAND",
          "ALREADY_REMOVED",
          [
            {
              key: "ROLE",
              replace: `**${role.name}**`,
            },
            {
              key: "COMMAND",
              replace: `**${command}**`,
            },
          ],
        );
        return message.channel
          .send("", { embed: client.error({ msg: message, data: res }) })
          .catch((_) => message.channel.send(res));
      }
    }

    if (!client.databaseCache.getDocument("requriedroles", message.guild.id))
      client.databaseCache.insertDocument("requriedroles", reqRolesDoc);
    else client.databaseCache.updateDocument("requriedroles", reqRolesDoc);

    const successRes = client.defaultResponses.getValue(
      "ROLES_COMMAND",
      "SUCCESS",
      [
        {
          key: "ACTION",
          replace: `${addRemove === "add" ? "added" : "removed"}`,
        },
        {
          key: "ROLE",
          replace: `**${role.name}**`,
        },
        {
          key: "COMMAND",
          replace: command,
        },
      ],
    );
    return message.channel
      .send("", { embed: client.success({ msg: message, data: successRes }) })
      .catch((_) => message.channel.send(successRes));
  },
});