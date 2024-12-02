const express = require('express');
const authentication = require('./middleware/authentication.js');
const society  = require('./model/society.js');
const router = express.Router();

//get all societies data
router.get('/society', authentication, async (req, res)=>{
    try{
        const societies = await society.find();
        res.json(societies);
    }
    catch(err){
        res.json({message: err});
    }
});

//get society by id
router.get('/society/:id', authentication, async (req, res)=>{
    try{
        const societyId = req.params.id;

        const societyData = await society.findById(societyId);
        res.json(societyData);

    }
    catch(err){
        res.json({message: err});
    }
});

//add society
router.post('/society', authentication, async (req, res)=>{
    try{
        const {name, email, password, Location, contactNumber} = req.body;
        const society = new society({ name, email, password, Location, contactNumber });

        const societyData = await society.save();
        res.json(societyData);
    }
    catch(err){
        res.json({message: err});
    }
});

//update society
router.put('/society/:id', authentication, async (req, res)=>{
    try{
        const societyId = req.params.id;
        const {name, email, password, Location, contactNumber} = req.body;

        const societyData = await society.findByIdAndUpdate(societyId, { name, email, password, Location, contactNumber });
        res.json(societyData);
        }
        catch(err){
            res.json({message: err});
        }
});

//delete society
router.delete('/society/:id', authentication, async (req, res)=>{
    try{
        const societyId = req.params.id;

        const societyData = await society.findByIdAndDelete(societyId);
        res.json(societyData);
    }
    catch(err){
        res.json({message: err});
    }
});

module.exports = router;