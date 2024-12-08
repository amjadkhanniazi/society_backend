const express = require('express');
const authentication = require('../middleware/authentication.js');
const guard = require('../model/guard.js');

const router = express.Router();

//get all guards data
router.get('/all', authentication, async (req, res)=>{
    try{
        const guards = await guard.find().select('-password -createdAt -updatedAt');
        res.json(guards);

    }
    catch(err){
        res.json({message: err});
    }
});

//get guard by id
router.get('/get/:id', authentication, async (req, res)=>{
    try{
        const guardid = req.params.id;

        const guardData = await guard.findById(guardid).select('-password -createdAt -updatedAt');
        res.json(guardData);
    }catch(err){
        res.json({message: err});
    }
});

//register a guard
router.post('/new/register', authentication, async (req, res)=>{
    try{
        const { username, password, fullName, assignedGate, contactNumber } = req.body;
        const Guard = new guard({ societyID: req.user.id,
            username, password, fullName, assignedGate, contactNumber });
        await Guard.save();
        res.json({message: "Guard added successfully"});
    }catch(err){
        res.json({message: err});
    }
});

//login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const Guard = await guard.findOne({ username });
        if (!Guard) {
            return res.status(404).json({ message: "Guard not found" });
        }
        const isMatch = await Guard.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = Guard.generateToken();
        res.json({ token });
    } catch (err) {
        res.json({ message: err });
        }
});

//update guard
router.put('/update/:id', authentication, async (req, res)=>{
    try{
        const guardid = req.params.id;
        const { fullName, assignedGate, contactNumber } = req.body;

        const guardData = await guard.findByIdAndUpdate(guardid, { fullName, assignedGate, contactNumber });
        res.json({message: "Guard updated successfully"});
    }catch(err){
        res.json({message: err});
    }
});

//delete guard
router.delete('/del/:id', authentication, async (req, res)=>{
    try{
        const guardid = req.params.id;

        const guardData = await guard.findByIdAndDelete(guardid);
        res.json({message: "Guard deleted successfully"});
    }catch(err){
        res.json({message: err});
    }
});

//guard change password
router.put('/:id/change-password', authentication, async (req, res)=>{
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