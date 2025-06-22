import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
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
  const [notification, setNotification] = useState('');

  // API Base URL
  const API_URL = 'http://localhost:5000/api';

  // Load todos from backend on component mount
  useEffect(() => {
    fetchTodos();
    
    // Load dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/todos`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else {
        setError('Failed to fetch todos');
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Show notification function
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000); // Hide after 3 seconds
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const todo = {
      text: newTodo,
      dueDate,
      dueTime,
      reminder,
      completed: false,
      priority,
      category
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos([...todos, newTodo]);
        showNotification('✅ Task added successfully!');
        resetForm();
      } else {
        setError('Failed to add todo');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async () => {
    if (!newTodo.trim()) return;

    const updatedTodo = {
      ...editingTodo,
      text: newTodo,
      dueDate,
      dueTime,
      reminder,
      priority,
      category
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/todos/${editingTodo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTodo),
      });

      if (response.ok) {
        const updated = await response.json();
        setTodos(todos.map((t) => (t._id === editingTodo._id ? updated : t)));
        setEditingTodo(null);
        showNotification('📝 Task updated successfully!');
        resetForm();
      } else {
        setError('Failed to update todo');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewTodo('');
    setDueDate('');
    setDueTime('');
    setReminder(false);
    setPriority('medium');
    setCategory('personal');
  };

  const toggleComplete = async (id) => {
    const todo = todos.find(t => t._id === id);
    
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });

      if (response.ok) {
        const updated = await response.json();
        setTodos(todos.map((t) => (t._id === id ? updated : t)));
        
        if (!todo.completed) {
          showNotification('🎉 Task completed!');
        } else {
          showNotification('↩️ Task marked as pending');
        }
      } else {
        setError('Failed to update todo');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Error connecting to server');
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(todos.filter((t) => t._id !== id));
        showNotification('🗑️ Task deleted successfully!');
      } else {
        setError('Failed to delete todo');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Error connecting to server');
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
        
        const dateTimeA = new Date(a.dueDate + (a.dueTime ? `T${a.dueTime}` : 'T23:59'));
        const dateTimeB = new Date(b.dueDate + (b.dueTime ? `T${b.dueTime}` : 'T23:59'));
        return dateTimeA - dateTimeB;
      }
      if (sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      {/* Notification Popup */}
      {notification && (
        <div className="notification">
          {notification}
          <button 
            className="notification-close" 
            onClick={() => setNotification('')}
          >
            ×
          </button>
        </div>
      )}

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
      
      <div className="stats">
        <p>📊 Total: {todos.length}</p>
        <p>✅ Completed: {todos.filter((t) => t.completed).length}</p>
        <p>⏳ Pending: {todos.filter((t) => !t.completed).length}</p>
        <p>🔔 Reminders: {todos.filter((t) => t.reminder).length}</p>
        <p>⚠️ Overdue: {todos.filter((t) => {
          if (!t.dueDate || t.completed) return false;
          const dueDateTimeString = t.dueDate + (t.dueTime ? `T${t.dueTime}` : 'T23:59');
          return new Date(dueDateTimeString) < new Date();
        }).length}</p>
      </div>

      <div className="input-section">
        <input
          type="text"
          placeholder={editingTodo ? 'Edit task...' : 'Add new task...'}
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (editingTodo ? updateTodo() : addTodo())}
        />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <input 
          type="time" 
          value={dueTime} 
          onChange={(e) => setDueTime(e.target.value)}
          title="Due time (optional)"
          className="time-input"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="health">Health</option>
          <option value="education">Education</option>
          <option value="shopping">Shopping</option>
        </select>
        <label style={{whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'auto', flex: 'none'}}>
          <input
            type="checkbox"
            checked={reminder}
            onChange={() => setReminder(!reminder)}
            style={{transform: 'scale(1.2)'}}
          /> 🔔 Reminder
        </label>
        <button onClick={editingTodo ? updateTodo : addTodo}>
          {editingTodo ? '📝 Update Task' : '➕ Add Task'}
        </button>
        {editingTodo && (
          <button onClick={() => {
            setEditingTodo(null);
            resetForm();
          }}>
            ❌ Cancel
          </button>
        )}
      </div>

      <div className="filter-section toolbar">
        <div className="left-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dueDate">📅 Sort by Due Date</option>
            <option value="priority">⚡ Sort by Priority</option>
            <option value="createdAt">🕒 Sort by Created Date</option>
          </select>
        </div>

        <div className="right-controls">
          <label className="dropdown-label">Show:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-dropdown">
            <option value="all">📋 All</option>
            <option value="completed">✅ Completed</option>
            <option value="pending">⏳ Pending</option>
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
            <th>✓ STATUS</th>
            <th>📝 TASK DETAILS</th>
            <th>⚡ PRIORITY</th>
            <th>📂 CATEGORY</th>
            <th>📅 DUE DATE & TIME</th>
            <th>🔔 REMINDER</th>
            <th>⚙️ ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredTodos.length === 0 ? (
            <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#666'}}>🔍 No tasks found matching your criteria</td></tr>
          ) : (
            filteredTodos.map((todo) => {
              const isOverdue = todo.dueDate && !todo.completed && (() => {
                const dueDateTimeString = todo.dueDate + (todo.dueTime ? `T${todo.dueTime}` : 'T23:59');
                return new Date(dueDateTimeString) < new Date();
              })();
              
              const formatDateTime = (date, time) => {
                if (!date) return '—';
                const formattedDate = new Date(date).toLocaleDateString();
                if (time) {
                  const [hours, minutes] = time.split(':');
                  const hour12 = parseInt(hours) % 12 || 12;
                  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
                  return `${formattedDate} at ${hour12}:${minutes} ${ampm}`;
                }
                return formattedDate;
              };

              return (
                <tr key={todo._id} className={`${todo.completed ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo._id)}
                      style={{transform: 'scale(1.2)'}}
                    />
                  </td>
                  <td style={{fontWeight: '500'}}>{todo.text}</td>
                  <td>
                    <span className={`priority-${todo.priority}`}>
                      {todo.priority}
                    </span>
                  </td>
                  <td style={{textTransform: 'capitalize'}}>{todo.category}</td>
                  <td>
                    {formatDateTime(todo.dueDate, todo.dueTime)}
                    {isOverdue && <span className="overdue-indicator"> ⚠️ OVERDUE</span>}
                  </td>
                  <td style={{textAlign: 'center', fontSize: '1.2rem'}}>{todo.reminder ? '🔔' : '—'}</td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() => {
                        setEditingTodo(todo);
                        setNewTodo(todo.text);
                        setDueDate(todo.dueDate || '');
                        setDueTime(todo.dueTime || '');
                        setReminder(todo.reminder);
                        setPriority(todo.priority);
                        setCategory(todo.category);
                      }}
                      title="Edit Task"
                    >
                      ✏️
                    </button>

                    <button
                      className="icon-button"
                      onClick={() => deleteTodo(todo._id)}
                      title="Delete Task"
                      style={{background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'}}
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