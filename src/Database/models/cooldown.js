const { Schema, model } = require('mongoose');

const cooldownSystem = new Schema({
    uId: { type: String, required: false },
    type: { type: String, required: true },
    name: { type: String, required: true },
    cooldown: { type: Date, required: true },
});

module.exports = model('cd-cooldowns', cooldownSystem);