require('dotenv').config()
const jwt = require('jsonwebtoken');

/**
 * Vérification du TOKEN de l'utilisateur, si le seveur reconnait que le TOKEN a bien été créé par lui et
 * que le userId correspond alors valide la requête de l'utilisateur
 */
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            res.status(401).json({ error: 'UserId non valide !' });
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({ error });
    }
};