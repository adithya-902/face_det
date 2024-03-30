require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connection = require('./db');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Database connection
connection();

// Middleware
app.use(express.json());
app.use(cors());

// Define user schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    faceVector: {
        type: [Number],
        required: true,
        validate: {
            validator: function(arr) {
                return arr.length === 128;
            },
            message: 'Descriptor array must contain 128 elements'
        }
    }
});

const userAuth = mongoose.model('User', userSchema);

// Function to calculate Euclidean distance between two vectors
const euclideanDistance = (vector1, vector2) => {
    if (!vector1 || !vector2 || !Array.isArray(vector1) || !Array.isArray(vector2) || vector1.length !== vector2.length) {
        throw new Error('Invalid input vectors');
    }

    let sum = 0;
    for (let i = 0; i < vector1.length; i++) {
        sum += Math.pow(vector1[i] - vector2[i], 2);
    }
    return Math.sqrt(sum);
};

// Function to compare face vectors using Euclidean distance
const compareFaceVectors = (vector1, vector2, threshold) => {
    const distance = euclideanDistance(vector1, vector2);
    return distance <= threshold;
};

app.post('/', (req, res) => {
    userAuth.create(req.body)
    .then(User => res.json(User))
    .catch(err => res.json(err))
})

// Login route for authentication
// Login route for authentication
app.post('/loginface', async (req, res) => {
    const { email, faceVector } = req.body;
    try {
        // Find user by email
        const user = await userAuth.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Compare face vectors
        const threshold = 10; // Set your threshold value
        const isMatch = compareFaceVectors(faceVector, user.faceVector, threshold);

        if (isMatch) {
            // If face vectors match, return success
            return res.status(200).json({ success: true, message: 'Face vectors match' });
        } else {
            // If face vectors do not match, return failure
            return res.status(403).json({ success: false, message: 'Face vectors do not match' });
        }
    } catch (error) {
        console.log('Error during login:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Login route for authentication



const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on port: ${port}`));
