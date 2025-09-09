# Настройка Webhook для Telegram бота

## 🔗 Ваши URL'ы:
- **Сервер**: https://gpt-attempt.onrender.com
- **Фронтенд**: https://yavibetodo-telegram-539l.bolt.host

## 📡 Настройка Webhook

### 1. Установите webhook для бота:

```bash
curl -X POST "https://api.telegram.org/bot8127780450:AAHaerKpn5LKutGijkLsRIxdFloqG4hz9Eg/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://gpt-attempt.onrender.com/webhook"}'
```

### 2. Проверьте, что webhook установлен:

```bash
curl "https://api.telegram.org/bot8127780450:AAHaerKpn5LKutGijkLsRIxdFloqG4hz9Eg/getWebhookInfo"
```

### 3. Удалите webhook (если нужно):

```bash
curl -X POST "https://api.telegram.org/bot8127780450:AAHaerKpn5LKutGijkLsRIxdFloqG4hz9Eg/deleteWebhook"
```

## 🧪 Тестирование

### 1. Проверьте сервер:
```bash
curl "https://gpt-attempt.onrender.com/health"
```

### 2. Проверьте API:
```bash
curl "https://gpt-attempt.onrender.com/api/todos?userId=123456789"
```

### 3. Проверьте webhook:
```bash
curl -X POST "https://gpt-attempt.onrender.com/webhook" \
     -H "Content-Type: application/json" \
     -d '{"message": {"chat": {"id": 123456789}, "from": {"id": 123456789}, "text": "/start"}}'
```

## 📱 Настройка мини-приложения

### 1. В @BotFather:
1. Найдите вашего бота: @ToDoYaBot
2. Отправьте команду `/newapp`
3. Выберите вашего бота
4. Укажите название: "ToDo App"
5. Укажите описание: "Управление задачами"
6. Укажите URL: `https://yavibetodo-telegram-539l.bolt.host`
7. Загрузите иконку (опционально)

### 2. Получите ссылку на мини-приложение:
После настройки вы получите ссылку вида:
```
https://t.me/ToDoYaBot/app?startapp=your_app_name
```

## 🔧 Настройка Bolt фронтенда

### 1. Скопируйте код:
Используйте код из файла `bolt-frontend-code.js`

### 2. Установите зависимости:
```bash
npm install
```

### 3. Запустите проект:
```bash
npm start
```

### 4. Деплой на Bolt:
- Нажмите "Deploy" в Bolt
- Получите URL: `https://yavibetodo-telegram-539l.bolt.host`

## ✅ Проверка работы

### 1. Тест бота:
1. Найдите @ToDoYaBot в Telegram
2. Отправьте `/start`
3. Проверьте, что бот отвечает

### 2. Тест мини-приложения:
1. Откройте ссылку мини-приложения
2. Проверьте, что загружаются задачи
3. Попробуйте добавить/удалить задачу

### 3. Тест API:
1. Откройте https://gpt-attempt.onrender.com
2. Проверьте, что сервер отвечает
3. Проверьте health endpoint

## 🚨 Возможные проблемы

### 1. CORS ошибки:
- Убедитесь, что в сервере настроен CORS для вашего фронтенда
- Проверьте, что URL фронтенда точно совпадает

### 2. Webhook не работает:
- Проверьте, что сервер запущен
- Убедитесь, что URL webhook правильный
- Проверьте логи сервера

### 3. API не отвечает:
- Проверьте, что сервер запущен
- Убедитесь, что все зависимости установлены
- Проверьте переменные окружения

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи сервера на Render
2. Проверьте консоль браузера в мини-приложении
3. Проверьте webhook через getWebhookInfo
4. Убедитесь, что все URL'ы правильные

Готово! Теперь ваш бот и мини-приложение должны работать вместе! 🚀
