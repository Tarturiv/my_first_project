1\. Разница между Promise.then().catch() и async/await с try/catch. Когда что использовать?

Синтаксическая разница

javascript

// Промисы

fetchUsers()

&#x20;   .then(users => fetchPosts(users\[0].id))

&#x20;   .then(posts => console.log(posts))

&#x20;   .catch(err => console.error(err));



// async/await

async function load() {

&#x20;   try {

&#x20;       const users = await fetchUsers();

&#x20;       const posts = await fetchPosts(users\[0].id);

&#x20;       console.log(posts);

&#x20;   } catch (err) {

&#x20;       console.error(err);

&#x20;   }

}

Функциональные отличия

Критерий	.then().catch()	async/await + try/catch

Читаемость	Цепочка, труднее при вложенности	Линейный код, как синхронный

Перехват ошибок	Только reject промиса	И reject, и синхронные исключения в try

Отладка	Стек-трейс может терять кадры	Стек сохраняется лучше

Возврат значения	Всегда промис	Всегда промис (функция async)

Комбинирование	Удобно для Promise.all, race	Удобно для последовательных await

Условия/циклы	Неудобно	Естественно (if, for, while)

Гонки и таймауты	Promise.race напрямую	await Promise.race

Когда что использовать

async/await:



последовательные операции с зависимостями (await user → await posts);



сложная логика: циклы, условия, ранние return;



когда нужен единый try/catch на несколько операций.



.then().catch():



функция должна вернуть промис без объявления async (например, в обработчике события);



короткая цепочка из 1–2 шагов;



комбинирование (Promise.all(\[...]).then(...));



когда нужен .finally() в явном виде.



Правило: внутри async-функции — await; снаружи — .then(). Не смешивайте в одном выражении (await fetch().then(...) — антипаттерн).



2\. Как работает Promise.all и что будет при ошибке одного промиса?

Принцип работы

javascript

const results = await Promise.all(\[p1, p2, p3]);

Все промисы стартуют одновременно (параллельно).



await ждёт все промисы.



Результат — массив значений в том же порядке, что и входной массив (не в порядке завершения!).



Время ожидания ≈ самый долгий промис, а не сумма.



Поведение при ошибке

Первая ошибка «роняет» весь Promise.all:



javascript

Promise.all(\[

&#x20;   Promise.resolve('A'),

&#x20;   Promise.reject(new Error('B упал')),

&#x20;   new Promise(r => setTimeout(() => r('C'), 1000))

])

&#x20;   .then(console.log)               // НЕ выполнится

&#x20;   .catch(err => console.error(err.message)); // "B упал" — сразу

.catch() срабатывает немедленно после первого reject.



Остальные промисы продолжают выполняться, но их результаты отбрасываются.



Если нужно «всё или ничего» — это то, что надо. Если нет — используйте Promise.allSettled.



Обходной приём

Если ошибки нужно «изолировать»:



javascript

const safe = p => p.then(

&#x20;   value => ({ ok: true, value }),

&#x20;   error => ({ ok: false, error })

);

const results = await Promise.all(\[safe(p1), safe(p2), safe(p3)]);

3\. Разница между Promise.all, Promise.race, Promise.allSettled. Практические примеры

Метод	Ждёт	Результат	При ошибке

all	все	массив значений	реджект сразу

race	первый завершившийся	значение/ошибка первого	реджект, если первый — ошибка

allSettled	все	массив {status, value/reason}	никогда не реджектится

Promise.all — «всё или ничего»

Пример: загрузка данных для страницы, без которых она не имеет смысла.



javascript

const \[user, settings, notifications] = await Promise.all(\[

&#x20;   api.getUser(),

&#x20;   api.getSettings(),

&#x20;   api.getNotifications()

]);

renderPage(user, settings, notifications);

Promise.race — «кто первый»

Пример 1: таймаут запроса



javascript

const data = await Promise.race(\[

&#x20;   fetch('/api/slow'),

&#x20;   new Promise((\_, reject) =>

&#x20;       setTimeout(() => reject(new Error('Timeout')), 5000)

&#x20;   )

]);

Пример 2: несколько зеркал API — берём самый быстрый ответ



javascript

const data = await Promise.race(\[

&#x20;   fetch('https://cdn1.example.com/data.json'),

&#x20;   fetch('https://cdn2.example.com/data.json'),

&#x20;   fetch('https://cdn3.example.com/data.json')

]);

Promise.allSettled — «все, независимо от исхода»

Пример: загрузка 10 файлов, где часть может отсутствовать.



javascript

const results = await Promise.allSettled(

&#x20;   files.map(f => uploadFile(f))

);



const uploaded = results.filter(r => r.status === 'fulfilled');

const failed = results.filter(r => r.status === 'rejected');



showReport(`Загружено: ${uploaded.length}, ошибок: ${failed.length}`);

failed.forEach(r => console.warn(r.reason.message));

Пример 2: опрос нескольких сервисов и показ доступных



javascript

const checks = await Promise.allSettled(\[

&#x20;   fetch('/health/db'),

&#x20;   fetch('/health/cache'),

&#x20;   fetch('/health/queue')

]);

Ещё: Promise.any — «первый успешный»

Пример: резервные CDN. Отличается от race тем, что ошибки игнорируются, пока есть шанс на успех.



javascript

const data = await Promise.any(\[

&#x20;   fetch('https://primary.example.com/api'),

&#x20;   fetch('https://backup.example.com/api')

]);

4\. Retry-логика с экспоненциальной задержкой

Базовая реализация

javascript

async function retry(fn, { attempts = 5, baseDelay = 500, maxDelay = 8000 } = {}) {

&#x20;   let lastError;



&#x20;   for (let i = 0; i < attempts; i++) {

&#x20;       try {

&#x20;           return await fn();

&#x20;       } catch (error) {

&#x20;           lastError = error;



&#x20;           // Не ретраим бессмысленные ошибки

&#x20;           if (error.status \&\& error.status < 500 \&\& error.status !== 429) {

&#x20;               throw error;

&#x20;           }



&#x20;           if (i === attempts - 1) break;



&#x20;           // Экспоненциальная задержка: 500, 1000, 2000, 4000 мс

&#x20;           const delay = Math.min(baseDelay \* 2 \*\* i, maxDelay);



&#x20;           // Джиттер (случайность) — чтобы клиенты не били по серверу синхронно

&#x20;           const jitter = Math.random() \* delay \* 0.3;



&#x20;           console.warn(

&#x20;               `Попытка ${i + 1}/${attempts} не удалась: ${error.message}. ` +

&#x20;               `Повтор через ${Math.round(delay + jitter)} мс`

&#x20;           );

&#x20;           await new Promise(r => setTimeout(r, delay + jitter));

&#x20;       }

&#x20;   }



&#x20;   throw lastError;

}

Использование

javascript

const data = await retry(() => fetch('/api/users').then(r => {

&#x20;   if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status });

&#x20;   return r.json();

}));

Ключевые принципы

Экспоненциальная задержка — baseDelay \* 2^i: снижает нагрузку на «больной» сервер.



Ограничение сверху (maxDelay) — чтобы задержка не выросла до минут.



Джиттер — рандомизация, чтобы тысячи клиентов не ретраили синхронно (thundering herd).



Фильтр ошибок — нет смысла ретраить 400 Bad Request; ретраить стоит 5xx, 429, сетевые сбои.



Retry-After — если сервер прислал заголовок Retry-After (для 429/503), используйте его значение.



Идемпотентность — ретраить безопасно только GET, PUT, DELETE; POST может создать дубль.



Готовая библиотека

В реальных проектах часто используют p-retry (npm), axios-retry, got со встроенным retry:



javascript

import pRetry from 'p-retry';

const data = await pRetry(fetchData, { retries: 5, minTimeout: 500 });

5\. Race condition в асинхронном коде и как его избежать

Что это

Состояние гонки — ситуация, когда результат зависит от порядка выполнения асинхронных операций, который непредсказуем. Особенно часто — при работе с общим состоянием (DOM, переменные, БД).



Пример 1: устаревший ответ «затирает» свежий (UI)

javascript

// Поиск: пользователь быстро печатает "a", "ab", "abc"

input.addEventListener('input', async (e) => {

&#x20;   const results = await fetch(`/search?q=${e.target.value}`);

&#x20;   renderResults(await results.json());  // ⚠️ может прийти ответ на "a" ПОСЛЕ "abc"

});

Симптом: в поле «abc», а список — от «a».



Решение 1 — AbortController (отмена предыдущего запроса):



javascript

let controller = null;



input.addEventListener('input', async (e) => {

&#x20;   controller?.abort();

&#x20;   controller = new AbortController();



&#x20;   try {

&#x20;       const res = await fetch(`/search?q=${e.target.value}`, {

&#x20;           signal: controller.signal

&#x20;       });

&#x20;       renderResults(await res.json());

&#x20;   } catch (err) {

&#x20;       if (err.name !== 'AbortError') throw err;

&#x20;   }

});

Решение 2 — проверка актуальности (токен/версия):



javascript

let requestId = 0;



input.addEventListener('input', async (e) => {

&#x20;   const myId = ++requestId;

&#x20;   const res = await fetch(`/search?q=${e.target.value}`);

&#x20;   const data = await res.json();

&#x20;   if (myId === requestId) renderResults(data);  // только последний ответ

});

Пример 2: параллельная запись счётчика

javascript

let balance = 100;



async function withdraw(amount) {

&#x20;   const current = balance;         // прочитали 100

&#x20;   await delay(100);                // что-то делаем

&#x20;   balance = current - amount;      // записали 100 - 30 = 70

}



await Promise.all(\[withdraw(30), withdraw(50)]);

// Ожидалось 20, получилось 70 или 50 — в зависимости от порядка

Решение — сериализация через очередь или мьютекс:



javascript

let queue = Promise.resolve();



function withLock(fn) {

&#x20;   const result = queue.then(fn);

&#x20;   queue = result.catch(() => {});  // ошибка не блокирует очередь

&#x20;   return result;

}



await withLock(() => withdraw(30));

await withLock(() => withdraw(50));

Пример 3: проверка перед установкой (check-then-act)

javascript

// ❌ Между проверкой и созданием может вклиниться другой вызов

if (!users\[name]) {

&#x20;   await createUser(name);

}

Решение: на сервере — уникальный индекс + обработка 409 Conflict; на клиенте — идемпотентный PUT или upsert.



Общие правила

Отменяйте устаревшие запросы (AbortController).



Используйте токены/версии для проверки актуальности ответа.



Сериализуйте доступ к общему состоянию (очередь, async-mutex).



Идемпотентность — операции должны быть безопасны при повторном вызове.



Не полагайтесь на порядок Promise.all — используйте индексы/ключи.



6\. Кэширование результатов асинхронных запросов и стратегии

Уровни кэширования

Уровень	Инструмент	Что кэширует

Память (in-memory)	Map, объект	Результаты в рамках сессии

Браузер (HTTP)	Cache-Control, ETag	Ответы сервера

Service Worker	Cache API	Запросы, ассеты (offline)

localStorage / IndexedDB	Web Storage	Данные между сессиями

Сервер / CDN	Redis, Varnish	Общий кэш для всех клиентов

Стратегия 1: In-memory cache (простое)

javascript

const cache = new Map();



async function cachedFetch(url) {

&#x20;   if (cache.has(url)) return cache.get(url);

&#x20;   const data = await fetch(url).then(r => r.json());

&#x20;   cache.set(url, data);

&#x20;   return data;

}

Минусы: нет TTL, нет инвалидации, растёт память, «залипает» при обновлении данных.



Стратегия 2: TTL-кэш

javascript

const cache = new Map();  // url → { data, expiresAt }



async function cachedFetch(url, ttlMs = 60\_000) {

&#x20;   const now = Date.now();

&#x20;   const hit = cache.get(url);



&#x20;   if (hit \&\& hit.expiresAt > now) {

&#x20;       return hit.data;

&#x20;   }



&#x20;   const data = await fetch(url).then(r => r.json());

&#x20;   cache.set(url, { data, expiresAt: now + ttlMs });

&#x20;   return data;

}

Стратегия 3: Stale-While-Revalidate (SWR)

Отдать «старое» сразу, параллельно обновить в фоне:



javascript

async function swrFetch(url) {

&#x20;   const hit = cache.get(url);



&#x20;   // 1. Немедленно отдаём кэш, если есть

&#x20;   if (hit) {

&#x20;       // Фон: обновляем кэш и, при необходимости, уведомляем

&#x20;       fetch(url).then(r => r.json()).then(data => {

&#x20;           cache.set(url, data);

&#x20;           notify(url, data);

&#x20;       }).catch(() => {});

&#x20;       return hit;

&#x20;   }



&#x20;   // 2. Кэша нет — ждём первый запрос

&#x20;   const data = await fetch(url).then(r => r.json());

&#x20;   cache.set(url, data);

&#x20;   return data;

}

Именно так работают SWR и React Query (TanStack Query).



Стратегия 4: Дедупликация одновременных запросов (in-flight)

Если 5 компонентов одновременно запрашивают тот же ресурс — сделать один запрос:



javascript

const inflight = new Map();



function dedupedFetch(url) {

&#x20;   if (inflight.has(url)) return inflight.get(url);



&#x20;   const promise = fetch(url)

&#x20;       .then(r => r.json())

&#x20;       .finally(() => inflight.delete(url));



&#x20;   inflight.set(url, promise);

&#x20;   return promise;

}

Стратегия 5: HTTP-кэширование (правильный бэкенд)

Cache-Control: max-age=3600, public — кэшировать на час.



ETag + If-None-Match — сервер отвечает 304 Not Modified, экономя трафик.



Last-Modified + If-Modified-Since — аналогично по времени.



Стратегия 6: Инвалидация по ключам

javascript

function invalidate(pattern) {

&#x20;   for (const key of cache.keys()) {

&#x20;       if (key.includes(pattern)) cache.delete(key);

&#x20;   }

}



// После POST на /posts — сбросить список постов

await createPost();

invalidate('/posts');

Стратегия 7: Persist (localStorage / IndexedDB)

Для офлайн-режима: кэш в localStorage (до \~5 МБ) или IndexedDB (гигабайты). Service Worker перехватывает запросы и отдаёт из Cache API.



Сравнение стратегий

Стратегия	Скорость	Свежесть	Сложность	Когда

In-memory	★★★	★	★	Дорогие чистые вычисления

TTL	★★★	★★	★★	Данные редко меняются

SWR	★★★	★★★	★★★	Списки, дашборды

Дедупликация	★★★	★★★	★★	Много компонентов

HTTP-кэш	★★★	★★	★	Правильный API

Итого: в реальном проекте комбинируют несколько уровней — HTTP-кэш + in-flight-дедупликация + SWR + инвалидация после мутаций.



7\. Методы оптимизации производительности множественных асинхронных операций

7.1. Параллельность там, где нет зависимостей

javascript

// ❌ Медленно: 3 × 300 = 900 мс

const a = await fetchA();

const b = await fetchB();

const c = await fetchC();



// ✅ Быстро: \~300 мс

const \[a, b, c] = await Promise.all(\[fetchA(), fetchB(), fetchC()]);

Зависимости — только там, где они есть:



javascript

const user = await fetchUser();

const \[posts, friends] = await Promise.all(\[

&#x20;   fetchPosts(user.id),

&#x20;   fetchFriends(user.id)

]);

7.2. Ограничение параллельности (concurrency limit)

1000 запросов одновременно положат браузер и сервер. Нужно ограничивать:



javascript

async function pool(tasks, limit = 5) {

&#x20;   const results = new Array(tasks.length);

&#x20;   let next = 0;



&#x20;   async function worker() {

&#x20;       while (next < tasks.length) {

&#x20;           const i = next++;

&#x20;           results\[i] = await tasks\[i]();

&#x20;       }

&#x20;   }



&#x20;   await Promise.all(Array.from({ length: limit }, worker));

&#x20;   return results;

}

Или p-limit:



javascript

import pLimit from 'p-limit';

const limit = pLimit(5);

await Promise.all(urls.map(url => limit(() => fetch(url))));

7.3. Promise.all vs for await — зависит от сценария

Независимые операции — Promise.all (параллельно).



Зависимые или тяжёлые (нагрузка на CPU/сеть) — for await (последовательно).



7.4. Кэширование и дедупликация

См. вопрос 6. Один запрос вместо N — самое эффективное ускорение.



7.5. Пагинация и бесконечный скролл

Не грузите 10 000 записей сразу. Загружайте по 20–50 по мере прокрутки (IntersectionObserver).



7.6. Отмена устаревших запросов

AbortController (см. вопрос 5) экономит трафик и CPU при быстром вводе/навигации.



7.7. Ленивая загрузка (lazy loading)

javascript

// Код и данные — только когда нужны

button.addEventListener('click', async () => {

&#x20;   const { Chart } = await import('./chart.js');

&#x20;   new Chart(...);

});

7.8. Батчинг запросов

Вместо 100 отдельных GET /user/1, GET /user/2… — один GET /users?ids=1,2,...,100. Такой API часто называют DataLoader (см. GraphQL-экосистему).



7.9. Приоритизация

Критичные данные — сразу (fetch с высоким приоритетом).



Не критичные — в requestIdleCallback или после load.



Браузерный fetch не поддерживает приоритет напрямую, но link rel="preload" помогает.



7.10. Стриминг

Для больших ответов — response.body.getReader() и обработка по частям, а не response.json() (ждёт весь ответ).



7.11. Web Workers

Тяжёлая обработка данных — в отдельный поток, чтобы не блокировать UI:



javascript

const worker = new Worker('worker.js');

worker.postMessage(data);

worker.onmessage = (e) => render(e.data);

7.12. performance.now() и профилирование

Измеряйте, а не гадайте:



javascript

const t0 = performance.now();

await doStuff();

console.log(`doStuff: ${performance.now() - t0} мс`);

В DevTools → Performance — flame chart с реальными таймингами.



8\. Обработка ошибок в цепочках промисов и предотвращение «проглатывания»

Что такое «проглатывание» ошибок

Ошибка возникла, но нигде не обработана — приложение «молчит», пользователь видит пустой экран или загрузку навсегда.



Причины

1\. catch в середине цепочки возвращает undefined:



javascript

fetch(url)

&#x20;   .then(r => r.json())

&#x20;   .catch(err => console.log(err))   // ⚠️ вернул undefined

&#x20;   .then(data => data.users)         // TypeError: cannot read 'users' of undefined

Ошибка «ушла», но появилась новая — из-за undefined. Решение — пробрасывать (throw) или явно возвращать fallback:



javascript

.catch(err => {

&#x20;   console.error(err);

&#x20;   throw err;  // пробрасываем дальше

})

// или

.catch(err => ({ users: \[] }))  // fallback

2\. Забыт .catch вообще:



javascript

fetch(url).then(r => r.json());  // unhandled rejection в консоли

3\. async-функция без try/catch внутри и без .catch снаружи:



javascript

async function load() {

&#x20;   const data = await fetch(url).then(r => r.json());  // если упадёт — промис реджектится

}

load();  // ❌ никакого .catch → unhandled rejection

4\. Ошибка в setTimeout/setInterval/обработчике события не связана с промисом — её нужно перехватывать отдельно.



5\. forEach(async ...): промисы теряются.



javascript

items.forEach(async item => await process(item));  // ошибки не перехватятся

// ✅

await Promise.all(items.map(item => process(item)));

6\. Promise.all при ошибке теряет остальные результаты — см. allSettled.



Правильные практики

1\. Всегда есть финальный .catch или try/catch:



javascript

loadData().catch(handleFatalError);

2\. Централизованный обработчик:



javascript

window.addEventListener('unhandledrejection', (e) => {

&#x20;   console.error('Unhandled:', e.reason);

&#x20;   // отправить в Sentry / логирование

&#x20;   e.preventDefault();

});

3\. Именованные функции вместо анонимных — понятнее в стек-трейсе:



javascript

.then(transformUser)       // лучше, чем .then(u => ({ ...u, id: u.id }))

4\. Конвертация «сырых» reject в Error с контекстом:



javascript

.catch(err => {

&#x20;   throw new Error(`Не удалось загрузить пользователя ${id}`, { cause: err });

});

5\. finally для очистки ресурсов — не заменяет catch:



javascript

loading = true;

try {

&#x20;   await load();

} finally {

&#x20;   loading = false;

}

6\. Не «глотать» ошибку молча:



javascript

.catch(() => {})                    // ❌

.catch(err => console.warn(err))    // ✅

7\. Promise.allSettled для «все должны выполниться» + явный разбор:



javascript

const results = await Promise.allSettled(tasks);

results.forEach((r, i) => {

&#x20;   if (r.status === 'rejected') logError(i, r.reason);

});

8\. Глобальный error boundary (React) / window.onerror — для непредвиденных случаев в UI.



9\. Преимущества async/await перед промисами и колбэками

По сравнению с колбэками

Колбэки	async/await

«Callback hell» — пирамида вложенности	Плоский линейный код

Ошибки теряются (try/catch не работает)	try/catch работает

Управление потоком вручную	await / for / if

Нет стандартного способа вернуть значение	return работает как обычно

Сложно комбинировать параллельность	Promise.all + await

По сравнению с промисами

1\. Читаемость:



javascript

// Промисы

getUser()

&#x20;   .then(u => getPosts(u.id))

&#x20;   .then(p => getComments(p\[0].id))

&#x20;   .then(c => render(c))

&#x20;   .catch(handleError);



// async/await

async function load() {

&#x20;   try {

&#x20;       const u = await getUser();

&#x20;       const p = await getPosts(u.id);

&#x20;       const c = await getComments(p\[0].id);

&#x20;       render(c);

&#x20;   } catch (e) {

&#x20;       handleError(e);

&#x20;   }

}

2\. Единый механизм ошибок — try/catch ловит и reject, и синхронные исключения. С промисами: .catch() после .then() — но синхронная ошибка внутри .then тоже перехватывается; разница — в явности и читаемости.



3\. Отладка — точка останова на await показывает полный стек с переменными (как в синхронном коде). В цепочке .then стрелки стека могут быть «разорваны».



4\. Условная логика:



javascript

// Промисы — громоздко

getData()

&#x20;   .then(d => d.cached ? d.cached : fetchFresh())

&#x20;   .then(...)



// async/await — естественно

async function load() {

&#x20;   const d = await getData();

&#x20;   return d.cached ? d.cached : await fetchFresh();

}

5\. Циклы:



javascript

for (const id of ids) {

&#x20;   await process(id);        // ждём каждую

}

// или

await Promise.all(ids.map(process));  // параллельно

6\. Ранний выход (return, throw) работает как в синхронном коде.



Ограничения async/await (честный взгляд)

Каждый await — точка паузы. Легко случайно сделать последовательным то, что должно быть параллельным:



javascript

// ❌ 3 × время

const a = await fetchA();

const b = await fetchB();

const c = await fetchC();



// ✅ параллельно

const \[a, b, c] = await Promise.all(\[fetchA(), fetchB(), fetchC()]);

Нельзя использовать в не-async функциях. В обработчиках событий — либо async, либо .then().



await в forEach не работает (см. вопрос 5).



top-level await — только в ES-модулях (не в обычных скриптах).



Вывод

async/await — синтаксический сахар над промисами. Под капотом — те же промисы, но читается как синхронный код. Используйте async/await по умолчанию; .then() — когда нужна компактность или функция не может быть async. Колбэки — только для старых API (события, setTimeout).



10\. Отладка асинхронного кода: инструменты и приёмы

Инструменты DevTools

1\. Console — базовое логирование

javascript

console.log('start');

console.time('fetch');       // запустить таймер

await fetch(url);

console.timeEnd('fetch');    // вывести время

console.table(arrayOfObjects);  // таблица для массивов объектов

console.group('Запросы');       // группировка

console.groupEnd();

console.trace('Где это?');      // стек вызовов

console.assert — логирует только при false:



javascript

console.assert(user.id, 'user.id отсутствует', user);

2\. Sources → Breakpoints — точки останова

Обычный breakpoint — на строке.



debugger; в коде — остановит выполнение (не забудьте убрать перед релизом).



Conditional breakpoint — сработает при условии user.id === 42.



XHR/fetch breakpoints — остановка на конкретном URL запроса (вкладка Network).



Event listener breakpoints — на click, load и т.п.



DOM breakpoints — на изменение элемента.



3\. Call Stack — стек вызовов

При остановке на await в стеке видно всю цепочку вызовов. Это главное преимущество async/await перед .then() — в промисах кадры стека могут быть потеряны.



4\. Async Stack Traces (включено по умолчанию в Chrome)

DevTools показывает не только текущий стек, но и асинхронные «родители»:



text

loadUser

&#x20; ↓ (async)

fetchData

&#x20; ↓ (await)

response.json

5\. Network — мониторинг запросов

Timing — сколько занял DNS, TCP, TTFB, download.



Waterfall — видно, какие запросы шли параллельно, а какие последовательно (если «лесенкой» — можно оптимизировать).



Filter: XHR/Fetch — только API-запросы.



Preserve log — не очищать лог при навигации.



Throttling — симуляция медленного 3G.



6\. Performance — профилирование

Flame chart — где тратится время.



Main thread — блокировки JS.



Async call stacks — видно, что было запущено и когда.



Bottom-Up / Call Tree — агрегированные отчёты.



Long Tasks (>50 мс) — красные метки; это места, где UI «фризит».



7\. Memory — утечки

Heap snapshot — снимок памяти.



Allocation timeline — что и когда аллоцировалось.



Detached DOM nodes — «осиротевшие» элементы (часто из-за незакрытых таймеров/подписок).



8\. Application — Storage

localStorage, sessionStorage, IndexedDB, Cache Storage, Service Workers, cookies — проверка, что закэшировалось.



Приёмы отладки

1\. console.trace() — где это?

javascript

function processData(data) {

&#x20;   console.trace('processData вызван с', data);

}

Покажет полный стек в консоли — идеально, чтобы найти, кто вызвал функцию.



2\. Логирование времени

javascript

const t0 = performance.now();

await heavyOperation();

console.log(`heavyOperation: ${(performance.now() - t0).toFixed(2)} мс`);

3\. Performance marks — точные замеры

javascript

performance.mark('load-start');

await loadData();

performance.mark('load-end');

performance.measure('load', 'load-start', 'load-end');

console.log(performance.getEntriesByName('load')\[0].duration);

4\. Отладка unhandledrejection

javascript

window.addEventListener('unhandledrejection', (e) => {

&#x20;   console.error('Необработанный reject:', e.reason);

&#x20;   debugger;  // остановка для инспекции

});

5\. Тестирование таймаутов и задержек

Network throttling в DevTools (Slow 3G) — увидеть, как ведёт себя UI.



await delay(10000) в коде — воспроизвести медленный ответ.



DevTools → Network → Offline — проверить обработку сетевых ошибок.



6\. Отладка гонок

Логи с временными метками:



javascript

console.log(`${performance.now().toFixed(0)}ms: request ${id} started`);

// ...

console.log(`${performance.now().toFixed(0)}ms: request ${id} finished`);

AbortController — и проверка, что отмена срабатывает.



Conditional breakpoint на render() с условием data.id !== expectedId — поймать устаревший ответ.



7\. Тесты — тоже отладка

Юнит-тесты с fake timers (Jest/Vitest):



javascript

vi.useFakeTimers();

const promise = delayWithPromise(1000);

vi.advanceTimersByTime(1000);

await expect(promise).resolves.toBeUndefined();

msw (Mock Service Worker) — моки API для тестов, включая ошибки и задержки.



8\. Асинхронный код в Node.js

\--inspect + Chrome DevTools:



bash

node --inspect-brk app.js

async\_hooks — для сложной диагностики (трекинг асинхронных операций).



process.on('unhandledRejection', ...) — глобальный обработчик.

