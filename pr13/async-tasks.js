// ЗАДАНИЕ 1: Основы промисов

// 1.1. Промис, который резолвится/реджектится через 1 секунду
function createBasicPromise(shouldResolve = true) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldResolve) {
                resolve("Успех!");
            } else {
                reject(new Error("Ошибка!"));
            }
        }, 1000);
    });
}

// 1.2. Обработка базового промиса через .then() / .catch()
function handleBasicPromise() {
    const output = document.getElementById('promise-output');
    output.textContent = 'Результат промисов: загрузка...';

    createBasicPromise(true)
        .then((result) => {
            output.textContent = `Результат промисов: ${result}`;
            output.className = 'output success';
        })
        .catch((error) => {
            output.textContent = `Результат промисов: ${error.message}`;
            output.className = 'output error';
        });
}

// 1.3. Цепочка из 3 промисов по 0.5 секунды
function createPromiseChain() {
    const output = document.getElementById('promise-output');
    output.textContent = 'Результат промисов: цепочка запущена...';

    const delay = (ms, value) =>
        new Promise((resolve) => setTimeout(() => resolve(value), ms));

    delay(500, 'Шаг 1')
        .then((step1) => {
            output.textContent = `Результат промисов: ${step1} выполнен`;
            return delay(500, `${step1} → Шаг 2`);
        })
        .then((step2) => {
            output.textContent = `Результат промисов: ${step2} выполнен`;
            return delay(500, `${step2} → Шаг 3 (финал)`);
        })
        .then((step3) => {
            output.textContent = `Результат промисов: ${step3} ✔`;
            output.className = 'output success';
        })
        .catch((error) => {
            output.textContent = `Результат промисов: ${error.message}`;
            output.className = 'output error';
        });
}

// 1.4. Обработка ошибки в промисах
function handlePromiseError() {
    const output = document.getElementById('promise-output');
    output.textContent = 'Результат промисов: ожидание ошибки...';

    createBasicPromise(false)
        .then((result) => {
            output.textContent = `Результат промисов: ${result}`;
        })
        .catch((error) => {
            output.textContent = `Результат промисов: перехвачена ошибка — ${error.message}`;
            output.className = 'output error';
        });
}

// 1.5. Настройка обработчиков промисов
function setupPromiseEvents() {
    document.getElementById('basic-promise')
        .addEventListener('click', handleBasicPromise);
    document.getElementById('promise-chain')
        .addEventListener('click', createPromiseChain);
    document.getElementById('promise-error')
        .addEventListener('click', handlePromiseError);
}

// ЗАДАНИЕ 2: Async/Await

// 2.1. Базовый async/await
async function basicAsyncAwait() {
    const output = document.getElementById('async-output');
    output.textContent = 'Результат async/await: ожидание...';

    try {
        const result = await createBasicPromise(true);
        // Дополнительная задержка перед выводом
        await new Promise((resolve) => setTimeout(resolve, 500));
        output.textContent = `Результат async/await: ${result}`;
        output.className = 'output success';
    } catch (error) {
        output.textContent = `Результат async/await: ${error.message}`;
        output.className = 'output error';
    }
}

// 2.2. Обработка ошибок через try/catch
async function handleAsyncError() {
    const output = document.getElementById('async-output');
    output.textContent = 'Результат async/await: ожидание ошибки...';

    try {
        const result = await createBasicPromise(false);
        output.textContent = `Результат async/await: ${result}`;
    } catch (error) {
        output.textContent = `Результат async/await: перехвачена ошибка — ${error.message}`;
        output.className = 'output error';
    }
}

// 2.3. Параллельное выполнение через Promise.all
async function parallelAsyncExecution() {
    const output = document.getElementById('async-output');
    output.textContent = 'Результат async/await: параллельный запуск...';

    const delay = (ms, value) =>
        new Promise((resolve) => setTimeout(() => resolve(value), ms));

    const start = performance.now();

    try {
        const results = await Promise.all([
            delay(300, 'Задача A'),
            delay(500, 'Задача B'),
            delay(700, 'Задача C')
        ]);

        const elapsed = Math.round(performance.now() - start);
        output.textContent =
            `Результат async/await: параллельно выполнено за ${elapsed} мс\n` +
            results.join(', ');
        output.className = 'output success';
    } catch (error) {
        output.textContent = `Результат async/await: ${error.message}`;
        output.className = 'output error';
    }
}

// 2.4. Настройка обработчиков async/await
function setupAsyncEvents() {
    document.getElementById('basic-async')
        .addEventListener('click', basicAsyncAwait);
    document.getElementById('async-error')
        .addEventListener('click', handleAsyncError);
    document.getElementById('async-parallel')
        .addEventListener('click', parallelAsyncExecution);
}

// ЗАДАНИЕ 3: Работа с внешними API

const API_BASE = 'https://jsonplaceholder.typicode.com';

// 3.1. Загрузка пользователей
async function fetchUsers() {
    const output = document.getElementById('api-output');
    const dataContainer = document.getElementById('api-data');

    output.textContent = 'Данные API: загрузка пользователей...';
    output.className = 'output';
    dataContainer.innerHTML = '<span class="spinner"></span>';

    try {
        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const users = await response.json();

        dataContainer.innerHTML = '';
        users.forEach((user) => {
            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <h4>${user.name}</h4>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Телефон:</strong> ${user.phone}</p>
                <p><strong>Город:</strong> ${user.address.city}</p>
            `;
            dataContainer.appendChild(card);
        });

        output.textContent = `Данные API: загружено ${users.length} пользователей`;
        output.className = 'output success';
    } catch (error) {
        output.textContent = `Данные API: ошибка — ${error.message}`;
        output.className = 'output error';
        dataContainer.innerHTML = '';
    }
}

// 3.2. POST-запрос на создание поста
async function createPost() {
    const output = document.getElementById('api-output');
    output.textContent = 'Данные API: создание поста...';
    output.className = 'output';

    try {
        const response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                title: 'Мой новый пост',
                body: 'Содержимое поста, созданного из практической работы №13.',
                userId: 1
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const post = await response.json();
        output.textContent =
            `Данные API: пост создан\n` +
            `ID: ${post.id}\n` +
            `Title: ${post.title}\n` +
            `Body: ${post.body}`;
        output.className = 'output success';
    } catch (error) {
        output.textContent = `Данные API: ошибка — ${error.message}`;
        output.className = 'output error';
    }
}

// 3.3. Тест ошибки API
async function testApiError() {
    const output = document.getElementById('api-output');
    output.textContent = 'Данные API: тестирование ошибки...';
    output.className = 'output';

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/nonexistent-endpoint-xyz');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        output.textContent = `Данные API: ${JSON.stringify(data)}`;
    } catch (error) {
        if (error instanceof TypeError) {
            output.textContent = `Данные API: сетевая ошибка — ${error.message}`;
        } else {
            output.textContent = `Данные API: ошибка запроса — ${error.message}`;
        }
        output.className = 'output error';
    }
}

// 3.4. Настройка обработчиков API
function setupApiEvents() {
    document.getElementById('fetch-users')
        .addEventListener('click', fetchUsers);
    document.getElementById('fetch-post')
        .addEventListener('click', createPost);
    document.getElementById('fetch-error')
        .addEventListener('click', testApiError);
}

// ЗАДАНИЕ 4: Асинхронные таймеры

let intervalId = null;
let intervalCounter = 0;

// 4.1. Запуск асинхронного интервала
async function startAsyncInterval() {
    const output = document.getElementById('interval-output');
    if (intervalId !== null) {
        output.textContent = 'Интервал: уже запущен';
        return;
    }

    intervalCounter = 0;
    output.textContent = 'Интервал: 0';

    intervalId = setInterval(async () => {
        intervalCounter++;
        output.textContent = `Интервал: ${intervalCounter}`;
        // Асинхронная работа внутри интервала
        await new Promise((resolve) => setTimeout(resolve, 0));
    }, 1000);
}

// 4.2. Остановка интервала
function stopAsyncInterval() {
    const output = document.getElementById('interval-output');
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
    intervalCounter = 0;
    output.textContent = 'Интервал: 0 (остановлен)';
}

// 4.3. Задержка через промис
function delayWithPromise(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 4.4. Тест последовательных задержек
async function testDelay() {
    const output = document.getElementById('timer-output');
    output.textContent = 'Таймер: старт';
    output.className = 'output';

    for (let i = 1; i <= 5; i++) {
        await delayWithPromise(700);
        output.textContent = `Таймер: прошло ${i} сек.`;
    }

    output.textContent = 'Таймер: готово ✔';
    output.className = 'output success';
}

// 4.5. Настройка обработчиков таймеров
function setupTimerEvents() {
    document.getElementById('start-interval')
        .addEventListener('click', startAsyncInterval);
    document.getElementById('stop-interval')
        .addEventListener('click', stopAsyncInterval);
    document.getElementById('delay-promise')
        .addEventListener('click', testDelay);
}

// ЗАДАНИЕ 5: Обработка ошибок

// Вспомогательная функция, имитирующая "ненадёжную" операцию
function unreliableOperation(successRate = 0.5) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < successRate) {
                resolve('Операция выполнена успешно');
            } else {
                reject(new Error('Случайный сбой операции'));
            }
        }, 300);
    });
}

// 5.1. Try/Catch с async
async function tryCatchDemo() {
    const output = document.getElementById('error-output');
    output.textContent = 'Статус ошибок: выполнение...';
    output.className = 'output';

    try {
        const result = await unreliableOperation(0.3);
        output.textContent = `Статус ошибок: ${result}`;
        output.className = 'output success';
    } catch (error) {
        output.textContent = `Статус ошибок: перехвачено — ${error.message}`;
        output.className = 'output error';
    }
}

// 5.2. Множественные ошибки
async function multipleErrorsDemo() {
    const output = document.getElementById('error-output');
    output.textContent = 'Статус ошибок: выполнение нескольких операций...';
    output.className = 'output';

    const operations = [
        unreliableOperation(0.9),
        unreliableOperation(0.1),
        unreliableOperation(0.5)
    ];

    const results = await Promise.allSettled(operations);

    const lines = results.map((r, i) => {
        if (r.status === 'fulfilled') {
            return `Операция ${i + 1}: ✔ ${r.value}`;
        }
        return `Операция ${i + 1}: ✖ ${r.reason.message}`;
    });

    output.textContent = 'Статус ошибок:\n' + lines.join('\n');
    output.className = 'output warning';
}

// 5.3. Повторные попытки (retry pattern)
async function retryPatternDemo() {
    const output = document.getElementById('error-output');
    output.textContent = 'Статус ошибок: повторные попытки...';
    output.className = 'output';

    const maxAttempts = 5;
    let attempt = 0;
    let lastError = null;

    while (attempt < maxAttempts) {
        attempt++;
        try {
            const result = await unreliableOperation(0.3);
            output.textContent =
                `Статус ошибок: успех на попытке ${attempt}\n${result}`;
            output.className = 'output success';
            return;
        } catch (error) {
            lastError = error;
            output.textContent =
                `Статус ошибок: попытка ${attempt} не удалась (${error.message})...`;
        }
    }

    output.textContent =
        `Статус ошибок: все ${maxAttempts} попыток провалились\n${lastError.message}`;
    output.className = 'output error';
}

// Настройка обработчиков ошибок
function setupErrorEvents() {
    document.getElementById('try-catch')
        .addEventListener('click', tryCatchDemo);
    document.getElementById('multiple-errors')
        .addEventListener('click', multipleErrorsDemo);
    document.getElementById('retry-pattern')
        .addEventListener('click', retryPatternDemo);
}

// ЗАДАНИЕ 6: Параллельное выполнение

function makeTask(name, ms, fail = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (fail) {
                reject(new Error(`${name} завершилась с ошибкой`));
            } else {
                resolve(`${name} завершена за ${ms} мс`);
            }
        }, ms);
    });
}

// 6.1. Promise.all
async function promiseAllDemo() {
    const output = document.getElementById('parallel-output');
    output.textContent = 'Параллельные операции: Promise.all...';
    output.className = 'output';

    const start = performance.now();
    try {
        const results = await Promise.all([
            makeTask('Задача 1', 400),
            makeTask('Задача 2', 600),
            makeTask('Задача 3', 800)
        ]);
        const elapsed = Math.round(performance.now() - start);
        output.textContent =
            `Параллельные операции: Promise.all\n` +
            `Всего времени: ${elapsed} мс\n` +
            results.join('\n');
        output.className = 'output success';
    } catch (error) {
        output.textContent = `Параллельные операции: ${error.message}`;
        output.className = 'output error';
    }
}

// 6.2. Promise.race
async function promiseRaceDemo() {
    const output = document.getElementById('parallel-output');
    output.textContent = 'Параллельные операции: Promise.race...';
    output.className = 'output';

    try {
        const winner = await Promise.race([
            makeTask('Быстрая задача', 200),
            makeTask('Средняя задача', 500),
            makeTask('Медленная задача', 900)
        ]);
        output.textContent = `Параллельные операции: Promise.race — победитель: ${winner}`;
        output.className = 'output success';
    } catch (error) {
        output.textContent = `Параллельные операции: ${error.message}`;
        output.className = 'output error';
    }
}

// 6.3. Promise.allSettled
async function promiseAllSettledDemo() {
    const output = document.getElementById('parallel-output');
    output.textContent = 'Параллельные операции: Promise.allSettled...';
    output.className = 'output';

    const results = await Promise.allSettled([
        makeTask('Успешная задача', 300),
        makeTask('Провальная задача', 400, true),
        makeTask('Ещё одна успешная', 500)
    ]);

    const lines = results.map((r, i) => {
        if (r.status === 'fulfilled') {
            return `[${i + 1}] ✔ ${r.value}`;
        }
        return `[${i + 1}] ✖ ${r.reason.message}`;
    });

    output.textContent =
        'Параллельные операции: Promise.allSettled\n' + lines.join('\n');
    output.className = 'output warning';
}

// Настройка обработчиков параллельных операций
function setupParallelEvents() {
    document.getElementById('promise-all')
        .addEventListener('click', promiseAllDemo);
    document.getElementById('promise-race')
        .addEventListener('click', promiseRaceDemo);
    document.getElementById('promise-allSettled')
        .addEventListener('click', promiseAllSettledDemo);
}

// ЗАДАНИЕ 7: Реальные сценарии

// 7.1. Последовательные запросы
async function sequentialRequests() {
    const output = document.getElementById('scenario-output');
    output.textContent = 'Реальные сценарии: последовательные запросы...';
    output.className = 'output';

    const start = performance.now();
    try {
        const userRes = await fetch(`${API_BASE}/users/1`);
        const user = await userRes.json();
        output.textContent = `Реальные сценарии: загружен пользователь ${user.name}`;

        const postsRes = await fetch(`${API_BASE}/posts?userId=1`);
        const posts = await postsRes.json();
        output.textContent += `\nНайдено постов: ${posts.length}`;

        const commentsRes = await fetch(`${API_BASE}/comments?postId=1`);
        const comments = await commentsRes.json();
        output.textContent += `\nКомментариев к первому посту: ${comments.length}`;

        const elapsed = Math.round(performance.now() - start);
        output.textContent += `\nОбщее время (последовательно): ${elapsed} мс`;
        output.className = 'output success';
    } catch (error) {
        output.textContent = `Реальные сценарии: ошибка — ${error.message}`;
        output.className = 'output error';
    }
}

// 7.2. Симуляция загрузки с прогресс-баром
async function uploadSimulation() {
    const output = document.getElementById('scenario-output');
    const progressFill = document.getElementById('progress-fill');

    output.textContent = 'Реальные сценарии: симуляция загрузки...';
    output.className = 'output';
    progressFill.style.width = '0%';

    const totalSteps = 10;
    for (let i = 1; i <= totalSteps; i++) {
        await delayWithPromise(300);
        const percent = Math.round((i / totalSteps) * 100);
        progressFill.style.width = `${percent}%`;
        output.textContent = `Реальные сценарии: загрузка... ${percent}%`;
    }

    output.textContent = 'Реальные сценарии: загрузка завершена ✔';
    output.className = 'output success';
}

// 7.3. Кэширование запросов
const requestCache = new Map();

async function cachedFetch(url) {
    if (requestCache.has(url)) {
        console.log(`[cache] hit: ${url}`);
        return requestCache.get(url);
    }
    console.log(`[cache] miss: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    requestCache.set(url, data);
    return data;
}

async function cacheRequestsDemo() {
    const output = document.getElementById('scenario-output');
    output.textContent = 'Реальные сценарии: кэширование запросов...';
    output.className = 'output';

    const url = `${API_BASE}/users`;
    try {
        const start1 = performance.now();
        const data1 = await cachedFetch(url);
        const t1 = Math.round(performance.now() - start1);

        const start2 = performance.now();
        const data2 = await cachedFetch(url);
        const t2 = Math.round(performance.now() - start2);

        output.textContent =
            `Реальные сценарии: кэширование\n` +
            `1-й запрос: ${t1} мс (${data1.length} записей)\n` +
            `2-й запрос: ${t2} мс (из кэша)\n` +
            `Ускорение: ${(t1 / Math.max(t2, 1)).toFixed(1)}x`;
        output.className = 'output success';
    } catch (error) {
        output.textContent = `Реальные сценарии: ошибка — ${error.message}`;
        output.className = 'output error';
    }
}

// Настройка обработчиков сценариев
function setupScenarioEvents() {
    document.getElementById('sequential-requests')
        .addEventListener('click', sequentialRequests);
    document.getElementById('upload-simulation')
        .addEventListener('click', uploadSimulation);
    document.getElementById('cache-requests')
        .addEventListener('click', cacheRequestsDemo);
}

// ИНИЦИАЛИЗАЦИЯ

document.addEventListener('DOMContentLoaded', () => {
    setupPromiseEvents();
    setupAsyncEvents();
    setupApiEvents();
    setupTimerEvents();
    setupErrorEvents();
    setupParallelEvents();
    setupScenarioEvents();

    console.log('✅Все обработчики асинхронных операций подключены');
});