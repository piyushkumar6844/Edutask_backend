const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Homework = require('../models/Homework');
const { body, validationResult } = require('express-validator');
const userfetching = require('../middleware/userfetching');

// To get all homework assignments (students)
router.get('/fetchallhomework', userfetching(), async (req, res) => {
  try {
    const homework = await Homework.find();
    res.json(homework);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// To add homework (teacher)
router.post('/addhomework', userfetching('teacher'), [
  body('title', 'Enter a valid title').isLength({ min: 3 }),
  body('description', 'Description must be at least 5 characters').isLength({ min: 5 }),
  body('dueDate', 'Enter a valid due date').isISO8601()
], async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const homework = new Homework({
      title,
      description,
      dueDate
    });
    const savedHomework = await homework.save();
    res.json(savedHomework);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// To submit homework (student)
router.post('/submit/:id', userfetching('student'), [
  body('content', 'Content must be at least 5 characters').isLength({ min: 5 })
], async (req, res) => {
  try {
    const { content } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).send("Homework Not Found");
    }

    const submission = {
      student: req.user.id,
      content
    };

    homework.submissions.push(submission);
    await homework.save();
    res.json(homework);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// To update homework (teacher)
router.put('/updatehomework/:id', userfetching('teacher'), async (req, res) => {
  const { title, description, dueDate } = req.body;
  try {
    const newHomework = {};
    if (title) { newHomework.title = title; }
    if (description) { newHomework.description = description; }
    if (dueDate) { newHomework.dueDate = dueDate; }

    let homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).send("Homework Not Found");
    }

    homework = await Homework.findByIdAndUpdate(req.params.id, { $set: newHomework }, { new: true });
    res.json(homework);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// To delete homework (teacher)
router.delete('/deletehomework/:id', userfetching('teacher'), async (req, res) => {
  try {
    let homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).send("Homework Not Found");
    }

    await Homework.findByIdAndDelete(req.params.id);
    res.json({ "Success": "Homework has been deleted", homework });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

///to get all submissions
// server-side route for fetching submissions
router.get('/submissions/:id', userfetching(), async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id).populate({
      path: 'submissions',
      populate: { path: 'student', select: 'name email' }
    });

    if (!homework) {
      return res.status(404).send("Homework Not Found");
    }

    res.json(homework.submissions);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});









// To grade a submission (teacher)
router.post('/grade/:id', userfetching('teacher'), [
  body('submissionId', 'Submission ID is required').not().isEmpty(),
  body('marks', 'Marks should be a number').isNumeric()
], async (req, res) => {
  try {
    const { submissionId, marks } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).send("Homework Not Found");
    }

    const submission = homework.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).send("Submission Not Found");
    }

    submission.marks = marks;
    await homework.save();
    res.json(homework);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
