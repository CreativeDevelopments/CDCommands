const { Schema, model } = require('mongoose');

const requiredRoles = new Schema({
    gId: { type: String, required: true },
    requiredRoles: { type: [Object], required: false },
});

module.exports = model('required-roles', requiredRoles)