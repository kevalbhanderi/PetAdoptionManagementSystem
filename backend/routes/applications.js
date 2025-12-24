const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Pet = require('../models/Pet');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/applications
// @desc    Get all applications (filtered by user role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    
    // If user is not admin, only show their own applications
    if (req.user.role !== 'admin') {
      filter.applicant = req.user._id;
    }

    const applications = await Application.find(filter)
      .populate('pet', 'name species breed image status')
      .populate('applicant', 'name email phone')
      .populate('reviewedBy', 'name email')
      .sort({ applicationDate: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('pet')
      .populate('applicant', 'name email phone address')
      .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user has permission to view this application
    if (req.user.role !== 'admin' && application.applicant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/applications
// @desc    Create a new adoption application
// @access  Private
router.post('/', [
  auth,
  body('pet').notEmpty().withMessage('Pet ID is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('livingSituation').trim().notEmpty().withMessage('Living situation is required'),
  body('experience').trim().notEmpty().withMessage('Experience is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pet, message, livingSituation, experience } = req.body;

    // Check if pet exists and is available
    const petDoc = await Pet.findById(pet);
    if (!petDoc) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    if (petDoc.status !== 'Available') {
      return res.status(400).json({ message: 'Pet is not available for adoption' });
    }

    // Check if user already applied for this pet
    const existingApplication = await Application.findOne({
      pet,
      applicant: req.user._id,
      status: { $in: ['Pending', 'Approved'] }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this pet' });
    }

    const application = new Application({
      pet,
      applicant: req.user._id,
      message,
      livingSituation,
      experience
    });

    await application.save();

    // Update pet status to Pending
    petDoc.status = 'Pending';
    await petDoc.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('pet', 'name species breed image')
      .populate('applicant', 'name email');

    res.status(201).json(populatedApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (Admin only)
// @access  Private (Admin only)
router.put('/:id/status', [
  auth,
  adminAuth,
  body('status').isIn(['Pending', 'Approved', 'Rejected', 'Withdrawn']).withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { status, reviewNotes } = req.body;

    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    if (reviewNotes) {
      application.reviewNotes = reviewNotes;
    }

    await application.save();

    // Update pet status based on application status
    const pet = await Pet.findById(application.pet);
    if (status === 'Approved') {
      pet.status = 'Adopted';
      pet.adoptedAt = new Date();
    } else if (status === 'Rejected' || status === 'Withdrawn') {
      // Check if there are other pending applications
      const pendingApps = await Application.countDocuments({
        pet: application.pet,
        status: 'Pending',
        _id: { $ne: application._id }
      });
      
      if (pendingApps === 0) {
        pet.status = 'Available';
      }
    }

    await pet.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('pet', 'name species breed image')
      .populate('applicant', 'name email phone')
      .populate('reviewedBy', 'name email');

    res.json(populatedApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Withdraw/Delete an application
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user has permission
    if (req.user.role !== 'admin' && application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If application is pending, update pet status back to Available
    if (application.status === 'Pending') {
      const pet = await Pet.findById(application.pet);
      const pendingApps = await Application.countDocuments({
        pet: application.pet,
        status: 'Pending',
        _id: { $ne: application._id }
      });

      if (pendingApps === 0) {
        pet.status = 'Available';
        await pet.save();
      }
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

