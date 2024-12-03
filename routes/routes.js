const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { resourceLimits } = require('worker_threads');

const carpetaUpload = path.join(__dirname, '../upload');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, carpetaUpload)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});

var upload = multer({ storage: storage }).single('image');

// Routes
router.get('/', async (req, res) => {
    try{
        const users = await User.find({});
        res.render('index', {titulo: 'Inicio', users: users});
    } 
    catch (err){
        res.json({message: err.message});
    }
});

router.get('/add', (req, res) => {
    res.render('adduser', {titulo: 'Agregar Usuario'});
});

// Add user
router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });

    user.save().then(() => {
        req.session.message = {
            type: 'success',
            message: 'Usuario agregado correctamente!'
        };

        res.redirect('/');
    }).catch((err) => {
        res.json({
            message: err.message,
            type: 'danger'
        });
    });
});

// Edit user
router.get('/edit/:id', async (req, res) => {
    const id = req.params.id;

    try{
        const user = await User.findById(id);

        if(user == null) {
            res.redirect('/');
        }else{
            res.render('edituser', {titulo: 'Editar Usuario', user: user});
        }
    } catch (err){
        res.status(500).send(err);
    }
});

router.post('/update/:id', upload, async (req, res) => {
    const id = req.params.id;
    let new_image = '';

    if(req.file){
        new_image = req.file.filename;

        try{
            fs.unlinkSync('./upload' + req.body.old_image);
        } catch (err){
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try{
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image
        });

        req.session.message = {
            type: 'success',
            message: 'Usuario agregado correctamente!'
        };

        res.redirect('/');
    } catch (err){
        res.json({
            message: err.message,
            type: 'danger'
        });
    }
}); 

// Delete user
router.get('/delete/:id', async (req, res) => {
    const id = req.params.id;

    try{
        const user = await User.findByIdAndDelete(id);

        if(user != null && user.image != ''){
            try{
                fs.unlinkSync('./upload/' + resourceLimits.image);
            } catch (err){
                console.log(err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'Usuario eliminado correctamente!'
        };

        res.redirect('/');

    } catch (err){
        res.json({
            message: err.message,
            type: 'danger'
        });
    }
});

module.exports = router;