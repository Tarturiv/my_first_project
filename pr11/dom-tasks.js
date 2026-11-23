// ЗАДАНИЕ 1: Создание и вставка элементов

// 1.1. Создание карточки
function createCard(title, content) {
    const target = document.getElementById('target1');
    if (!target) return null;

    const card = document.createElement('div');
    card.className = 'card';

    const h4 = document.createElement('h4');
    h4.textContent = title;

    const p = document.createElement('p');
    p.textContent = content;

    card.appendChild(h4);
    card.appendChild(p);
    target.appendChild(card);

    return card;
}

// 1.2. Создание нумерованного списка
function createList(items) {
    const target = document.getElementById('target1');
    if (!target || !Array.isArray(items)) return null;

    const ol = document.createElement('ol');

    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ol.appendChild(li);
    });

    target.appendChild(ol);
    return ol;
}

// ЗАДАНИЕ 2: Навигация по DOM

// 2.1. Количество дочерних элементов
function countChildren() {
    const parent = document.getElementById('parent-element');
    if (!parent) return 0;
    // Учитываем только элементы (не текстовые узлы)
    return parent.children.length;
}

// 2.2. Поиск особого дочернего элемента
function findSpecialChild() {
    const parent = document.getElementById('parent-element');
    if (!parent) return null;
    const special = parent.querySelector('.special');
    return special ? special.textContent.trim() : null;
}

// 2.3. Цвет фона родительского элемента для .child
function getParentBackground() {
    const child = document.querySelector('.child');
    if (!child || !child.parentElement) return null;
    return getComputedStyle(child.parentElement).backgroundColor;
}

// ЗАДАНИЕ 3: Работа с классами и стилями

// 3.1. Переключение класса active-style
function setupStyleToggle() {
    const btn = document.getElementById('toggle-style');
    const target = document.getElementById('style-target');
    if (!btn || !target) return;

    btn.addEventListener('click', () => {
        target.classList.toggle('active-style');
    });
}

// 3.2. Смена цвета фона header на случайный
function changeHeaderColor() {
    const header = document.getElementById('main-header');
    if (!header) return;

    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    header.style.background = `rgb(${r}, ${g}, ${b})`;
}

// 3.3. Анимация элемента
function animateElement() {
    const el = document.getElementById('style-target');
    if (!el) return;

    // Сброс, чтобы анимация срабатывала повторно
    el.style.transition = 'none';
    el.style.transform = 'scale(1)';
    el.style.opacity = '1';

    // Принудительный reflow
    void el.offsetWidth;

    el.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    el.style.transform = 'scale(1.2)';
    el.style.opacity = '0.6';

    setTimeout(() => {
        el.style.transform = 'scale(1)';
        el.style.opacity = '1';
    }, 500);
}

// ЗАДАНИЕ 4: Обработка событий

// 4.1. Счётчик кликов
function setupClickCounter() {
    const btn = document.getElementById('click-btn');
    const counter = document.getElementById('click-counter');
    if (!btn || !counter) return;

    let count = 0;
    btn.addEventListener('click', () => {
        count++;
        counter.textContent = `Кликов: ${count}`;
    });
}

// 4.2. Отображение введённого текста в реальном времени
function setupInputDisplay() {
    const input = document.getElementById('text-input');
    const display = document.getElementById('input-display');
    if (!input || !display) return;

    input.addEventListener('input', (e) => {
        display.textContent = e.target.value;
    });
}

// 4.3. Обработка нажатий клавиш
function setupKeyboardEvents() {
    const info = document.getElementById('keyboard-info');
    if (!info) return;

    document.addEventListener('keydown', (e) => {
        // Игнорируем, чтобы не мешать вводу в поля
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        console.log(`keydown: code=${e.code}, key="${e.key}"`);
        info.textContent = `Последняя клавиша: "${e.key}" (код: ${e.code})`;
    });
}

// ЗАДАНИЕ 5: Динамические списки

// 5.1. Добавление элемента списка
function addListItem() {
    const input = document.getElementById('item-input');
    const list = document.getElementById('dynamic-list');
    if (!input || !list) return;

    const text = input.value.trim();
    if (!text) {
        input.focus();
        return;
    }

    const li = document.createElement('li');
    li.className = 'list-item';

    const span = document.createElement('span');
    span.textContent = text;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Удалить';
    delBtn.className = 'delete-btn';
    delBtn.dataset.action = 'delete';

    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);

    input.value = '';
    input.focus();
}

// 5.2. Удаление элемента списка
function removeListItem(event) {
    const btn = event.target.closest('button[data-action="delete"]');
    if (!btn) return;
    const li = btn.closest('li');
    if (li) li.remove();
}

// 5.3. Очистка списка
function clearList() {
    const list = document.getElementById('dynamic-list');
    if (list) list.innerHTML = '';
}

// 5.4. Настройка обработчиков списка (делегирование)
function setupListEvents() {
    const addBtn = document.getElementById('add-item');
    const clearBtn = document.getElementById('clear-list');
    const list = document.getElementById('dynamic-list');
    const input = document.getElementById('item-input');

    if (addBtn) addBtn.addEventListener('click', addListItem);
    if (clearBtn) clearBtn.addEventListener('click', clearList);
    if (list) list.addEventListener('click', removeListItem);

    // Enter в поле ввода тоже добавляет элемент
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addListItem();
            }
        });
    }
}

// ЗАДАНИЕ 6: Работа с формами и валидация

// 6.1. Валидация формы
function validateForm(formData) {
    const errors = {};

    const name = (formData.name || '').trim();
    if (name.length < 2) {
        errors.name = 'Имя должно содержать минимум 2 символа.';
    }

    const email = (formData.email || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.email = 'Введите корректный email.';
    }

    const ageRaw = formData.age;
    if (ageRaw !== '' && ageRaw !== null && ageRaw !== undefined) {
        const age = Number(ageRaw);
        if (!Number.isInteger(age) || age < 1 || age > 120) {
            errors.age = 'Возраст должен быть числом от 1 до 120.';
        }
    }

    return Object.keys(errors).length ? errors : null;
}

// 6.2. Отображение ошибок
function displayFormErrors(errors) {
    const output = document.getElementById('form-output');
    if (!output) return;

    output.innerHTML = '';
    output.className = 'error-message';

    const title = document.createElement('p');
    title.innerHTML = '<strong>Пожалуйста, исправьте ошибки:</strong>';
    output.appendChild(title);

    Object.values(errors).forEach(msg => {
        const p = document.createElement('p');
        p.textContent = msg;
        output.appendChild(p);
    });
}

// 6.3. Отображение успеха
function displayFormSuccess(userData) {
    const output = document.getElementById('form-output');
    if (!output) return;

    output.innerHTML = '';
    output.className = 'success-message';

    const title = document.createElement('p');
    title.innerHTML = '<strong>Форма успешно отправлена!</strong>';
    output.appendChild(title);

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.marginTop = '0.5rem';

    const rows = [
        ['Имя', userData.name],
        ['Email', userData.email],
        ['Возраст', userData.age || '—']
    ];

    rows.forEach(([label, value]) => {
        const li = document.createElement('li');
        li.textContent = `${label}: ${value}`;
        ul.appendChild(li);
    });

    output.appendChild(ul);
}

// 6.4. Обработка отправки формы
function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = {
        name: form.querySelector('#user-name')?.value ?? '',
        email: form.querySelector('#user-email')?.value ?? '',
        age: form.querySelector('#user-age')?.value ?? ''
    };

    const errors = validateForm(formData);

    if (errors) {
        displayFormErrors(errors);
    } else {
        displayFormSuccess(formData);
        form.reset();
    }
}

// 6.5. Настройка формы
function setupForm() {
    const form = document.getElementById('user-form');
    if (form) form.addEventListener('submit', handleFormSubmit);
}

// ИНИЦИАЛИЗАЦИЯ

function initializeApp() {
    // Настройка обработчиков
    setupStyleToggle();
    setupClickCounter();
    setupInputDisplay();
    setupKeyboardEvents();
    setupListEvents();
    setupForm();

    // Дополнительные кнопки (анимация, цвет header)
    const animateBtn = document.getElementById('animate-btn');
    if (animateBtn) animateBtn.addEventListener('click', animateElement);

    const headerBtn = document.getElementById('header-color-btn');
    if (headerBtn) headerBtn.addEventListener('click', changeHeaderColor);

    // Демонстрация создания элементов
    createCard('Пример карточки', 'Это содержимое карточки');
    createList(['Первый элемент', 'Второй элемент', 'Третий элемент']);

    console.log('Приложение инициализировано!');
}

// Запуск после загрузки DOM
document.addEventListener('DOMContentLoaded', initializeApp);