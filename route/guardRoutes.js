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
        const guardid = req.params.id;

        const guardData = await guard.findById(guardid);
        res.json(guardData);
    }catch(err){
        res.json({message: err});
    }
});

//add guard
router.post('/guards/register', authentication, async (req, res)=>{
    try{
        const { username, password, fullName, assignedGate } = req.body;
        const guard = new guard({ username, password, fullName, assignedGate });
        const guardData = await guard.save();
        res.json({message: "Guard added successfully"});
    }catch(err){
        res.json({message: err});
    }
});

//update guard
router.put('/guards/:id', authentication, async (req, res)=>{
    try{
        const guardid = req.params.id;
        const { fullName, assignedGate } = req.body;

        const guardData = await guard.findByIdAndUpdate(guardid, { fullName, assignedGate });
        res.json({message: "Guard updated successfully"});
    }catch(err){
        res.json({message: err});
    }
});

//delete guard
router.delete('/guards/:id', authentication, async (req, res)=>{
    try{
        const guardid = req.params.id;

        const guardData = await guard.findByIdAndDelete(guardid);
        res.json({message: "Guard deleted successfully"});
    }catch(err){
        res.json({message: err});
    }
});

//guard change password
router.put('/guards/:id/change-password', authentication, async (req, res)=>{
    try{
        const guardid = req.params.id;
        const { password } = req.body;

        const guardData = await guard.findByIdAndUpdate(guardid, { password });
        res.json({message: "Password changed successfully"});
    }catch(err){
        res.json({message: err});
        }
});

module.exports = router;