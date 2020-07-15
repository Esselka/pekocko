const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Schéma définissant un utilisateur
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

// Meilleure explication de l'erreur si tentative de création de compte avec la même adresse email
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);