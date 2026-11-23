'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /*ЗАДАЧА 1: Базовые обработчики событий*/
    const basicBtn = document.getElementById('basic-btn');
    const basicOutput = document.getElementById('basic-output');
    const colorBox = document.getElementById('color-box');
    const mouseOutput = document.getElementById('mouse-output');

    // click
    basicBtn.addEventListener('click', () => {
        basicOutput.textContent = 'Статус: кнопка нажата!';
    });

    // mouseenter / mouseleave
    colorBox.addEventListener('mouseenter', () => {
        colorBox.style.background = '#fca5a5';
        colorBox.textContent = 'Курсор внутри';
    });
    colorBox.addEventListener('mouseleave', () => {
        colorBox.style.background = '#cbd5e1';
        colorBox.textContent = 'Наведи курсор';
    });

    // mousemove — координаты
    colorBox.addEventListener('mousemove', (event) => {
        mouseOutput.textContent = `Координаты мыши: X=${event.offsetX}, Y=${event.offsetY}`;
    });


    /*ЗАДАЧА 2: События клавиатуры*/
    const keyInput = document.getElementById('key-input');
    const keyOutput = document.getElementById('key-output');

    keyInput.addEventListener('keydown', (event) => {
        keyOutput.textContent = `Нажата: "${event.key}" (code: ${event.code})`;

        // Комбинации клавиш
        if (event.ctrlKey && event.key.toLowerCase() === 's') {
            event.preventDefault(); // блокируем сохранение страницы
            keyOutput.textContent = 'Обнаружена комбинация: Ctrl + S';
        }
        if (event.altKey && event.key.toLowerCase() === 'c') {
            event.preventDefault();
            keyOutput.textContent = 'Обнаружена комбинация: Alt + C';
        }
        if (event.shiftKey && event.key.toLowerCase() === 'a') {
            keyOutput.textContent = 'Обнаружена комбинация: Shift + A';
        }
    });


    /*ЗАДАЧА 3: Делегирование событий*/
    const itemList = document.getElementById('item-list');
    const addItemBtn = document.getElementById('add-item-btn');

    // Делегирование: один обработчик на контейнер
    itemList.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.delete');
        if (deleteBtn) {
            const item = deleteBtn.closest('.item');
            if (item) item.remove();
            return;
        }

        const item = event.target.closest('.item');
        if (item) {
            alert(`Выбран элемент с data-id = ${item.dataset.id}`);
        }
    });

    // Динамическое добавление элементов
    let nextId = 11;
    addItemBtn.addEventListener('click', () => {
        const newItem = document.createElement('div');
        newItem.className = 'item';
        newItem.dataset.id = nextId;
        newItem.innerHTML = `Элемент ${nextId} <span class="delete">x</span>`;
        itemList.appendChild(newItem);
        nextId++;
    });


    /*ЗАДАЧА 4: Предотвращение поведения*/
    const preventLink = document.getElementById('prevent-link');
    const preventForm = document.getElementById('prevent-form');
    const preventionOutput = document.getElementById('prevention-output');

    // Блокируем переход по ссылке
    preventLink.addEventListener('click', (event) => {
        event.preventDefault();
        preventionOutput.textContent = 'Переход по ссылке заблокирован (preventDefault)';
    });

    // Блокируем отправку формы
    preventForm.addEventListener('submit', (event) => {
        event.preventDefault();
        preventionOutput.textContent = 'Отправка формы заблокирована (preventDefault)';
    });


    /*ЗАДАЧА 5: Кастомные события*/
    const triggerCustom = document.getElementById('trigger-custom');
    const multipleListeners = document.getElementById('multiple-listeners');
    const customOutput = document.getElementById('custom-output');

    // Создаём кастомное событие
    const myCustomEvent = new CustomEvent('myCustomEvent', {
        detail: { message: 'Привет из кастомного события!', timestamp: Date.now() },
        bubbles: true
    });

    // Обработчик-1
    document.addEventListener('myCustomEvent', (event) => {
        customOutput.textContent = `Событие получено: ${event.detail.message}`;
        console.log('Обработчик 1:', event.detail);
    });

    // Кнопка запуска
    triggerCustom.addEventListener('click', () => {
        document.dispatchEvent(myCustomEvent);
    });

    // Добавление нескольких обработчиков
    multipleListeners.addEventListener('click', () => {
        let count = 0;

        const handler = (event) => {
            count++;
            customOutput.textContent = `Сработало обработчиков: ${count} (сообщение: ${event.detail.message})`;
            console.log(`Дополнительный обработчик №${count}`, event.detail);
        };

        // Добавляем 3 обработчика
        document.addEventListener('myCustomEvent', handler);
        document.addEventListener('myCustomEvent', handler);
        document.addEventListener('myCustomEvent', handler);

        customOutput.textContent = 'Добавлено 3 дополнительных обработчика. Нажмите "Запустить кастомное событие".';
    });

});