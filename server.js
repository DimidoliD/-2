const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
require('dotenv').config();

// Инициализация Express приложения
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://yavibetodo-telegram-539l.bolt.host',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Простая база данных в памяти для задач
let todos = [];
let users = new Map();

// Telegram Bot API
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Функция для отправки сообщений в Telegram
async function sendTelegramMessage(chatId, text, options = {}) {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return null;
    }
    
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('Error sending Telegram message:', error.response?.data || error.message);
    return null;
  }
}

// Функция для валидации Telegram WebApp данных
function validateTelegramWebAppData(initData) {
  // В реальном приложении здесь должна быть проверка подписи
  // Для демо версии просто парсим данные
  try {
    const urlParams = new URLSearchParams(initData);
    const user = JSON.parse(urlParams.get('user') || '{}');
    return user;
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return null;
  }
}

// ===== API ENDPOINTS ДЛЯ МИНИ-ПРИЛОЖЕНИЯ =====

// Получить все задачи пользователя
app.get('/api/todos', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userTodos = todos.filter(todo => todo.userId === userId);
    res.json({
      success: true,
      data: userTodos
    });
  } catch (error) {
    console.error('Error getting todos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Создать новую задачу
app.post('/api/todos', (req, res) => {
  try {
    const { userId, text, initData } = req.body;
    
    if (!userId || !text) {
      return res.status(400).json({ error: 'User ID and text are required' });
    }

    // Валидация Telegram WebApp данных (опционально)
    if (initData) {
      const user = validateTelegramWebAppData(initData);
      if (!user) {
        return res.status(401).json({ error: 'Invalid Telegram data' });
      }
    }

    const newTodo = {
      id: Date.now(),
      userId: userId,
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    todos.push(newTodo);
    
    res.json({
      success: true,
      data: newTodo
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить задачу
app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text, completed } = req.body;
    
    const todoIndex = todos.findIndex(todo => todo.id === parseInt(id) && todo.userId === userId);
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (text !== undefined) todos[todoIndex].text = text;
    if (completed !== undefined) todos[todoIndex].completed = completed;
    todos[todoIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: todos[todoIndex]
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить задачу
app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    const todoIndex = todos.findIndex(todo => todo.id === parseInt(id) && todo.userId === userId);
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const deletedTodo = todos.splice(todoIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedTodo
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== TELEGRAM BOT COMMANDS =====

// Webhook для получения обновлений от Telegram
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('Received update:', JSON.stringify(update, null, 2));

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const userId = update.message.from.id.toString();

      console.log(`Processing message from user ${userId}: ${text}`);

      // Сохраняем информацию о пользователе
      users.set(userId, {
        id: userId,
        username: update.message.from.username,
        firstName: update.message.from.first_name,
        lastName: update.message.from.last_name
      });

      // Обрабатываем команды без отправки сообщений в Telegram
      if (text === '/start') {
        console.log('Processing /start command');
        // Просто логируем, что команда получена
        console.log('Start command received from user:', userId);
      } else if (text === '/help') {
        console.log('Processing /help command');
        console.log('Help command received from user:', userId);
      } else if (text.startsWith('/add ')) {
        const taskText = text.substring(5);
        if (!taskText) {
          console.log('Add command without text from user:', userId);
          return;
        }

        const newTodo = {
          id: Date.now(),
          userId: userId,
          text: taskText,
          completed: false,
          createdAt: new Date().toISOString()
        };

        todos.push(newTodo);
        console.log('Task added:', newTodo);
      } else if (text === '/list') {
        const userTodos = todos.filter(todo => todo.userId === userId);
        console.log('List command from user:', userId, 'Tasks:', userTodos.length);
      } else if (text.startsWith('/done ')) {
        const taskNumber = parseInt(text.substring(6));
        const userTodos = todos.filter(todo => todo.userId === userId);
        const taskIndex = taskNumber - 1;

        if (isNaN(taskNumber) || taskIndex < 0 || taskIndex >= userTodos.length) {
          console.log('Invalid done command from user:', userId, 'taskNumber:', taskNumber);
          return;
        }

        const task = userTodos[taskIndex];
        const globalTaskIndex = todos.findIndex(t => t.id === task.id);
        
        if (globalTaskIndex !== -1) {
          todos[globalTaskIndex].completed = true;
          console.log('Task marked as done:', task.text);
        }
      } else if (text.startsWith('/delete ')) {
        const taskNumber = parseInt(text.substring(8));
        const userTodos = todos.filter(todo => todo.userId === userId);
        const taskIndex = taskNumber - 1;

        if (isNaN(taskNumber) || taskIndex < 0 || taskIndex >= userTodos.length) {
          console.log('Invalid delete command from user:', userId, 'taskNumber:', taskNumber);
          return;
        }

        const task = userTodos[taskIndex];
        const globalTaskIndex = todos.findIndex(t => t.id === task.id);
        
        if (globalTaskIndex !== -1) {
          todos.splice(globalTaskIndex, 1);
          console.log('Task deleted:', task.text);
        }
      } else {
        console.log('Unknown command from user:', userId, 'text:', text);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ===== UTILITY ENDPOINTS =====

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    todosCount: todos.length,
    usersCount: users.size,
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ToDo Telegram Bot API is running!',
    bot: '@ToDoYaBot',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      webhook: '/webhook',
      api: {
        todos: '/api/todos',
        createTodo: 'POST /api/todos',
        updateTodo: 'PUT /api/todos/:id',
        deleteTodo: 'DELETE /api/todos/:id'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Bot: @ToDoYaBot`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Webhook: http://localhost:${PORT}/webhook`);
  console.log(`🌐 API: http://localhost:${PORT}/api/todos`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});