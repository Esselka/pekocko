require('dotenv').config()
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Enregistrement de nouveau utilisateurs
exports.signup = (req, res) => {
    // Appel la fonction de hachage de bcrypt dans notre mot de passe et lui 
    // demandons de "saler" le mot de passe 10 fois = hachage plus sécurisé.
    bcrypt.hash(req.body.password, 10)
        // Création d'un nouvel utilisateur et enregistrement dans la BDD
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                // Réponse de réussite en cas de succès
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                // Erreur avec le code d'erreur en cas d'échec
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Authentification d'un utilisateur
exports.login = (req, res) => {
    // Vérifie que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la BDD
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                // Si le mail de l'utilisateur n'a pas été trouvé, renvoie une erreur 401 Unauthorized
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            // La fonction compare de bcrypt permet de comparer le mot de passe entré
            // par l'utilisateur avec le hash enregistré dans la base de donnée
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // S'ils ne correspondent pas, renvoie une erreur 401 Unauthorized
                    // et un message "Mot de passe incorrect !"
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    // S'ils correspondent, les informations d'identification de notre utilisateur sont valides. 
                    // Dans ce cas, renvoie une réponse 200 contenant l'ID utilisateur et un token.
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, { expiresIn: '30min' })
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};