require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')

const sauceRoutes = require('./routes/sauce')
const userRoutes = require('./routes/user');

const app = express();

// Connexion à la base de donnée mongoDB
mongoose.connect(process.env.DB_CONNECT, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((error) => console.log('Connexion à MongoDB échouée !') + error);

// Permet d'accéder à l'API depuis n'importe quelle origine
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Permet de parser les requêtes envoyées apr le client, on accède au body via 'req.body'
app.use(bodyParser.json());

// Permet de charger les images dans le dossier 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

// Préfix des routes par défaut pour les requêtes
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;