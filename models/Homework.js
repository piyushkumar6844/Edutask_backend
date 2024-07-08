const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        default: null
    }
});

const HomeworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3
    },
    description: {
        type: String,
        required: true,
        minlength: 5
    },
    dueDate: {
        type: Date,
        required: true
    },
    submissions: [SubmissionSchema]
});

module.exports = mongoose.model('Homework', HomeworkSchema);
