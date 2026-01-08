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
- База данных PostgreSQL (для production) или SQLite (для разработки)
- Менеджер пакетов npm

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Vox1oot/fullstack-javascript-project-6.git
cd fullstack-javascript-project-6
```

2. Выполните установку зависимостей:
```bash
make install
```

3. Настройте переменные окружения в файле `.env`:
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
SESSION_SECRET=your-secret-key-change-in-production
ROLLBAR_ACCESS_TOKEN=your-rollbar-access-token
```

## Использование

### Разработка
```bash
make migrate-dev
make start-dev
```
Приложение запустится по адресу `http://127.0.0.1:3000` с автоматической перезагрузкой при изменении файлов.

### Продакшн
```bash
make build
make migrate-prod
make start-prod
```

## Доступные команды

### Основные команды
- `make start-dev` - Запуск в режиме разработки (frontend + backend с hot reload)
- `make start-prod` - Запуск в продакшн режиме

### Управление базой данных
- `make migrate-dev` - Применить миграции в режиме разработки
- `make migrate-prod` - Применить миграции в режиме продакшен
- `make rollback-dev` - Откатить последнюю миграцию в режиме разработки
- `make rollback-prod` - Откатить последнюю миграцию в режиме продакшен

### Сборка и установка
- `make install` - Установить зависимости
- `make build` - Собрать frontend

### Качество кода
- `make lint` - Проверить и исправить код с помощью ESLint
- `make test` - Запустить тесты
- `make test-coverage` - Запустить тесты с покрытием

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт сервера | 3000 |
| `HOST` | Хост сервера | 0.0.0.0 |
| `NODE_ENV` | Окружение (development/production) | development |
| `DATABASE_URL` | Строка подключения к PostgreSQL (production) | - |
| `SESSION_SECRET` | Секретный ключ для сессий | - |
| `ROLLBAR_ACCESS_TOKEN` | Токен для мониторинга ошибок Rollbar | - |

## Пример
[Запущенное приложение на Render](https://fullstack-javascript-project-6-vdk9.onrender.com/)