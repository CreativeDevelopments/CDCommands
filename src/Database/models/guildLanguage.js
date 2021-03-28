const { Schema, model } = require("mongoose");

const guildLanguage = new Schema({
  gId: { type: String, required: true },
  guildLanguage: { type: String, required: false, default: "en" },
});

module.exports = model("guildLanguages", guildLanguage);
