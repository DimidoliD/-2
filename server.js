const { App } = require('@slack/bolt');
const express = require('express');
require('dotenv').config();

// Инициализация Express приложения
const expressApp = express();
const PORT = process.env.PORT || 3000;

// Инициализация Bolt приложения
const app = new App({
  token: process.env.TELEGRAM_BOT_TOKEN,
  signingSecret: process.env.TELEGRAM_BOT_TOKEN, // Для Telegram используем токен как signing secret
  socketMode: false, // Отключаем socket mode для Telegram
  processBeforeResponse: true
});

// Middleware для парсинга JSON
expressApp.use(express.json());

// Простая база данных в памяти для задач
let todos = [];
let userIds = new Set();

// Обработчик команды /start
app.command('/start', async ({ command, ack, respond }) => {
  await ack();
  
  const userId = command.user_id;
  userIds.add(userId);
  
  await respond({
    text: `Привет! Я бот для управления задачами. Используйте команды:
    /add <задача> - добавить задачу
    /list - показать все задачи
    /done <номер> - отметить задачу как выполненную
    /delete <номер> - удалить задачу
    /help - показать справку`,
    response_type: 'in_channel'
  });
});

// Обработчик команды /help
app.command('/help', async ({ command, ack, respond }) => {
  await ack();
  
  await respond({
    text: `Доступные команды:
    /start - начать работу с ботом
    /add <задача> - добавить новую задачу
    /list - показать все ваши задачи
    /done <номер> - отметить задачу как выполненную
    /delete <номер> - удалить задачу
    /help - показать эту справку`,
    response_type: 'in_channel'
  });
});

// Обработчик команды /add
app.command('/add', async ({ command, ack, respond }) => {
  await ack();
  
  const userId = command.user_id;
  const taskText = command.text;
  
  if (!taskText) {
    await respond({
      text: 'Пожалуйста, укажите задачу. Пример: /add Купить молоко',
      response_type: 'in_channel'
    });
    return;
  }
  
  const newTask = {
    id: Date.now(),
    userId: userId,
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.push(newTask);
  
  await respond({
    text: `✅ Задача добавлена: "${taskText}"`,
    response_type: 'in_channel'
  });
});

// Обработчик команды /list
app.command('/list', async ({ command, ack, respond }) => {
  await ack();
  
  const userId = command.user_id;
  const userTodos = todos.filter(todo => todo.userId === userId);
  
  if (userTodos.length === 0) {
    await respond({
      text: 'У вас пока нет задач. Добавьте первую с помощью /add',
      response_type: 'in_channel'
    });
    return;
  }
  
  let message = '📋 Ваши задачи:\n\n';
  userTodos.forEach((todo, index) => {
    const status = todo.completed ? '✅' : '⏳';
    message += `${index + 1}. ${status} ${todo.text}\n`;
  });
  
  await respond({
    text: message,
    response_type: 'in_channel'
  });
});

// Обработчик команды /done
app.command('/done', async ({ command, ack, respond }) => {
  await ack();
  
  const userId = command.user_id;
  const taskNumber = parseInt(command.text);
  
  if (isNaN(taskNumber)) {
    await respond({
      text: 'Пожалуйста, укажите номер задачи. Пример: /done 1',
      response_type: 'in_channel'
    });
    return;
  }
  
  const userTodos = todos.filter(todo => todo.userId === userId);
  const taskIndex = taskNumber - 1;
  
  if (taskIndex < 0 || taskIndex >= userTodos.length) {
    await respond({
      text: 'Задача с таким номером не найдена. Используйте /list чтобы увидеть ваши задачи.',
      response_type: 'in_channel'
    });
    return;
  }
  
  const task = userTodos[taskIndex];
  const globalTaskIndex = todos.findIndex(t => t.id === task.id);
  
  if (globalTaskIndex !== -1) {
    todos[globalTaskIndex].completed = true;
    await respond({
      text: `✅ Задача выполнена: "${task.text}"`,
      response_type: 'in_channel'
    });
  }
});

// Обработчик команды /delete
app.command('/delete', async ({ command, ack, respond }) => {
  await ack();
  
  const userId = command.user_id;
  const taskNumber = parseInt(command.text);
  
  if (isNaN(taskNumber)) {
    await respond({
      text: 'Пожалуйста, укажите номер задачи. Пример: /delete 1',
      response_type: 'in_channel'
    });
    return;
  }
  
  const userTodos = todos.filter(todo => todo.userId === userId);
  const taskIndex = taskNumber - 1;
  
  if (taskIndex < 0 || taskIndex >= userTodos.length) {
    await respond({
      text: 'Задача с таким номером не найдена. Используйте /list чтобы увидеть ваши задачи.',
      response_type: 'in_channel'
    });
    return;
  }
  
  const task = userTodos[taskIndex];
  const globalTaskIndex = todos.findIndex(t => t.id === task.id);
  
  if (globalTaskIndex !== -1) {
    todos.splice(globalTaskIndex, 1);
    await respond({
      text: `🗑️ Задача удалена: "${task.text}"`,
      response_type: 'in_channel'
    });
  }
});

// Обработчик неизвестных команд
app.command(/.*/, async ({ command, ack, respond }) => {
  await ack();
  
  await respond({
    text: 'Неизвестная команда. Используйте /help для просмотра доступных команд.',
    response_type: 'in_channel'
  });
});

// Обработчик для Telegram webhook
expressApp.post('/slack/events', async (req, res) => {
  try {
    await app.processEvent(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).send('Error');
  }
});

// Обработчик для Telegram webhook (альтернативный путь)
expressApp.post('/webhook', async (req, res) => {
  try {
    await app.processEvent(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error');
  }
});

// Health check endpoint
expressApp.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    todosCount: todos.length,
    usersCount: userIds.size
  });
});

// Root endpoint
expressApp.get('/', (req, res) => {
  res.json({ 
    message: 'ToDo Telegram Bot is running!',
    bot: '@ToDoYaBot',
    endpoints: {
      health: '/health',
      webhook: '/webhook',
      slack_events: '/slack/events'
    }
  });
});

// Запуск сервера
(async () => {
  try {
    await app.start();
    console.log('⚡️ Bolt app is running!');
    
    expressApp.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 Bot: @ToDoYaBot`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start the app:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});
