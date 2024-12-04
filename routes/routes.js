const express = require('express');
const router = express.Router();
const Stuff = require('../models/stuff');
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
        const stuffs = await Stuff.find({});
        res.render('index', {titulo: 'Inicio', stuffs: stuffs});
    } 
    catch (err){
        res.json({message: err.message});
    }
});

router.get('/add', (req, res) => {
    res.render('addstuff', {titulo: 'Agregar Piezas'});
});

// Add stuff
router.post('/add', upload, (req, res) => {
    const stuff = new Stuff({
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
        amount: req.body.amount,
        price: req.body.price,
        image: req.file.filename
    });

    stuff.save().then(() => {
        req.session.message = {
            type: 'success',
            message: 'Pieza agregada correctamente!'
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
        const stuff = await Stuff.findById(id);

        if(stuff == null) {
            res.redirect('/');
        }else{
            res.render('editstuff', {titulo: 'Editar Piezas', stuff: stuff});
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
        await Stuff.findByIdAndUpdate(id, {
            code: req.body.code,
            name: req.body.name,
            description: req.body.description,
            amount: req.body.amount,
            price: req.body.price,
            image: new_image
        });

        req.session.message = {
            type: 'success',
            message: 'Pieza agregada correctamente!'
        };

        res.redirect('/');
    } catch (err){
        res.json({
            message: err.message,
            type: 'danger'
        });
    }
}); 

// Delete stuff
router.get('/delete/:id', async (req, res) => {
    const id = req.params.id;

    try{
        const stuff = await Stuff.findByIdAndDelete(id);

        if(stuff != null && stuff.image != ''){
            try{
                fs.unlinkSync('./upload/' + resourceLimits.image);
            } catch (err){
                console.log(err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'Pieza eliminada correctamente!'
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