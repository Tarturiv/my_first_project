\---



\## Задача 1. Базовые обработчики событий



\*\*Что реализовано:\*\*



| Событие | Элемент | Действие |

|---------|---------|----------|

| `click` | `#basic-btn` | Меняет текст в `#basic-output` |

| `mouseenter` | `#color-box` | Меняет фон и текст |

| `mouseleave` | `#color-box` | Возвращает исходный фон |

| `mousemove` | `#color-box` | Выводит координаты `offsetX` / `offsetY` в `#mouse-output` |



\*\*Ключевой фрагмент:\*\*



```javascript

basicBtn.addEventListener('click', () => {

&#x20;   basicOutput.textContent = 'Статус: кнопка нажата!';

});



colorBox.addEventListener('mousemove', (event) => {

&#x20;   mouseOutput.textContent = `Координаты мыши: X=${event.offsetX}, Y=${event.offsetY}`;

});

```

Вывод: для каждого типа события — свой обработчик; объект события позволяет получить дополнительные данные (offsetX, offsetY, target и др.).



Задача 2. События клавиатуры

Что реализовано:



Обработчик keydown на #key-input.



Вывод event.key и event.code в #key-output.



Распознавание комбинаций Ctrl+S, Alt+C, Shift+A.



Для Ctrl+S вызывается event.preventDefault() (блокирует стандартное сохранение страницы).



Ключевой фрагмент:



```javascript

keyInput.addEventListener('keydown', (event) => {

&#x20;   keyOutput.textContent = `Нажата: "${event.key}" (code: ${event.code})`;



&#x20;   if (event.ctrlKey \&\& event.key.toLowerCase() === 's') {

&#x20;       event.preventDefault();

&#x20;       keyOutput.textContent = 'Обнаружена комбинация: Ctrl + S';

&#x20;   }

&#x20;   // аналогично для Alt+C и Shift+A

});

```

Особенности:



event.key — символ с учётом раскладки и Shift;



event.code — физическая клавиша (не зависит от раскладки);



модификаторы: ctrlKey, altKey, shiftKey, metaKey.



Задача 3. Делегирование событий

Что реализовано:



Один обработчик click навешан на контейнер #item-list.



Клик по .delete — удаляет родительский .item.



Клик по .item — показывает data-id через alert().



Кнопка «Добавить элемент» создаёт новый .item (демонстрация, что обработчик работает и для новых элементов).



Ключевой фрагмент:



```javascript

itemList.addEventListener('click', (event) => {

&#x20;   const deleteBtn = event.target.closest('.delete');

&#x20;   if (deleteBtn) {

&#x20;       deleteBtn.closest('.item')?.remove();

&#x20;       return;

&#x20;   }

&#x20;   const item = event.target.closest('.item');

&#x20;   if (item) alert(`Выбран элемент с data-id = ${item.dataset.id}`);

});

```

Почему это делегирование:



Вместо 395 обработчиков — один на контейнере.



Работает для динамически добавленных элементов.



Меньше потребление памяти, проще поддерживать.



Преимущества:



Производительность (один слушатель вместо N).



Автоматическая поддержка новых элементов.



Упрощение кода при удалении/добавлении.



Задача 4. Предотвращение поведения

Что реализовано:



Клик по ссылке #prevent-link → event.preventDefault() → перехода нет.



Отправка формы #prevent-form → event.preventDefault() → страница не перезагружается.



Результат выводится в #prevention-output.



Ключевой фрагмент:



```javascript

preventLink.addEventListener('click', (event) => {

&#x20;   event.preventDefault();

&#x20;   preventionOutput.textContent = 'Переход по ссылке заблокирован';

});



preventForm.addEventListener('submit', (event) => {

&#x20;   event.preventDefault();

&#x20;   preventionOutput.textContent = 'Отправка формы заблокирована';

});

```

Разница:



Метод	Что делает

preventDefault()	Отменяет стандартное поведение браузера (переход, отправку формы)

stopPropagation()	Останавливает всплытие события

stopImmediatePropagation()	Останавливает всплытие и другие обработчики на том же элементе

return false	Работает только в jQuery / inline-обработчиках (делает и то, и другое)

Задача 5. Кастомные события

Что реализовано:



Создано событие myCustomEvent через new CustomEvent() с полем detail.



Кнопка #trigger-custom вызывает document.dispatchEvent(myCustomEvent).



Кнопка #multiple-listeners добавляет три дополнительных обработчика.



Каждый обработчик пишет в #custom-output и в консоль.



Ключевой фрагмент:



```javascript

const myCustomEvent = new CustomEvent('myCustomEvent', {

&#x20;   detail: { message: 'Привет из кастомного события!', timestamp: Date.now() },

&#x20;   bubbles: true

});



document.addEventListener('myCustomEvent', (event) => {

&#x20;   customOutput.textContent = `Событие получено: ${event.detail.message}`;

});



triggerCustom.addEventListener('click', () => {

&#x20;   document.dispatchEvent(myCustomEvent);

});

```

Особенности:



detail — произвольные данные, передаваемые с событием.



bubbles: true — событие всплывает от элемента к document.



dispatchEvent() — запуск события вручную.



На одно событие можно навешать сколько угодно обработчиков — все они сработают.



Асинхронные события (дополнительно)

В работе упоминаются асинхронные события — это, например:



setTimeout / setInterval;



Promise и async/await;



requestAnimationFrame;



события загрузки (load, DOMContentLoaded);



пользовательские события, эмитируемые из fetch/setTimeout.



Пример:



```javascript

setTimeout(() => {

&#x20;   document.dispatchEvent(new CustomEvent('dataLoaded', {

&#x20;       detail: { items: \[1, 2, 3] }

&#x20;   }));

}, 1000);



document.addEventListener('dataLoaded', (e) => {

&#x20;   console.log('Данные получены:', e.detail.items);

});

```

