const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      default: '',
    },
    board: {
      type: String,
      required: [true, 'Board is required'],
      enum: ['CBSE', 'ICSE', 'Maharashtra State Board', 'Other State Board'],
    },
    stream: {
      type: String,
      required: [true, 'Stream is required'],
      enum: ['Science', 'Commerce', 'Arts'],
    },
    subjects: {
      type: String,
      enum: ['PCM', 'PCB', 'PCMB', ''],
      default: '',
    },
    percentage: {
      type: Number,
      required: [true, 'Percentage is required'],
      min: [0, 'Percentage cannot be less than 0'],
      max: [100, 'Percentage cannot exceed 100'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'NT', 'VJ/DT'],
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
    },
    examType: {
      type: String,
      required: [true, 'Exam type is required'],
    },
    examScore: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
studentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Student', studentSchema);
