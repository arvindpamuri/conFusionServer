const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

//didnt use CORS because it's not mentioned in the assignment instructions
favoriteRouter.route('/')
.get(authenticate.verifyUser, (req, res, next) => {
    //Favorites collection already exists in the db, hence not checking again if favorites exists or not
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('favorites')
    .then((userFavorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(userFavorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})

.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((userFavorite) => {
        //if user favorites already exist
        if (userFavorite != null) {
            for(var i=0; i<req.body.length; i++) {
                if (userFavorite.favorites.indexOf(req.body[i]._id) == -1)
                    userFavorite.favorites.push(req.body[i]._id);
            }
            userFavorite.save()
            .then((userFavorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(userFavorite);
            }, (err) => next(err));
        }
        //if user favorites don't exist
        else {
            let favorite = {};
            favorite.user = req.user._id;
            favorite.favorites = [];
            for(var i=0; i<req.body.length; i++) {
                console.log("test");
                favorite.favorites.push(req.body[i]._id);
            }
            Favorites.create(favorite)
            .then((userFavorite) => {
                console.log('Favorites added ', userFavorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(userFavorite);
            }, (err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((resp) => {
        resp.remove({})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        })
    }, (err) => next(err))
    .catch((err) => next(err));
})

favoriteRouter.route('/:dishId')
.get(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on this route');
})

.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on this route');
})

.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((userFavorite) => {
        //if user favorites already exist
        if (userFavorite != null) {
            //check if the favorite dish already exists 
            if (userFavorite.favorites.indexOf(req.params.dishId) == -1)
                userFavorite.favorites.push(req.params.dishId);
            userFavorite.save()
            .then((userFavorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(userFavorite);
            }, (err) => next(err));
        }
        //if user favorites doesn't exist
        else {
            let favorite = {};
            favorite.user = req.user._id;
            favorite.favorites = [];
            favorite.favorites.push(req.params.dishId);
            Favorites.create(favorite)
            .then((userFavorite) => {
                console.log('Favorite added ', userFavorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(userFavorite);
            }, (err) => next(err))
        }  
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((userFavorite) => {
        userFavorite.favorites.remove({_id: req.params.dishId});
        userFavorite.save()
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(userFavorite);
        })
    }, (err) => next(err))
    .catch((err) => next(err));
})

module.exports = favoriteRouter;
