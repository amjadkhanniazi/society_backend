const express = require('express');
const authentication = require('../middleware/authentication.js');
const society  = require('../model/society.js');
const bcrypt = require('bcryptjs');
const router = express.Router();

//get all societies data
router.get('/all', authentication, async (req, res)=>{
    try{
        const societies = await society.find().select('-password -createdAt -updatedAt');
        res.json(societies);
    }
    catch(err){
        res.json({message: err});
    }
});

//get society by id
router.get('/get/:id', authentication, async (req, res)=>{
    try{
        const societyId = req.params.id;

        const societyData = await society.findById(societyId).select('-password -createdAt -updatedAt');
        res.json(societyData);

    }
    catch(err){
        res.json({message: err});
    }
});

// POST route to add a new society
router.post('/new', async (req, res) => {
    try {
        const { name, email, password, Location, contactNumber } = req.body;

        // Create a new society instance
        const Society = new society({
            name,
            email,
            password,
            Location,
            contactNumber
        });

        // Save the society to the database
        await Society.save();
        res.json({ message: "Society added successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//login route
router.post('/login', async (req, res) => { 
    try {
        const { email, password } = req.body;
        const Society = await society.findOne({ email });
        if (!Society) {
            return res.status(404).json({ message: "Society not found" });
            }
            const isMatch = await bcrypt.compare(password, Society.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }
            // Generate a JWT token
            const token = Society.getSignedToken();
            res.json({ token });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
});

//update society
router.put('/update/:id', authentication, async (req, res)=>{
    try{
        const societyId = req.params.id;
        const {name, Location, contactNumber} = req.body;

        await society.findByIdAndUpdate(societyId, { name, email, password, Location, contactNumber });
        res.json({message: 'Society updated successfully'});
        }
        catch(err){
            res.json({message: err});
        }
});

//delete society
router.delete('/del/:id', authentication, async (req, res)=>{
    try{
        const societyId = req.params.id;

        await society.findByIdAndDelete(societyId);
        res.json({message: 'Society deleted successfully and you are no more loged in'});
    }
    catch(err){
        res.json({message: err});
    }
});

//update password
router.put('/updatepassword/:id', authentication, async (req, res)=>{
    try{
        const societyId = req.params.id;
        const {password} = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await society.findByIdAndUpdate(societyId, {password: hashedPassword});
        res.json({message: 'Password updated successfully'});
        }
        catch(err){
            res.json({message: err});
        }
});

module.exports = router;