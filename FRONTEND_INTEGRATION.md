# Интеграция с Bolt фронтендом

## 🔗 Подключение к серверу

### 1. URL сервера
Замените `YOUR_RENDER_URL` на URL вашего сервера на Render:
```javascript
const API_BASE_URL = 'https://your-app-name.onrender.com';
```

### 2. API Endpoints

#### Получить все задачи
```javascript
GET /api/todos?userId=USER_ID
```

#### Создать задачу
```javascript
POST /api/todos
Content-Type: application/json

{
  "userId": "USER_ID",
  "text": "Текст задачи",
  "initData": "telegram_webapp_data" // опционально
}
```

#### Обновить задачу
```javascript
PUT /api/todos/:id
Content-Type: application/json

{
  "userId": "USER_ID",
  "text": "Новый текст", // опционально
  "completed": true // опционально
}
```

#### Удалить задачу
```javascript
DELETE /api/todos/:id?userId=USER_ID
```

## 📱 Пример кода для Bolt

### 1. Получение данных пользователя из Telegram WebApp

```javascript
// В вашем Bolt приложении
const tg = window.Telegram.WebApp;

// Получаем данные пользователя
const user = tg.initDataUnsafe.user;
const userId = user.id.toString();

// Получаем initData для валидации на сервере
const initData = tg.initData;
```

### 2. API клиент

```javascript
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
const api = new TodoAPI('https://your-app-name.onrender.com');
```

### 3. Пример использования в Bolt компоненте

```javascript
import React, { useState, useEffect } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  
  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe.user;
  const userId = user.id.toString();
  const initData = tg.initData;

  // Загружаем задачи при монтировании
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await api.getTodos(userId);
      if (response.success) {
        setTodos(response.data);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    try {
      const response = await api.createTodo(userId, newTodo.trim(), initData);
      if (response.success) {
        setTodos([...todos, response.data]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await api.updateTodo(id, userId, { completed });
      if (response.success) {
        setTodos(todos.map(todo => 
          todo.id === id ? { ...todo, completed } : todo
        ));
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await api.deleteTodo(id, userId);
      if (response.success) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="todo-app">
      <h1>Мои задачи</h1>
      
      <div className="add-todo">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Добавить задачу..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Добавить</button>
      </div>

      <div className="todos-list">
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => toggleTodo(todo.id, e.target.checked)}
            />
            <span className="todo-text">{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodoApp;
```

## 🔧 Настройка CORS

Если у вас проблемы с CORS, добавьте URL вашего Bolt фронтенда в переменную окружения:

```env
FRONTEND_URL=https://your-bolt-app.com
```

Или в настройках Render добавьте переменную:
- `FRONTEND_URL` = `https://your-bolt-app.com`

## 📡 Настройка Webhook

После деплоя на Render настройте webhook для бота:

```bash
curl -X POST "https://api.telegram.org/bot8127780450:AAHaerKpn5LKutGijkLsRIxdFloqG4hz9Eg/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app-name.onrender.com/webhook"}'
```

## 🧪 Тестирование

### 1. Проверка API
```bash
# Получить все задачи
curl "https://your-app-name.onrender.com/api/todos?userId=123456789"

# Создать задачу
curl -X POST "https://your-app-name.onrender.com/api/todos" \
     -H "Content-Type: application/json" \
     -d '{"userId": "123456789", "text": "Тестовая задача"}'
```

### 2. Проверка webhook
```bash
curl -X POST "https://your-app-name.onrender.com/webhook" \
     -H "Content-Type: application/json" \
     -d '{"message": {"chat": {"id": 123456789}, "from": {"id": 123456789}, "text": "/start"}}'
```

## 🚨 Важные моменты

1. **User ID** - используйте `user.id.toString()` из Telegram WebApp
2. **Валидация** - проверяйте `initData` на сервере для безопасности
3. **CORS** - убедитесь, что CORS настроен правильно
4. **Ошибки** - обрабатывайте ошибки API в фронтенде
5. **Loading states** - показывайте состояние загрузки

## 📱 Telegram WebApp функции

```javascript
const tg = window.Telegram.WebApp;

// Показать главную кнопку
tg.MainButton.setText('Сохранить');
tg.MainButton.show();
tg.MainButton.onClick(() => {
  // Сохранить данные
  tg.close();
});

// Показать кнопку "Назад"
tg.BackButton.show();
tg.BackButton.onClick(() => {
  // Обработка нажатия "Назад"
});

// Закрыть приложение
tg.close();

// Отправить данные в бот
tg.sendData(JSON.stringify({action: 'save', data: todos}));
```

Готово! Теперь ваш Bolt фронтенд может работать с сервером на Render.
