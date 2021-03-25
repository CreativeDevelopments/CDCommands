const { MessageEmbed, Message } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const { CDClient } = require("./Base/CDClient");

class Ticket {
  /**
   * @private
   * @type {CDClient}
   */
  _client;
  /**
   *
   * @param {CDClient} client
   * @param  {...any} otherParamsYouwant
   */
  constructor(client, ...otherParamsYouwant) {
    this._client = client;
  }

  /**
   *
   * @param {Object} param0
   * @param {Message} param0.msg
   * @param {string} param0.name
   * @param {string} param0.reason
   * @param {string} param0.prefix
   * @returns
   */
  // Do this for all your functions
  async create({ msg, name, reason, prefix }) {
    if (!msg)
      return this._client.logError({
        data: `Please provide a valid "msg" for creating a ticket!`,
      });

    if (!name) name = `${msg.author.username}`;

    if (!reason) reason = "No reason provided";

    const ticketConfDoc = this._client.databaseCache.getDocument(
      "ticketconfig",
      msg.guild.id,
    );
    if (!ticketConfDoc || !ticketConfDoc.supportRoles)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data: `This server does not have a support role set! Please ask an administrator to set one with \`${prefix}tconf role add <@Role / Role ID / Role Name>\`!`,
          }),
        })
        .catch((_) =>
          msg.channel.send(
            `This server does not have a support role set! Please ask an administrator to set one with \`${prefix}tconf role add <@Role / Role ID / Role Name>\`!`,
          ),
        );

    const maxTickets = ticketConfDoc.maxTickets || 1;
    const category = ticketConfDoc.category;
    const role = msg.guild.roles.cache.get(ticketConfDoc.supportRoles);
    if (!role)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data: `I failed to find the support role, it may have been deleted! Please ask an administrator to set a new one with \`${prefix}tconf role add <@Role / Role ID / Role Name>\`!`,
          }),
        })
        .catch((_) =>
          msg.channel.send(
            `I failed to find the support role, it may have been deleted! Please ask an administrator to set a new one with \`${prefix}tconf role add <@Role / Role ID / Role Name>\`!`,
          ),
        );

    const results = this._client.databaseCache.getDocument("tickets", {
      gId: msg.guild.id,
      uId: msg.author.id,
    });
    if (results && results.length === maxTickets)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data: `You already have the maximum number of tickets you can have open at one time! Please close that ticket before opening a new one!`,
          }),
        })
        .catch((_) =>
          msg.channel.send(
            `You already have the maximum number of tickets you can have open at one time! Please close that ticket before opening a new one!`,
          ),
        );

    let chan;
    try {
      chan = await msg.guild.channels.create(name, {
        type: "text",
        permissionOverwrites: [
          {
            id: msg.author.id,
            allow: 117760,
          },
          {
            id: role.id,
            allow: 117760,
          },
          {
            id: msg.guild.id,
            deny: 1024,
          },
        ],
        topic: `Ticket owner --> ${msg.author.tag} | Reason --> ${reason}`,
        reason: `Opening ticket for ${msg.author.tag}`,
      });

      if (category) {
        let cat =
          msg.guild.channels.cache.get(category) ||
          msg.guild.channels.cache.find((ch) => ch.name === category);
        if (!cat)
          this._client.logError({ data: `Failed to find the category` });
        if (cat.type !== "category")
          this._client.logError({
            data: "The category provided is an invalid category",
          });
        console.log(chan, cat);
        chan.setParent(cat.id, {
          lockPermissions: false,
          reason: `Opening ticket for ${msg.author.tag}`,
        });
      }
    } catch (err) {
      this._client.logError({ data: `Failed to create a new ticket!, ${err}` });
      msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data: `Failed to create a new ticket, please try again!`,
          }),
        })
        .catch((_) =>
          msg.channel.send(`Failed to create a new ticket, please try again!`),
        );
    }

    msg.delete();

    const chanEmbed = new MessageEmbed()
      .setColor("#2FDD2C")
      .setDescription(
        `Welcome to your ticket, ${msg.author}!\n\nReason: ${reason}`,
      );
    chan
      .send(`${role}, ${msg.author}`, chanEmbed)
      .catch((_) =>
        chan.send(
          `${role}, ${msg.author}`,
          `Weclome to your ticket, ${msg.author}!\n\nReason: ${reason}`,
        ),
      );

    const embed = new MessageEmbed()
      .setColor("#2FDD2C")
      .setDescription(`Your ticket has successfully been created in ${chan}`);

    msg.channel
      .send(embed)
      .catch((_) =>
        msg.channel.send(
          `Your ticket has successfully been created in ${chan}`,
        ),
      );

    this._client.databaseCache.insertDocument("tickets", {
      gId: msg.guild.id,
      uId: msg.author.id,
      channelId: chan.id,
      ticketName: name,
      claim: false,
      closed: false,
      reason: reason,
    });

    const logChan = msg.guild.channels.cache.get(ticketConfDoc.log);
    if (logChan) {
      const embed = new MessageEmbed()
        .setColor("#00DCFF")
        .setAuthor(msg.author.username, msg.author.displayAvatarURL())
        .setTitle("Ticket Opened")
        .addFields(
          { name: "Ticket", value: chan, inline: true },
          { name: "Opened By", value: msg.author.tag, inline: true },
          { name: "Reason", value: reason, inline: false },
        )
        .setTimestamp();

      logChan.send(embed);
    }
  }

  async open({ msg, reason }) {
    if (!msg)
      return this._client.logError({
        data: 'Please provide a valid "msg" for opening a ticket!',
      });

    if (!reason) reason = "No reason provided";

    const result = await this._client.databaseCache.getDocument("tickets", {
      gId: msg.guild.id,
      channelId: msg.channel.id,
    });
    if (!result || result.channelId !== msg.channel.id)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data:
              "This channel is not linked to a ticket, you can only re open ticket channels!",
          }),
        })
        .catch((_) =>
          msg.channel.send(
            "This channel is not linked to a ticket, you can only re open ticket channels!",
          ),
        );

    if (!result.closed)
      return msg.channel
        .send("", {
          embed: client.error({
            msg: msg,
            data:
              "This ticket has not been closed! You can only re-open closed tickets!",
          }),
        })
        .catch((_) =>
          msg.channel.send(
            "This ticket has not been closed! You can only re-open closed tickets!",
          ),
        );

    const ticketConfDoc = this._client.databaseCache.getDocument(
      "ticketconfig",
      msg.guild.id,
    );

    const name = msg.channel.name.replace("closed-", "");

    await msg.channel.setName(name);

    if (
      ticketConfDoc.category &&
      ticketConfDoc.category !== msg.channel.parentID
    ) {
      try {
        await msg.channel.setParent(ticketConfDoc.category, {
          lockPermissions: false,
          reason: `Re opening ticket ${name}`,
        });
      } catch (err) {
        this._client.logError({ data: err });
        return msg.channel.send("", {
          embed: client.error({
            msg: msg,
            data: "Failed to close the ticket, please try again!",
          }),
        });
      }
    }

    msg.delete();
    msg.channel
      .send("", {
        embed: client.success({
          msg: msg,
          data: `Ticket opened by ${msg.author}`,
        }),
      })
      .catch((err) => msg.channel.send(`Ticket opened by ${msg.author}`));

    this._client.databaseCache.updateDocument(
      "tickets",
      {
        gId: msg.guild.id,
        channelId: msg.channel.id,
      },
      {
        gId: msg.guild.id,
        closed: false,
      },
    );

    const logChan = msg.guild.channels.cache.get(ticketConfDoc.log);
    if (logChan) {
      const embed = new MessageEmbed()
        .setColor("")
        .setAuthor(msg.author.username, msg.author.displayAvatarURL())
        .setTitle("Ticket Opened")
        .addFields(
          { name: "Ticket", value: msg.channel, inline: true },
          { name: "Opened By", value: msg.author.tag, inline: true },
          { name: "Reason", value: reason, inline: false },
        )
        .setTimestamp();

      logChan.send(embed);
    }
  }

  async close({ msg, reason }) {
    if (!msg)
      return this._client.logError({
        data: 'Please provide a valid "msg" for closing a ticket!',
      });

    if (!reason) reason = "No reason provided!";

    const result = await this._client.databaseCache.getDocument("tickets", {
      gId: msg.guild.id,
      channelId: msg.channel.id,
    });
    if (!result || result.channelId !== msg.channel.id)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data:
              "This channel is not linked to a ticket, you can only close ticket channels!",
          }),
        })
        .catch((err) =>
          msg.channel.send(
            "This channel is not linked to a ticket, you can only close ticket channels!",
          ),
        );

    if (result.closed)
      return msg.channel
        .send("", {
          embed: client.error({
            msg: msg,
            data:
              "This ticket has not been closed! You can only re-open closed tickets!",
          }),
        })
        .catch((err) =>
          msg.channel.send(
            "This ticket has not been closed! You can only re-open closed tickets!",
          ),
        );

    const ticketConfDoc = this._client.databaseCache.getDocument(
      "ticketconfig",
      msg.guild.id,
    );

    if (result.channelId === msg.channel.id) {
      await msg.channel.setName(`closed-${msg.channel.name}`);

      if (ticketConfDoc.close) {
        try {
          await msg.channel.setParent(ticketConfDoc.close, {
            lockPermissions: false,
            reason: `Closing ticket ${msg.channel.name}`,
          });
        } catch (err) {
          this._client.logError({ data: err });
          return msg.channel
            .send("", {
              embed: client.error({
                msg: msg,
                data: "Failed to close the ticket, please try again!",
              }),
            })
            .catch((err) =>
              msg.channel.send("Failed to close the ticket, please try again!"),
            );
        }
      }

      msg.delete();
      msg.channel
        .send("", {
          embed: client.success({
            msg: msg,
            data: `Ticket closed by ${msg.author}\nYou can re open the ticket with the open command`,
          }),
        })
        .catch((err) =>
          msg.channel.send(
            `Ticket closed by ${msg.author}\nYou can re open the ticket with the open command`,
          ),
        );

      this._client.databaseCache.updateDocument(
        "tickets",
        {
          gId: msg.guild.id,
          channelId: msg.channel.id,
        },
        {
          gId: msg.guild.id,
          closed: true,
        },
      );

      const logChan = msg.guild.channels.cache.get(ticketConfDoc.log);
      if (logChan) {
        const embed = new MessageEmbed()
          .setColor("#00DCFF")
          .setAuthor(msg.author.username, msg.author.displayAvatarURL())
          .setTitle("Ticket Closed")
          .addFields(
            { name: "Ticket", value: msg.channel, inline: true },
            { name: "Closed By", value: msg.author.tag, inline: true },
            { name: "Reason", value: reason, inline: false },
          )
          .setTimestamp();

        logChan.send(embed);
      }
    }
  }

  async delete({ msg, reason }) {
    if (!msg)
      return this._client.logError({
        data: 'Please provide a valid "msg" for closing a ticket!',
      });

    if (!reason) reason = "No reason provided!";

    const result = await this._client.databaseCache.getDocument("tickets", {
      gId: msg.guild.id,
      channelId: msg.channel.id,
    });
    if (!result || result.channelId !== msg.channel.id)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data:
              "This channel is not linked to a ticket, you can only delete ticket channels!",
          }),
        })
        .catch((err) =>
          msg.channel.send(
            "This channel is not linked to a ticket, you can only delete ticket channels!",
          ),
        );

    if (msg.channel.id === result.channelId) {
      msg.channel
        .send("", {
          embed: this._client.info({
            msg: msg,
            data: `Deleting the ticket in 5 seconds...`,
          }),
        })
        .catch((err) =>
          msg.channel.send(`Deleting the ticket in 5 seconds...`),
        );

      try {
        setTimeout(
          () =>
            msg.channel.delete({
              reason: `Deleting ticket for ${msg.author.tag}`,
            }),
          5000,
        );
      } catch (err) {
        this._client.logError({ data: err });
        return msg.channel
          .send("", {
            embed: this._client.error({
              msg: msg,
              data: "Failed to delete the ticket, please try again!",
            }),
          })
          .catch((err) =>
            msg.channel.send("Failed to delete the ticket, please try again!"),
          );
      }

      this._client.databaseCache
        .deleteDocument({ gId: msg.guild.id, channelId: msg.channel.id })
        .catch((err) =>
          this._client.logError({
            data: "Failed to remove a ticket from the database!",
          }),
        );

      const ticketConfDoc = this._client.databaseCache.getDocument(
        "ticketconfig",
        msg.guild.id,
      );

      const logChan = msg.guild.channels.cache.get(ticketConfDoc.log);
      if (logChan) {
        const embed = new MessageEmbed()
          .setColor("#00DCFF")
          .setAuthor(msg.author.username, msg.author.displayAvatarURL())
          .setTitle("Ticket Deleted")
          .addFields(
            { name: "Ticket", value: msg.channel.name, inline: true },
            { name: "Deleted By", value: msg.author.tag, inline: true },
            { name: "Reason", value: reason, inline: false },
          )
          .setTimestamp();

        logChan.send(embed);
      }
    }
  }

  async claim({ msg }) {
    if (!msg)
      return this._client.logError({
        data: 'Please provide a valid "msg" for creating a ticket!',
      });

    const result = await this._client.databaseCache.getDocument("tickets", {
      gId: msg.guild.id,
      channelId: msg.channel.id,
    });
    if (!result || result.channelId !== msg.channel.id)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data:
              "This channel is not linked to a ticket, you can only claim ticket channels!",
          }),
        })
        .catch((err) =>
          msg.channel.send(
            "This channel is not linked to a ticket, you can only claim ticket channels!",
          ),
        );

    if (result && result.claim)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data: "This ticket has already been claimed!",
          }),
        })
        .catch((err) =>
          msg.channel.send("This ticket has already been claimed!"),
        );

    const ticketConfDoc = this._client.databaseCache.getDocument(
      "ticketconfig",
      msg.guild.id,
    );
    if (ticketConfDoc === "off")
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data: "This server has disabled claiming tickets!",
          }),
        })
        .catch((err) =>
          msg.channel.send("This server has disabled claiming tickets!"),
        );

    if (result.channelId === msg.channel.id) {
      try {
        msg.channel.updateOverwrite(
          [
            {
              id: result.supportRole,
              deny: 1024,
            },
            {
              id: msg.author.id,
              allow: 117760,
            },
          ],
          `Claiming ticket for ${msg.author.tag}`,
        );
      } catch (err) {
        this._client.logError({ data: err });
        return msg.channel
          .send("", {
            embed: client.error({
              msg: msg,
              data: "Failed to claim the ticket, please try again!",
            }),
          })
          .catch((err) =>
            msg.channel.send("Failed to claim the ticket, please try again!"),
          );
      }

      this._client.databaseCache.updateDocument(
        "tickets",
        {
          gId: msg.guild.id,
          channelId: msg.channel.id,
        },
        {
          gId: msg.guild.id,
          claim: true,
          claimId: msg.author.id,
        },
      );

      msg.delete();
      msg.channel
        .send("", {
          embed: this._client.success({
            msg: msg,
            data: "Successfully claimed the ticket!",
          }),
        })
        .catch((err) => msg.channel.send("Successfully claimed the ticket!"));

      const logChan = msg.guild.channels.cache.get(ticketConfDoc.log);
      if (logChan) {
        const embed = new MessageEmbed()
          .setColor("#00DCFF")
          .setAuthor(msg.author.username, msg.author.displayAvatarURL())
          .setTitle("Ticket Claimed")
          .addFields(
            { name: "Ticket", value: msg.channel, inline: true },
            { name: "Claimed by", value: msg.author.tag, inline: true },
          )
          .setTimestamp();

        logChan.send(embed);
      }
    }
  }

  async unclaim({ msg }) {
    if (!msg)
      return this._client.logError({
        data: 'Please provid a valid "msg" for unclaiming a ticket!',
      });

    const result = await this._client.databaseCache.getDocument("tickets", {
      gId: msg.guild.id,
      channelId: msg.channel.id,
    });
    if (!result || result.channelId !== msg.channel.id)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data:
              "This channel is not linked to a ticket, you can only claim / unclaim ticket channels!",
          }),
        })
        .catch((err) =>
          msg.channel.send(
            "This channel is not linked to a ticket, you can only claim / unclaim ticket channels!",
          ),
        );

    if (result && !result.claim)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data: "This ticket has not been claimed yet!",
          }),
        })
        .catch((err) =>
          msg.channel.send("This ticket has not been claimed yet!"),
        );

    const ticketConfDoc = this._client.databaseCache.getDocument(
      "ticketconfig",
      msg.guild.id,
    );
    if (ticketConfDoc === "off")
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data: "This server has disabled claiming tickets!",
          }),
        })
        .catch((err) =>
          msg.channel.send("This server has disabled claiming tickets!"),
        );

    if (result.channelId === msg.channel.id) {
      try {
        msg.channel.updateOverwrite(
          [
            {
              id: msg.author.id,
              deny: 1024,
            },
            {
              id: result.supportRole,
              allow: 117760,
            },
          ],
          `Unclaiming a ticket for ${msg.author.tag}`,
        );
      } catch (err) {
        this._client.logError({ data: err });
        return msg.channel
          .send("", {
            embed: this._client.error({
              msg: message,
              data: "Failed to unclaim the ticket, please try again!",
            }),
          })
          .catch((err) =>
            msg.channel.send("Failed to unclaim the ticket, please try again!"),
          );
      }

      this._client.databaseCache.updateDocument(
        "tickets",
        {
          gId: msg.guild.id,
          channelId: msg.channel.id,
        },
        {
          gId: msg.guild.id,
          claim: false,
          claimId: null,
        },
      );

      msg.delete();
      msg.channel
        .send("", {
          embed: this._client.success({
            msg: msg,
            data: "Successfully unclaimed the ticket!",
          }),
        })
        .catch((err) => msg.channel.send("Successfully unclaimed the ticket!"));

      const logChan = msg.guild.channels.cache.get(ticketConfDoc.log);
      if (logChan) {
        const embed = new MessageEmbed()
          .setColor("#00DCFF")
          .setAuthor(msg.author.username, msg.author.displayAvatarURL())
          .setTitle("Ticket Unclaimed")
          .addFields(
            { name: "Ticket", value: msg.channel, inline: true },
            { name: "Deleted By", value: msg.author.tag, inline: true },
            { name: "Reason", value: reason, inline: true },
          )
          .setTimestamp();

        logChan.send(embed);
      }
    }
  }

  async rename({ msg, name }) {
    if (!msg)
      return this._client.logError({
        data: 'Please provide a valid "msg" for renaming a ticket!',
      });
    if (!name)
      return this._client.logError({
        data: 'Please provide a valid "name" for renaming a ticket!',
      });

    const result = await this._client.databaseCache.getDocument("tickets", {
      gId: msg.guild.id,
      channelId: msg.channel.id,
    });
    if (!result || result.channelId !== msg.channel.id)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data:
              "This channel is not linked to a ticket, you can only delete ticket channels!",
          }),
        })
        .catch((err) =>
          msg.channel.send(
            "This channel is not linked to a ticket, you can only delete ticket channels!",
          ),
        );

    if (result.channelId === msg.channel.id) {
      try {
        await msg.channel.setName(name, { reason: "Renaming a ticket" });
      } catch (err) {
        this._client.logError({ data: err });
        return msg.channel
          .send("", {
            embed: this._client.error({
              msg: msg,
              data: "Failed to update the ticket name, please try again!",
            }),
          })
          .catch((err) =>
            msg.channel.send(
              "Failed to update the ticket name, please try again!",
            ),
          );
      }

      msg.delete();
      msg.channel
        .send("", {
          embed: this._client.success({
            msg: msg,
            data: `Successfully renamed the ticket to ${name}!`,
          }),
        })
        .catch((err) =>
          msg.channel.send(`Successfully renamed the ticket to ${name}!`),
        );

      const ticketConfDoc = this._client.databaseCache.getDocument(
        "ticketconfig",
        msg.guild.id,
      );

      const logChan = msg.guild.channels.cache.get(ticketConfDoc.log);
      if (logChan) {
        const embed = new MessageEmbed()
          .setColor("#00DCFF")
          .setAuthor(msg.author.username, msg.author.displayAvatarURL())
          .setTitle("Ticket Updated")
          .addFields(
            { name: "Ticket", value: msg.channel, inline: false },
            { name: "Old Name", value: msg.channel.name, inline: true },
            { name: "New Name", value: name, inline: true },
          )
          .setTimestamp();

        logChan.send(embed);
      }
    }
  }

  async add({ msg, user }) {
    if (!msg)
      return this._client.logError({
        data: 'Please provide a valid "msg" for adding someone to a ticket!',
      });

    if (!user)
      return this._client.logError({
        data: 'Please provide a valid "user" for adding someone to a ticket!',
      });

    const result = await this._client.databaseCache.getDocument("tickets", {
      gId: msg.guild.id,
      channelId: msg.channel.id,
    });
    if (!result || result.channelId !== msg.channel.id)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data: `You can only add users to a ticket!`,
          }),
        })
        .catch((err) =>
          msg.channel.send(`You can only add users to a ticket!`),
        );

    if (result.channelId === msg.channel.id) {
      try {
        msg.channel.updateOverwrite(
          [
            {
              id: user.id,
              allow: 117760,
            },
          ],
          `Adding ${user.user.tag} to ticket #${msg.channel.name}`,
        );
      } catch (err) {
        this._client.logError({ data: err });
        return msg.channel
          .send("", {
            embed: this._client.error({
              msg: msg,
              data: `Failed to add ${user.user.tag} to the ticket #${msg.channel.name}!`,
            }),
          })
          .catch((err) =>
            msg.channel.send(
              `Failed to add ${user.user.tag} to the ticket #${msg.channel.name}!`,
            ),
          );
      }

      msg.delete();
      msg.channel
        .send("", {
          embed: this._client.success({
            msg: msg,
            data: `Successfully added ${user} to the ticket!`,
          }),
        })
        .catch((err) =>
          msg.channel.send(`Successfully added ${user} to the ticket!`),
        );

      const ticketConfDoc = this._client.databaseCache.getDocument(
        "ticketconfig",
        msg.guild.id,
      );

      const logChan = msg.guild.channels.cache.get(ticketConfDoc.log);
      if (logChan) {
        const embed = new MessageEmbed()
          .setColor("#00DCFF")
          .setAuthor(msg.author.username, msg.author.displayAvatarURL())
          .setTitle("Ticket Updated")
          .addFields(
            { name: "Ticket", value: msg.channel, inline: false },
            { name: "User Added", value: user, inline: true },
          )
          .setTimestamp();

        logChan.send(embed);
      }
    }
  }

  async remove({ msg, user }) {
    if (!msg)
      return this._client.logError({
        data:
          'Please provide a valid "msg" for removing someone from a ticket!',
      });

    if (!user)
      return this._client.logError({
        data:
          'Please provide a valid "user" for removing someone from a ticket!',
      });

    const result = await this._client.databaseCache.getDocument("tickets", {
      gId: msg.guild.id,
      channelId: msg.channel.id,
    });
    if (!result || result.channelId !== msg.channel.id)
      return msg.channel
        .send("", {
          embed: this._client.error({
            msg: msg,
            data: `You can only remove users from a ticket!`,
          }),
        })
        .catch((err) =>
          msg.channel.send(`You can only remove users from a ticket!`),
        );

    if (result.channelId === msg.channel.id) {
      try {
        msg.channel.updateOverwrite(
          user,
          {
            VIEW_CHANNEL: false,
            READ_MESSAGES: false,
          },
          `Removing ${user.user.tag} from ticket #${msg.channel.name}`,
        );
      } catch (err) {
        this._client.logError({ data: err });
        return msg.channel
          .send("", {
            embed: this._client.error({
              msg: msg,
              data: `Failed to remove ${user.user.tag} from the ticket #${msg.channel.name}!`,
            }),
          })
          .catch((err) =>
            msg.channel.send(
              `Failed to remove ${user.user.tag} from the ticket #${msg.channel.name}!`,
            ),
          );
      }

      msg.delete();
      msg.channel
        .send("", {
          embed: this._client.success({
            msg: msg,
            data: `Successfully removed ${user} from the ticket!`,
          }),
        })
        .catch((err) =>
          msg.channel.send(`Successfully removed ${user} from the ticket!`),
        );

      const ticketConfDoc = this._client.databaseCache.getDocument(
        "ticketconfig",
        msg.guild.id,
      );

      const logChan = msg.guild.channels.cache.get(ticketConfDoc.log);
      if (logChan) {
        const embed = new MessageEmbed()
          .setColor("#00DCFF")
          .setAuthor(msg.author.username, msg.author.displayAvatarURL())
          .setTitle("Ticket Updated")
          .addFields(
            { name: "Ticket", value: msg.channel, inline: false },
            { name: "User Removed", value: user, inline: true },
          )
          .setTimestamp();

        logChan.send(embed);
      }
    }
  }
}

module.exports = Ticket;
