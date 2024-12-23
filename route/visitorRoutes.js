const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const visitor = require('../model/visitor.js'); 
const authentication = require('../middleware/authentication.js');

// Initialize the router
const router = express.Router();

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure the uploads directory exists
    fs.mkdir(uploadDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating upload directory:', err);
        return cb(err, uploadDir);
      }
      cb(null, uploadDir);
    });
  },
  filename: function (req, file, cb) {
    // Customize the filename as needed
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Initialize Multer with storage and file limits
const upload = multer({
  storage: storage,
  limits: { 
    files: 3, // Total number of files
    fileSize: 5 * 1024 * 1024 // Max file size: 5MB per file
  },
  fileFilter: function (req, file, cb) {
    // Optional: Restrict file types (e.g., images only)
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type. Only JPEG and PNG are allowed.'));
  }
});

// Helper function to delete files
const deleteFiles = (fileUrls) => {
  fileUrls.forEach(url => {
    // Extract the filename from the URL
    const filename = path.basename(url);
    const filePath = path.join(__dirname, '..', 'uploads', filename); // Adjust the path as needed

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Failed to delete file ${filePath}:`, err);
      } else {
        console.log(`Deleted file ${filePath}`);
      }
    });
  });
};


// Route to add a new visitor
router.post('/new', authentication, (req, res) => {
  // Define the expected fields and their maximum file counts
  const uploadFields = upload.fields([
    { name: 'idImage', maxCount: 1 },
    { name: 'personImage', maxCount: 1 },
    { name: 'vehicleImage', maxCount: 1 }
  ]);

  // Invoke the upload middleware
  uploadFields(req, res, async function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        let message = 'File upload error.';
        if (err.code === 'LIMIT_FILE_COUNT') {
          message = 'Too many files uploaded.';
        } else if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'File size exceeds the allowed limit.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          message = 'Unexpected file upload.';
        }
        console.error('Multer error:', err);
        return res.status(400).json({ message });
      } else {
        console.error('Unexpected error during file upload:', err);
        return res.status(500).json({ message: 'An unexpected error occurred during file upload.' });
      }
    }

    try {
      const { name, idNumber, vehicleNumber, comments } = req.body;
      const idImage = req.files['idImage']
  ? `${req.protocol}://${req.get('host')}/uploads/${req.files['idImage'][0].filename}`
  : null;

const personImage = req.files['personImage']
  ? `${req.protocol}://${req.get('host')}/uploads/${req.files['personImage'][0].filename}`
  : null;

const vehicleImage = req.files['vehicleImage']
  ? `${req.protocol}://${req.get('host')}/uploads/${req.files['vehicleImage'][0].filename}`
  : null;


      // Collect missing fields
      let missingFields = [];

      if (!name) missingFields.push('name');
      if (!idNumber) missingFields.push('idNumber');
      if (!vehicleNumber) missingFields.push('vehicleNumber');
      if (!idImage) missingFields.push('idImage');
      if (!personImage) missingFields.push('personImage');
      if (!vehicleImage) missingFields.push('vehicleImage');

      if (missingFields.length > 0) {
        // Delete any uploaded files
        deleteFiles([idImage, personImage, vehicleImage]);

        return res.status(400).json({
          message: `Missing required field(s): ${missingFields.join(', ')}`
        });
      }

      const newVisitor = new visitor({
        guardID: req.user.id,
        societyID: req.user.societyID,
        name,
        idNumber,
        vehicleNumber,
        comments,
        idImage,
        personImage,
        vehicleImage
      });

      await newVisitor.save();
      res.status(201).json({ message: 'Visitor added successfully' });
    } catch (err) {
      // Optionally, delete files in case of any other errors
      const idImage = req.files['idImage'] ? req.files['idImage'][0].path : null;
      const personImage = req.files['personImage'] ? req.files['personImage'][0].path : null;
      const vehicleImage = req.files['vehicleImage'] ? req.files['vehicleImage'][0].path : null;
      deleteFiles([idImage, personImage, vehicleImage]);

      console.error('Error while adding visitor:', err);
      res.status(500).json({ message: 'An error occurred while adding the visitor.', error: err.message });
    }
  });
});


// PUT Route to update an existing visitor
router.put('/:id', authentication, (req, res) => {
  // Define the expected fields and their maximum file counts
  const uploadFields = upload.fields([
    { name: 'idImage', maxCount: 1 },
    { name: 'personImage', maxCount: 1 },
    { name: 'vehicleImage', maxCount: 1 }
  ]);

  // Invoke the upload middleware
  uploadFields(req, res, async function (err) {
    if (err) {
      // Handle Multer-specific errors
      if (err instanceof multer.MulterError) {
        let message = 'File upload error.';
        if (err.code === 'LIMIT_FILE_COUNT') {
          message = 'Too many files uploaded.';
        } else if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'File size exceeds the allowed limit.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          message = err.message || 'Unexpected file upload.';
        }
        return res.status(400).json({ message });
      } else {
        // Handle other errors
        console.error('Unexpected error during file upload:', err);
        return res.status(500).json({ message: 'An unexpected error occurred during file upload.' });
      }
    }

    try {
      const visitorId = req.params.id;
      const { name, idNumber, vehicleNumber, comments } = req.body;

      // Find the existing visitor
      const existingVisitor = await visitor.findById(visitorId);
      if (!existingVisitor) {
        // Delete any uploaded files since visitor does not exist
        const uploadedFiles = [
          req.files['idImage'] ? req.files['idImage'][0].path : null,
          req.files['personImage'] ? req.files['personImage'][0].path : null,
          req.files['vehicleImage'] ? req.files['vehicleImage'][0].path : null
        ];
        deleteFiles(uploadedFiles);

        return res.status(404).json({ message: 'Visitor not found.' });
      }

      // Extract new file paths if provided
      const newIdImage = req.files['idImage'] ? req.files['idImage'][0].path : existingVisitor.idImage;
      const newPersonImage = req.files['personImage'] ? req.files['personImage'][0].path : existingVisitor.personImage;
      const newVehicleImage = req.files['vehicleImage'] ? req.files['vehicleImage'][0].path : existingVisitor.vehicleImage;

      // Collect missing fields
      let missingFields = [];

      if (!name) missingFields.push('name');
      if (!idNumber) missingFields.push('idNumber');
      if (!vehicleNumber) missingFields.push('vehicleNumber');
      if (!newIdImage) missingFields.push('idImage');
      if (!newPersonImage) missingFields.push('personImage');
      if (!newVehicleImage) missingFields.push('vehicleImage');

      if (missingFields.length > 0) {
        // Delete any newly uploaded files since validation failed
        const uploadedFiles = [
          req.files['idImage'] ? req.files['idImage'][0].path : null,
          req.files['personImage'] ? req.files['personImage'][0].path : null,
          req.files['vehicleImage'] ? req.files['vehicleImage'][0].path : null
        ];
        deleteFiles(uploadedFiles);

        return res.status(400).json({
          message: `Missing required field(s): ${missingFields.join(', ')}`
        });
      }

      // If new images are uploaded, delete the old ones
      const filesToDelete = [];
      if (req.files['idImage'] && existingVisitor.idImage) {
        filesToDelete.push(existingVisitor.idImage);
      }
      if (req.files['personImage'] && existingVisitor.personImage) {
        filesToDelete.push(existingVisitor.personImage);
      }
      if (req.files['vehicleImage'] && existingVisitor.vehicleImage) {
        filesToDelete.push(existingVisitor.vehicleImage);
      }

      if (filesToDelete.length > 0) {
        deleteFiles(filesToDelete);
      }

      // Update the visitor's data
      existingVisitor.name = name;
      existingVisitor.idNumber = idNumber;
      existingVisitor.vehicleNumber = vehicleNumber;
      existingVisitor.idImage = newIdImage;
      existingVisitor.personImage = newPersonImage;
      existingVisitor.vehicleImage = newVehicleImage;
      existingVisitor.comments = comments;

      await existingVisitor.save();

      res.status(200).json({ message: 'Visitor updated successfully.' });

    } catch (err) {
      // Delete any newly uploaded files in case of errors
      const uploadedFiles = [
        req.files['idImage'] ? req.files['idImage'][0].path : null,
        req.files['personImage'] ? req.files['personImage'][0].path : null,
        req.files['vehicleImage'] ? req.files['vehicleImage'][0].path : null
      ];
      deleteFiles(uploadedFiles);

      console.error('Error while updating visitor:', err);
      res.status(500).json({ message: 'An error occurred while updating the visitor.', error: err.message });
    }
  });
});



// Route to get all visitors data
router.get('/all', authentication, async (req, res) => {
  try {
    const visitors = await visitor.find();
    res.json(visitors);
  } catch (err) {
    res.json({ message: err });
  }
});

// Route to get visitor by ID
router.get('/:id', authentication, async (req, res) => {
  const visitorId = req.params.id;
  try {
    const visitorData = await visitor.findById(visitorId);
    res.json(visitorData);
  } catch (err) {
    res.json({ message: err });
  }
});

// Delete visitor by ID
router.delete('/del/:id', authentication, async (req, res) => {
  const visitorId = req.params.id;
  try {
    const deletedVisitor = await visitor.findByIdAndDelete(visitorId);
    if (deletedVisitor) {
      // Collect image URLs
      const filesToDelete = [];
      if (deletedVisitor.idImage) {
        filesToDelete.push(deletedVisitor.idImage);
      }
      if (deletedVisitor.personImage) {
        filesToDelete.push(deletedVisitor.personImage);
      }
      if (deletedVisitor.vehicleImage) {
        filesToDelete.push(deletedVisitor.vehicleImage);
      }

      if (filesToDelete.length > 0) {
        // Delete all related files
        deleteFiles(filesToDelete);
      }

      res.json({ message: 'Visitor deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Visitor not found.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'An error occurred while deleting the visitor.', error: err.message });
  }
});

module.exports = router;
