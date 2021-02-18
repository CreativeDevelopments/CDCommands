const { Schema, model } = require('mongoose');

const disabledCommands = new Schema({
    gId: { type: String, required: true },
    commands: { type: [String], required: false },
    categories: { type: [String], required: false },
});

module.exports = model('disabled-commands', disabledCommands)