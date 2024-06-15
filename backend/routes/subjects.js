const express = require('express');
const router = express.Router();
const { Subject } = require('../models/task'); // Import Subject model

// GET all subjects 
router.get('/', async (req, res) => { 
    try {
        const subjects = await Subject.find().populate('tasks'); // Populate tasks
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create a new subject 
router.post('/', async (req, res) => { 
    const subject = new Subject(req.body); 
    try {
        const newSubject = await subject.save(); 
        res.status(201).json(newSubject); 
    } catch (err) {
        res.status(400).json({ message: err.message }); 
    }
});

// POST add a new task to a specific subject
router.post('/:subjectId/tasks', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject.tasks.push(req.body); // Add the new task
    const updatedSubject = await subject.save();

    res.status(201).json(updatedSubject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ... other routes for updating, deleting subjects (implement if needed)

module.exports = router;