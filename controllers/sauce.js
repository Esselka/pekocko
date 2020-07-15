const Sauce = require('../models/Sauce');
const fs = require('fs');

// Création d'une nouvelle sauce dans la BDD
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};

// Récupère les données d'une sauce dont l'id === _id
exports.getOneSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
}

/**
 * On crée un objet sauceObject qui regarde si req.file existe ou non. 
 * S'il existe, on traite la nouvelle image ; s'il n'existe pas, on traite simplement l'objet entrant. 
 * On crée ensuite une instance Sauce à partir de sauceObject , puis on effectue la modification.
 */
exports.modifySauce = (req, res) => {
    // S'il y a une nouvelle image, doit supprimer l'ancienne et mettre à jour l'URI de la nouvelle
    if (req.file) {
        // Crée un objet sauceObjet pour mettre à jour l'URI de l'image
        const sauceObject = {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            }
            // Recherche de l'URI de l'image actuelle pour suppression, 
            // ce qui évite d'avoir des images inutilisées dans la BDD
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
                        .catch(error => res.status(400).json({ error }));
                })
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        // S'il n'y a pas de nouvelle image, récupère les données du body et met à jour la sauce
        const sauceObject = {...req.body };
        Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
            .catch(error => res.status(400).json({ error }));
    }
}

// Suppression d'une sauce dans la BDD dont l'id === _id
exports.deleteSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(500).json({ error }));
}

// Récupération de toutes les sauces de la BDD
exports.getAllSauces = (req, res) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}

// Gestion des likes pour les sauces
exports.likeSauces = (req, res) => {
    const bodyObj = req.body;
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            switch (bodyObj.like) {
                case 1:
                    // Si le tableau [usersLiked] ne contient pas userId alors 
                    // incrémente likes de 1 et ajoute userId dans [usersLiked]
                    if (!sauce.usersLiked.includes(bodyObj.userId)) {
                        sauce.likes++;
                        sauce.usersLiked.push(bodyObj.userId);
                    }
                    // Si le tableau [usersDisliked] contient userId alors 
                    // décrémente dislikes de 1 et enlève userId dans [usersDisliked]
                    if (sauce.usersDisliked.includes(bodyObj.userId)) {
                        sauce.dislikes--;
                        sauce.usersDisliked = sauce.usersDisliked.filter(item => item != bodyObj.userId);
                    }
                    sauce.save();
                    break;
                case 0:
                    // Si le tableau [usersLiked] contient userId alors 
                    // décrémente likes de 1 et enlève userId dans [usersLiked]
                    if (sauce.usersLiked.includes(bodyObj.userId)) {
                        sauce.likes--;
                        sauce.usersLiked = sauce.usersLiked.filter(item => item != bodyObj.userId);
                    }
                    // Si le tableau [usersDisliked] contient userId alors 
                    // décrémente dislikes de 1 et enlève userId dans [usersDisliked]
                    if (sauce.usersDisliked.includes(bodyObj.userId)) {
                        sauce.dislikes--;
                        sauce.usersDisliked = sauce.usersDisliked.filter(item => item != bodyObj.userId);
                    }
                    sauce.save()
                    break;
                case -1:
                    // Si le tableau [usersDisliked] ne contient pas userId alors 
                    // incrémente dislikes de 1 et ajoute userId dans [usersDisliked]
                    if (!sauce.usersDisliked.includes(bodyObj.userId)) {
                        sauce.dislikes++;
                        sauce.usersDisliked.push(bodyObj.userId);
                    }
                    // Si le tableau [usersLiked] contient userId alors 
                    // décrémente likes de 1 et enlève userId dans [usersLiked]
                    if (sauce.usersLiked.includes(bodyObj.userId)) {
                        sauce.likes--;
                        sauce.usersLiked = sauce.usersLiked.filter(item => item != bodyObj.userId);
                    }
                    sauce.save();
                    break;
                default:
                    // Ne rien faire si like != -1 | 0 | 1
                    break;
            }
        })
        .then(res.status(200).json({ message: 'Choix like effectué !' }))
        .catch(error => res.status(404).json({ error }));
}