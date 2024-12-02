const express = require('express');
const authentication = require('./middleware/authentication.js');
const guard = require('./model/guard.js');

const router = express.Router();

//get all guards data
router.get('/guards', authentication, async (req, res)=>{
    try{
        const guards = await guard.find();
        res.json(guards);

    }
    catch(err){
        res.json({message: err});
    }
});

//get guard by id
router.get('/guards/:id', authentication, async (req, res)=>{
    try{
        const id = req.params.id;

        const guardData = await guard.findById(id);
        res.json(guardData);
    }catch(err){
        res.json({message: err});
    }
});

//add guard
router.post('/guards', authentication, async (req, res)=>{
    try{
        const {} = new guard(req.body);
        await guardData.save();
    }catch(err){
        res.json({message: err});
    }
});