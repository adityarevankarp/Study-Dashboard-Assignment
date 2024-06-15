const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  timeSpent: { type: Number, default: 0 }, // New: Time spent on task
  isCompleted: { type: Boolean, default: false },
  subtasks: [{ type: String }],
});

// Subject Schema 
const SubjectSchema = new Schema({
  name: { type: String, required: true, unique: true }, // Unique subject names
  tasks: [TaskSchema], // Array to store tasks related to this subject
});

module.exports = {
  Task: mongoose.model('Task', TaskSchema), // Export Task model if needed 
  Subject: mongoose.model('Subject', SubjectSchema)
};