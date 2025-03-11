const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profile_Picture: String,
    role: {type: String, enum: ["Admin", "Project Manager","Member"], default: "Member"},
    contact_info: { 
        phone: String,
        location: String,
    },
}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);