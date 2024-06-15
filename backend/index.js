const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for development

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/study-dashboard', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);
const subjectRoutes = require('./routes/subjects'); 
app.use('/api/subjects', subjectRoutes); 


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});