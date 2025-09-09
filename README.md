# ToDo Telegram Bot

Простой Telegram бот для управления задачами, созданный с использованием Bolt framework и развернутый на Render.com.

## Функциональность

- ✅ Добавление задач
- 📋 Просмотр списка задач
- ✅ Отметка задач как выполненных
- 🗑️ Удаление задач
- 📱 Интуитивный интерфейс команд

## Команды бота

- `/start` - начать работу с ботом
- `/add <задача>` - добавить новую задачу
- `/list` - показать все ваши задачи
- `/done <номер>` - отметить задачу как выполненную
- `/delete <номер>` - удалить задачу
- `/help` - показать справку

## Локальная разработка

### Установка зависимостей

```bash
npm install
```

### Настройка переменных окружения

Создайте файл `.env` на основе `env.example`:

```bash
cp env.example .env
```

Заполните переменные в `.env`:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_BOT_USERNAME=имя_бота
PORT=3000
NODE_ENV=development
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Запуск в продакшене

```bash
npm start
```

## Деплой на Render.com

### 1. Подготовка репозитория

1. Создайте репозиторий на GitHub
2. Загрузите код в репозиторий
3. Убедитесь, что все файлы загружены

### 2. Создание сервиса на Render

1. Зайдите на [render.com](https://render.com)
2. Нажмите "New +" → "Web Service"
3. Подключите ваш GitHub репозиторий
4. Выберите ветку (обычно `main`)

### 3. Настройка сервиса

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
Добавьте следующие переменные окружения в настройках сервиса:

- `TELEGRAM_BOT_TOKEN` = `8127780450:AAHaerKpn5LKutGijkLsRIxdFloqG4hz9Eg`
- `TELEGRAM_BOT_USERNAME` = `ToDoYaBot`
- `NODE_ENV` = `production`
- `PORT` = `3000` (Render автоматически установит порт)

### 4. Настройка Telegram Webhook

После успешного деплоя настройте webhook для вашего бота:

1. Получите URL вашего сервиса на Render (например: `https://your-app-name.onrender.com`)
2. Установите webhook через Telegram API:

```bash
curl -X POST "https://api.telegram.org/bot8127780450:AAHaerKpn5LKutGijkLsRIxdFloqG4hz9Eg/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app-name.onrender.com/webhook"}'
```

### 5. Проверка работы

1. Найдите вашего бота в Telegram: `@ToDoYaBot`
2. Отправьте команду `/start`
3. Проверьте, что бот отвечает

## Структура проекта

```
├── server.js          # Основной файл сервера
├── package.json       # Зависимости и скрипты
├── Dockerfile         # Конфигурация Docker
├── .dockerignore      # Игнорируемые файлы для Docker
├── env.example        # Пример переменных окружения
└── README.md          # Документация
```

## API Endpoints

- `GET /` - Информация о боте
- `GET /health` - Проверка состояния сервера
- `POST /webhook` - Webhook для Telegram
- `POST /slack/events` - Альтернативный webhook

## Мониторинг

Сервер включает в себя:
- Health check endpoint для мониторинга
- Логирование ошибок
- Graceful shutdown
- Автоматическое восстановление

## Безопасность

- Использование переменных окружения для токенов
- Валидация входящих данных
- Обработка ошибок
- Ограничение доступа по user_id

## Поддержка

Если у вас возникли проблемы:

1. Проверьте логи в панели Render
2. Убедитесь, что webhook настроен правильно
3. Проверьте переменные окружения
4. Убедитесь, что бот не заблокирован в Telegram

## Лицензия

MIT License
