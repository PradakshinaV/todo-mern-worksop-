import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Add styles as needed

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState('all'); // Filter state

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

  // Toggle task completion
  const toggleComplete = async (id) => {
    const todo = todos.find((t) => t._id === id);
    const res = await axios.put(`http://localhost:5000/todos/${id}`, {
      ...todo,
      completed: !todo.completed,
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
          placeholder="Add new task..."
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
        <button onClick={addTodo}>Add</button>
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
          <div key={todo._id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo._id)}
            />
            <div className="text-section">
              <span>{todo.text}</span>
              {todo.dueDate && <small>📅 {todo.dueDate}</small>}
              {todo.reminder && <span className="reminder">🔔</span>}
            </div>
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
