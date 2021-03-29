const { Schema, model } = require("mongoose");

const prefixSystem = new Schema({
  gId: { type: String, required: true },
  prefix: { type: String, required: true },
});

module.exports = model("prefixes", prefixSystem);
