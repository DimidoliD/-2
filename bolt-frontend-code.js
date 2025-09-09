// ===== КОД ДЛЯ BOLT ФРОНТЕНДА =====
// Скопируйте этот код в ваш Bolt проект

import React, { useState, useEffect } from 'react';

// Конфигурация API
const API_BASE_URL = 'https://gpt-attempt.onrender.com';

// API клиент
class TodoAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getTodos(userId) {
    const response = await fetch(`${this.baseURL}/api/todos?userId=${userId}`);
    return response.json();
  }

  async createTodo(userId, text, initData = null) {
    const response = await fetch(`${this.baseURL}/api/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        text,
        initData
      })
    });
    return response.json();
  }

  async updateTodo(id, userId, updates) {
    const response = await fetch(`${this.baseURL}/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...updates
      })
    });
    return response.json();
  }

  async deleteTodo(id, userId) {
    const response = await fetch(`${this.baseURL}/api/todos/${id}?userId=${userId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}

// Инициализация API
const api = new TodoAPI(API_BASE_URL);

// Основной компонент приложения
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState(null);
  
  // Получаем данные пользователя из Telegram WebApp
  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe.user;
  const userId = user.id.toString();
  const initData = tg.initData;

  // Инициализация Telegram WebApp
  useEffect(() => {
    tg.ready();
    tg.expand();
    
    // Настраиваем главную кнопку
    tg.MainButton.setText('Сохранить');
    tg.MainButton.hide();
    
    // Настраиваем кнопку "Назад"
    tg.BackButton.hide();
  }, []);

  // Загружаем задачи при монтировании
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getTodos(userId);
      
      if (response.success) {
        setTodos(response.data);
      } else {
        setError(response.error || 'Ошибка загрузки задач');
      }
    } catch (error) {
      console.error('Error loading todos:', error);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    try {
      setError(null);
      const response = await api.createTodo(userId, newTodo.trim(), initData);
      
      if (response.success) {
        setTodos([...todos, response.data]);
        setNewTodo('');
        tg.showAlert('Задача добавлена!');
      } else {
        setError(response.error || 'Ошибка создания задачи');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      setError('Ошибка подключения к серверу');
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      setError(null);
      const response = await api.updateTodo(id, userId, { completed });
      
      if (response.success) {
        setTodos(todos.map(todo => 
          todo.id === id ? { ...todo, completed } : todo
        ));
        tg.showAlert(completed ? 'Задача выполнена!' : 'Задача отмечена как невыполненная');
      } else {
        setError(response.error || 'Ошибка обновления задачи');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Ошибка подключения к серверу');
    }
  };

  const deleteTodo = async (id) => {
    try {
      setError(null);
      const response = await api.deleteTodo(id, userId);
      
      if (response.success) {
        setTodos(todos.filter(todo => todo.id !== id));
        tg.showAlert('Задача удалена!');
      } else {
        setError(response.error || 'Ошибка удаления задачи');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Ошибка подключения к серверу');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Загрузка задач...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📝 Мои задачи</h1>
        <p style={styles.subtitle}>Привет, {user.first_name}! 👋</p>
      </div>

      {error && (
        <div style={styles.error}>
          <p>❌ {error}</p>
          <button onClick={loadTodos} style={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      )}

      <div style={styles.addTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Добавить новую задачу..."
          style={styles.input}
        />
        <button onClick={addTodo} style={styles.addButton}>
          ➕
        </button>
      </div>

      <div style={styles.todosList}>
        {todos.length === 0 ? (
          <div style={styles.emptyState}>
            <p>📝 У вас пока нет задач</p>
            <p>Добавьте первую задачу выше!</p>
          </div>
        ) : (
          todos.map(todo => (
            <div key={todo.id} style={styles.todoItem}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                style={styles.checkbox}
              />
              <span style={{
                ...styles.todoText,
                textDecoration: todo.completed ? 'line-through' : 'none',
                opacity: todo.completed ? 0.6 : 1
              }}>
                {todo.text}
              </span>
              <button 
                onClick={() => deleteTodo(todo.id)} 
                style={styles.deleteButton}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Всего задач: {todos.length} | 
          Выполнено: {todos.filter(t => t.completed).length}
        </p>
      </div>
    </div>
  );
}

// Стили
const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '24px',
    margin: '0 0 10px 0',
    color: '#2c3e50'
  },
  subtitle: {
    fontSize: '16px',
    margin: '0',
    color: '#7f8c8d'
  },
  loading: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  addTodo: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none'
  },
  addButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  todosList: {
    marginBottom: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6c757d'
  },
  todoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    marginBottom: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  },
  todoText: {
    flex: 1,
    fontSize: '16px',
    wordBreak: 'break-word'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  footer: {
    textAlign: 'center',
    padding: '20px 0',
    borderTop: '1px solid #e9ecef'
  },
  footerText: {
    fontSize: '14px',
    color: '#6c757d',
    margin: '0'
  }
};

// CSS анимация для спиннера
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default TodoApp;
