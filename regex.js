const fs = require("fs");

const { MessageEmbed } = require("discord.js");

const d = new MessageEmbed();
d.thumbnail.

const txtFile = fs.readFileSync("temp.txt", { encoding: "utf-8" });

const codes = txtFile.match(/(\s[a-z][a-z]\s)/g);

fs.writeFileSync("temp.txt", codes.join("\n"));
