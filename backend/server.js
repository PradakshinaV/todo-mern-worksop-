import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editingTodo, setEditingTodo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('personal');
  const [sortBy, setSortBy] = useState('dueDate');

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

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === 'completed') return todo.completed;
      if (filter === 'pending') return !todo.completed;
      if (filter === 'reminder') return todo.reminder;
      return true;
    })
    .filter((todo) =>
      todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <div className="header">
        <h2>📝 Welcome to To-Do List</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Search by task, priority, category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Task Stats */}
      <div className="stats">
        <p>Total: {todos.length}</p>
        <p>Completed: {todos.filter((t) => t.completed).length}</p>
        <p>Pending: {todos.filter((t) => !t.completed).length}</p>
        <p>Reminders: {todos.filter((t) => t.reminder).length}</p>
        <p>Overdue: {todos.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length}</p>
      </div>

      {/* Input Form */}
      <div className="input-section">
        <input
          type="text"
          placeholder={editingTodo ? 'Edit task...' : 'Add new task...'}
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={reminder}
            onChange={() => setReminder(!reminder)}
          /> 🔔 Reminder
        </label>
        <button onClick={editingTodo ? updateTodo : addTodo}>
          {editingTodo ? 'Update' : 'Add'}
        </button>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
        <button onClick={() => setFilter('pending')}>Pending</button>
        <button onClick={() => setFilter('reminder')}>🔔 Reminders</button>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* Todo Table */}
      <table className="todo-table">
        <thead>
          <tr>
            <th>✔</th>
            <th>Task</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>🔔</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTodos.length === 0 ? (
            <tr><td colSpan="6">No tasks found.</td></tr>
          ) : (
            filteredTodos.map((todo) => (
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
                <td>{todo.dueDate || '—'}</td>
                <td>{todo.reminder ? '🔔' : ''}</td>
                <td>
                  <button onClick={() => {
                    setEditingTodo(todo);
                    setNewTodo(todo.text);
                    setDueDate(todo.dueDate);
                    setReminder(todo.reminder);
                    setPriority(todo.priority);
                    setCategory(todo.category);
                  }}>✏️</button>
                  <button onClick={() => deleteTodo(todo._id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
