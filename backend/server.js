const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB successfully'))
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  process.exit(1);
});
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Todo text is required'],
    trim: true,
    maxlength: [500, 'Todo text cannot exceed 500 characters']
  },
  completed: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['personal', 'work', 'health', 'education', 'shopping'],
    default: 'personal'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due Date is required'],
    default: null
  },
  // In your backend model/schema, add:
dueTime: {
  type: String, // Store as "HH:MM" format
  required: false
},
  reminder: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
todoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
const Todo = mongoose.model('Todo', todoSchema);
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
app.get('/todos', asyncHandler(async (req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json({ success: true, data: todos });
}));
app.post('/todos', asyncHandler(async (req, res) => {
  const { text, priority, category, dueDate, reminder } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Todo text is required' });
  }

  const todo = new Todo({ text: text.trim(), priority, category, dueDate, reminder });
  const savedTodo = await todo.save();

  res.status(201).json({ success: true, data: savedTodo });
}));
app.get('/todos/:id', asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).json({ success: false, message: 'Todo not found' });
  res.json({ success: true, data: todo });
}));
app.put('/todos/:id', asyncHandler(async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).json({ success: false, message: 'Todo not found' });

  const { text, completed, priority, category, dueDate, reminder } = req.body;
  if (text !== undefined) todo.text = text.trim();
  if (completed !== undefined) todo.completed = completed;
  if (priority !== undefined) todo.priority = priority;
  if (category !== undefined) todo.category = category;
  if (dueDate !== undefined) todo.dueDate = dueDate;
  if (reminder !== undefined) todo.reminder = reminder;

  const updated = await todo.save();
  res.json({ success: true, data: updated });
}));
app.delete('/todos/:id', asyncHandler(async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).json({ success: false, message: 'Todo not found' });
  res.json({ success: true, message: 'Todo deleted' });
}));
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};
app.use(errorHandler);
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
app.listen(PORT, 5001, () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
