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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/todos');
      // Handle the new API response format
      if (response.data.success) {
        setTodos(response.data.data);
      } else {
        setError('Failed to fetch todos');
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const response = await axios.post('http://localhost:5000/todos', {
        text: newTodo,
        dueDate,
        reminder,
        completed: false,
        priority,
        category
      });

      if (response.data.success) {
        setTodos([...todos, response.data.data]);
        resetForm();
        setError('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo');
    }
  };

  const updateTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const response = await axios.put(`http://localhost:5000/todos/${editingTodo._id}`, {
        text: newTodo,
        dueDate,
        reminder,
        completed: editingTodo.completed,
        priority,
        category
      });

      if (response.data.success) {
        setTodos(todos.map((t) => (t._id === editingTodo._id ? response.data.data : t)));
        setEditingTodo(null);
        resetForm();
        setError('');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo');
    }
  };

  const resetForm = () => {
    setNewTodo('');
    setDueDate('');
    setReminder(false);
    setPriority('medium');
    setCategory('personal');
  };

  const toggleComplete = async (id) => {
    try {
      const todo = todos.find((t) => t._id === id);
      const response = await axios.put(`http://localhost:5000/todos/${id}`, {
        ...todo,
        completed: !todo.completed
      });

      if (response.data.success) {
        setTodos(todos.map((t) => (t._id === id ? response.data.data : t)));
        setError('');
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/todos/${id}`);
      if (response.data.success) {
        setTodos(todos.filter((t) => t._id !== id));
        setError('');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo');
    }
  };

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === 'completed') return todo.completed;
      if (filter === 'pending') return !todo.completed;
      if (filter === 'reminder') return todo.reminder && !todo.completed;
      return true;
    })
    .filter((todo) =>
      todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  if (loading) {
    return <div className="app"><div className="loading">Loading todos...</div></div>;
  }

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

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

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
          onKeyPress={(e) => e.key === 'Enter' && (editingTodo ? updateTodo() : addTodo())}
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
          <option value="health">Health</option>
          <option value="education">Education</option>
          <option value="shopping">Shopping</option>
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
        {editingTodo && (
          <button onClick={() => {
            setEditingTodo(null);
            resetForm();
          }}>
            Cancel
          </button>
        )}
      </div>

    <div className="filter-section toolbar">
  <div className="left-controls">
    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
      <option value="dueDate">Sort by Due Date</option>
      <option value="priority">Sort by Priority</option>
      <option value="createdAt">Sort by Created Date</option>
    </select>
  </div>

  <div className="right-controls">
    <label className="dropdown-label">Show:</label>
    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-dropdown">
      <option value="all">All</option>
      <option value="completed">Completed</option>
      <option value="pending">Pending</option>
      <option value="reminder">🔔 Reminders</option>
    </select>

    <button onClick={() => setDarkMode(!darkMode)}>
      {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  </div>
</div>

          

      {/* Todo Table */}
      <table className="todo-table">
        <thead>
          <tr>
            <th>✔</th>
            <th>Task</th>
            <th>Priority</th>
            <th>Category</th>
            <th>Due Date</th>
            <th>🔔</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTodos.length === 0 ? (
            <tr><td colSpan="7">No tasks found.</td></tr>
          ) : (
            filteredTodos.map((todo) => {
              const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
              return (
                <tr key={todo._id} className={`${todo.completed ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo._id)}
                    />
                  </td>
                  <td>{todo.text}</td>
                  <td>
                    <span className={`priority-${todo.priority}`}>
                      {todo.priority}
                    </span>
                  </td>
                  <td>{todo.category}</td>
                  <td>
                    {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '—'}
                    {isOverdue && <span className="overdue-indicator"> ⚠️</span>}
                  </td>
                  <td>{todo.reminder ? '🔔' : ''}</td>
                  <td>
  <button
    className="icon-button"
    onClick={() => {
      setEditingTodo(todo);
      setNewTodo(todo.text);
      setDueDate(todo.dueDate || '');
      setReminder(todo.reminder);
      setPriority(todo.priority);
      setCategory(todo.category);
    }}
    title="Edit"
  >
    ✏️
  </button>

  <button
    className="icon-button"
    onClick={() => deleteTodo(todo._id)}
    title="Delete"
  >
    🗑️
  </button>
</td>

                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;