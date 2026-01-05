# Менеджер задач

Полнофункциональное JavaScript веб-приложение для управления задачами, построенное с использованием Fastify.

## Статус проекта
[![Actions Status](https://github.com/Vox1oot/fullstack-javascript-project-6/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Vox1oot/fullstack-javascript-project-6/actions)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Vox1oot_fullstack-javascript-project-6&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Vox1oot_fullstack-javascript-project-6)

## Стек технологий

- **Backend**: Fastify, Node.js
- **База данных**: PostgreSQL с ORM Objection.js
- **Frontend**: Bootstrap, шаблоны Pug
- **Сборка**: Webpack
- **Тестирование**: Jest
- **Качество кода**: ESLint

## Требования

- Node.js (последняя LTS версия)
- База данных PostgreSQL
- Менеджер пакетов npm

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Vox1oot/fullstack-javascript-project-6.git
cd fullstack-javascript-project-6
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
# Отредактируйте .env, добавив данные для подключения к БД и другие настройки
```

4. Настройте базу данных:
```bash
npm run db:migrate
npm run db:seed
```

## Использование

### Разработка
```bash
npm run dev
```
Приложение запустится по адресу `http://localhost:3000`

### Продакшн
```bash
npm start
```

## Доступные команды

- `npm start` - Запуск приложения в продакшн режиме
- `npm run dev` - Запуск сервера разработки с автоперезагрузкой
- `npm test` - Запуск тестов
- `npm run lint` - Запуск ESLint
- `npm run build` - Сборка приложения

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт сервера | 3000 |
| `HOST` | Хост сервера | 0.0.0.0 |
| `DATABASE_URL` | Строка подключения к PostgreSQL | - |
| `SESSION_KEY` | Секретный ключ для сессий | - |


## Пример
[Запущеное приложение на Render](https://fullstack-javascript-project-6-vdk9.onrender.com/)