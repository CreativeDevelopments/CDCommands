const { Command } = require("../../src/index");

module.exports = new Command({
  category: "aaa",
  description: "Aaa",
  details: "aa",
  devOnly: false,
  dmOnly: false,
  guildOnly: false,
  maxArgs: Infinity,
  minArgs: 0,
  name: "test",
  noDisable: false,
  nsfw: false,
  testOnly: false,
  usage: "asdadsa",
  run({ message, args, prefix, client }) {
    client.tickets.create({
      msg: message,
      prefix,
      name: "AHHHHHHHHHHHH",
      reason: "Yes",
    });
  },
});
