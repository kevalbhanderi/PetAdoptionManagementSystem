const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Pet = require('../models/Pet');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/pets
// @desc    Get all pets with filters
// @access  Public
router.get('/', [
  query('species').optional().isIn(['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']),
  query('status').optional().isIn(['Available', 'Pending', 'Adopted']),
  query('size').optional().isIn(['Small', 'Medium', 'Large']),
  query('gender').optional().isIn(['Male', 'Female', 'Unknown']),
], async (req, res) => {
  try {
    const { species, status, size, gender, search, minAge, maxAge } = req.query;
    const filter = {};

    if (species) filter.species = species;
    if (status) filter.status = status;
    if (size) filter.size = size;
    if (gender) filter.gender = gender;
    if (minAge) filter.age = { ...filter.age, $gte: parseInt(minAge) };
    if (maxAge) filter.age = { ...filter.age, $lte: parseInt(maxAge) };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pets = await Pet.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pets/:id
// @desc    Get single pet by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/pets
// @desc    Create a new pet
// @access  Private (Admin only)
router.post('/', [
  auth,
  adminAuth,
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('species').isIn(['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']).withMessage('Invalid species'),
  body('age').isInt({ min: 0 }).withMessage('Age must be a positive number'),
  body('gender').isIn(['Male', 'Female', 'Unknown']).withMessage('Invalid gender'),
  body('size').isIn(['Small', 'Medium', 'Large']).withMessage('Invalid size'),
  body('description').trim().notEmpty().withMessage('Description is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const petData = {
      ...req.body,
      createdBy: req.user._id
    };

    const pet = new Pet(petData);
    await pet.save();

    const populatedPet = await Pet.findById(pet._id)
      .populate('createdBy', 'name email');

    res.status(201).json(populatedPet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/pets/:id
// @desc    Update a pet
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  adminAuth,
  body('species').optional().isIn(['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']),
  body('gender').optional().isIn(['Male', 'Female', 'Unknown']),
  body('size').optional().isIn(['Small', 'Medium', 'Large']),
  body('status').optional().isIn(['Available', 'Pending', 'Adopted']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    Object.assign(pet, req.body);
    if (req.body.status === 'Adopted' && !pet.adoptedAt) {
      pet.adoptedAt = new Date();
    }

    await pet.save();

    const populatedPet = await Pet.findById(pet._id)
      .populate('createdBy', 'name email');

    res.json(populatedPet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/pets/:id
// @desc    Delete a pet
// @access  Private (Admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

