import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('personal');
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/todos').then((res) => {
      setTodos(res.data);
    });
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const res = await axios.post('http://localhost:5000/todos', {
      text: newTodo,
      dueDate,
      reminder,
      completed: false,
      priority,
      category
    });

    setTodos([...todos, res.data]);
    resetForm();
  };

  const updateTodo = async () => {
    if (!newTodo.trim()) return;

    const res = await axios.put(`http://localhost:5000/todos/${editingTodo._id}`, {
      text: newTodo,
      dueDate,
      reminder,
      completed: editingTodo.completed,
      priority,
      category
    });

    setTodos(todos.map((t) => (t._id === editingTodo._id ? res.data : t)));
    setEditingTodo(null);
    resetForm();
  };

  const resetForm = () => {
    setNewTodo('');
    setDueDate('');
    setReminder(false);
    setPriority('medium');
    setCategory('personal');
  };

  const toggleComplete = async (id) => {
    const todo = todos.find((t) => t._id === id);
    const res = await axios.put(`http://localhost:5000/todos/${id}`, {
      ...todo,
      completed: !todo.completed
    });

    setTodos(todos.map((t) => (t._id === id ? res.data : t)));
  };

  const deleteTodo = async (id) => {
    await axios.delete(`http://localhost:5000/todos/${id}`);
    setTodos(todos.filter((t) => t._id !== id));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    if (filter === 'reminder') return todo.reminder;
    return true;
  }).filter((todo) =>
    todo.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <h1 style={{ textAlign: 'center' }}>📝 Welcome to To-Do List</h1>

      {/* Search Bar */}
      <div style={{ textAlign: 'right', margin: '10px 20px' }}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="health">Health</option>
          <option value="education">Education</option>
        </select>
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

      {/* Task Table */}
      <table border="1" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Completed</th>
            <th>Task</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Reminder</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTodos.map((todo) => (
            <tr key={todo._id} className={todo.completed ? 'done' : ''}>
              <td>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo._id)}
                />
              </td>
              <td>{todo.text}</td>
              <td>{todo.priority}</td>
              <td>{todo.dueDate}</td>
              <td>{todo.reminder ? '🔔' : ''}</td>
              <td>
                <button onClick={() => {
                  setEditingTodo(todo);
                  setNewTodo(todo.text);
                  setDueDate(todo.dueDate);
                  setReminder(todo.reminder);
                  setPriority(todo.priority);
                  setCategory(todo.category);
                }}>✏️ Edit</button>
                <button onClick={() => deleteTodo(todo._id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dark Mode Toggle */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </div>
  );
}

export default App;
