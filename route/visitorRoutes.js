const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const visitor = require('../model/visitor.js'); 
const authentication = require('../middleware/authentication.js');

// Initialize the router
const router = express.Router();

// __dirname and __filename in ES Modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Folder where images will be saved
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);  // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Filename with timestamp
  }
});

// Initialize Multer for file uploads
const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 },  // 2MB file size limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).fields([
  { name: 'idImage', maxCount: 1 },
  { name: 'personimage', maxCount: 1 },
  { name: 'vehicleImage', maxCount: 1 }
]);

// Check file type (only images and pdfs)
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: .jpeg, .jpg, .png format only!');
  }
}

// Route to get all visitors data
router.get('/', authentication, (req, res) => {
  visitor.find()
    .then(visitors => res.json(visitors))
    .catch(err => res.json({ message: err }));
});

// Route to get visitor by ID
router.get('/:id', authentication, (req, res) => {
  const visitorId = req.params.id;
  visitor.findById(visitorId)
    .then(visitorData => res.json(visitorData))
    .catch(err => res.json({ message: err }));
});

// Route to add a new visitor
router.post('/', authentication, upload, (req, res) => {
  const { name, idNumber, vehicleNumber } = req.body;
  const idImage = req.files['idImage'] ? req.files['idImage'][0].path : null;
  const personImage = req.files['personimage'] ? req.files['personimage'][0].path : null;
  const vehicleImage = req.files['vehicleImage'] ? req.files['vehicleImage'][0].path : null;

  const newVisitor = new visitor({
    name,
    idNumber,
    vehicleNumber,
    idImage,
    personimage: personImage,
    vehicleImage
  });

  newVisitor.save()
    .then(() => res.json({ message: 'Visitor added successfully' }))
    .catch(err => res.json({ message: err }));
});

// Route to update visitor data
router.put('/:id', authentication, upload, (req, res) => {
  const visitorId = req.params.id;
  const { name, idNumber, vehicleNumber } = req.body;
  const idImage = req.files['idImage'] ? req.files['idImage'][0].path : null;
  const personImage = req.files['personimage'] ? req.files['personimage'][0].path : null;
  const vehicleImage = req.files['vehicleImage'] ? req.files['vehicleImage'][0].path : null;

  const updatedData = {
    name,
    idNumber,
    vehicleNumber,
    idImage,
    personimage: personImage,
    vehicleImage
  };

  visitor.findByIdAndUpdate(visitorId, updatedData)
    .then(() => res.json({ message: 'Visitor updated successfully' }))
    .catch(err => res.json({ message: err }));
});

// Route to delete a visitor
router.delete('/:id', authentication, (req, res) => {
  const visitorId = req.params.id;

  visitor.findByIdAndDelete(visitorId)
    .then(() => res.json({ message: 'Visitor deleted successfully' }))
    .catch(err => res.json({ message: err }));
});

module.exports = router;