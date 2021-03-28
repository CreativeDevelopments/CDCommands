const { Schema, model } = require("mongoose");

const userLanguage = new Schema({
  uId: { type: String, required: true },
  language: { type: String, required: false, default: "en" },
});

module.exports = model("userLanguages", userLanguage);
