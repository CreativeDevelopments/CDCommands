const { Schema, model } = require("mongoose");

const language = new Schema({
  gId: { type: String, required: true },
  guildLanguage: { type: String, required: false, default: "en" },
  userLangs: { type: Array, required: false, default: [] },
});

module.exports = model("languages", language);
