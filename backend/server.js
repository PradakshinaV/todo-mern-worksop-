const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/todolist');

const Todo = mongoose.model('Todo', {
  text: String
});

// Routes
app.get('/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post('/todos', async (req, res) => {
  const newTodo = new Todo({ text: req.body.text });
  await newTodo.save();
  res.json(newTodo);
});
app.put('/todos/:id', async (req, res) => {
    const { text } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { text },
      { new: true }
    );
    res.json(updatedTodo);
  });
  
app.delete('/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

app.listen(5000, () => console.log("Server running on port 5000"));
