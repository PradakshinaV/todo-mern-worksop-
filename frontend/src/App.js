import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Add styles as needed

function App() {
  const [todos, setTodos] = useState([]); // All todos (both completed and pending)
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState('all'); // Filter state
  const [editingTodo, setEditingTodo] = useState(null); // State for the todo being edited

  // Fetch todos from the backend
  useEffect(() => {
    axios.get('http://localhost:5000/todos').then((res) => {
      setTodos(res.data);
    });
  }, []);

  // Add new todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const res = await axios.post('http://localhost:5000/todos', {
      text: newTodo,
      dueDate,
      reminder,
      completed: false,
    });

    setTodos([...todos, res.data]);
    setNewTodo('');
    setDueDate('');
    setReminder(false);
  };

  // Update existing todo
  const updateTodo = async () => {
    if (!newTodo.trim()) return;

    const res = await axios.put(`http://localhost:5000/todos/${editingTodo._id}`, {
      text: newTodo,
      dueDate,
      reminder,
      completed: editingTodo.completed,
    });

    setTodos(todos.map((t) => (t._id === editingTodo._id ? res.data : t)));
    setEditingTodo(null); // Clear the editing state
    setNewTodo('');
    setDueDate('');
    setReminder(false);
  };

  // Toggle task completion (Completed / Pending)
  const toggleComplete = async (id) => {
    const todo = todos.find((t) => t._id === id);
    const res = await axios.put(`http://localhost:5000/todos/${id}`, {
      ...todo,
      completed: !todo.completed, // Toggle the completed status
    });

    setTodos(todos.map((t) => (t._id === id ? res.data : t)));
  };

  // Delete todo
  const deleteTodo = async (id) => {
    await axios.delete(`http://localhost:5000/todos/${id}`);
    setTodos(todos.filter((t) => t._id !== id));
  };

  // Filter todos based on selected filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    if (filter === 'reminder') return todo.reminder;
    return true; // default 'all'
  });

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <h2>📝 To-Do List</h2>

      {/* Input Section */}
      <div className="input-section">
        <input
          type="text"
          placeholder={editingTodo ? 'Edit task...' : 'Add new task...'}
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={reminder}
            onChange={() => setReminder(!reminder)}
          />
          🔔 Reminder
        </label>
        <button onClick={editingTodo ? updateTodo : addTodo}>
          {editingTodo ? 'Update' : 'Add'}
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
        <button onClick={() => setFilter('pending')}>Pending</button>
        <button onClick={() => setFilter('reminder')}>🔔 Reminders</button>
      </div>

      {/* Todo List */}
      <div className="todo-list">
        {filteredTodos.map((todo) => (
          <div
            key={todo._id}
            className={`todo-item ${todo.completed ? 'done' : ''}`}
            style={todo.completed ? { textDecoration: 'line-through' } : {}}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo._id)} // Toggle completion
            />
            <div className="text-section">
              <span>{todo.text}</span>
              {todo.dueDate && <small>📅 {todo.dueDate}</small>}
              {todo.reminder && <span className="reminder">🔔</span>}
            </div>
            <button onClick={() => {
              setEditingTodo(todo);
              setNewTodo(todo.text);
              setDueDate(todo.dueDate);
              setReminder(todo.reminder);
            }}>✏️ Edit</button>
            <button onClick={() => deleteTodo(todo._id)}>🗑️</button>
          </div>
        ))}
      </div>

      {/* Dark Mode Toggle */}
      <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>
    </div>
  );
}

export default App;
