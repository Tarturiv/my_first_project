// Тесты для проверки реализации (запускаются в консоли)

(function runTests() {
    'use strict';

    let passed = 0;
    let failed = 0;
    const results = [];

    function assert(condition, message) {
        if (condition) {
            passed++;
            results.push({ ok: true, message });
            console.log(`✅ ${message}`);
        } else {
            failed++;
            results.push({ ok: false, message });
            console.error(`❌ ${message}`);
        }
    }

    function assertEquals(actual, expected, message) {
        const ok = JSON.stringify(actual) === JSON.stringify(expected);
        assert(ok, ok ? message : `${message} (ожидалось: ${JSON.stringify(expected)}, получено: ${JSON.stringify(actual)})`);
    }

    function testGroup(name, fn) {
        console.group(`🧪 ${name}`);
        try {
            fn();
        } catch (e) {
            failed++;
            console.error(`❌ Исключение в группе "${name}":`, e);
        }
        console.groupEnd();
    }

    // Тесты запускаем после инициализации приложения
    window.addEventListener('load', () => {
        // Небольшая задержка, чтобы initializeApp гарантированно выполнился
        setTimeout(() => {

            // Группа 1: createCard / createList
            testGroup('Задание 1: Создание элементов', () => {
                const target = document.getElementById('target1');
                assert(!!target, 'Элемент #target1 существует');

                const beforeCards = target.querySelectorAll('.card').length;
                const card = createCard('Тест', 'Описание');
                const afterCards = target.querySelectorAll('.card').length;

                assert(!!card, 'createCard возвращает созданный элемент');
                assertEquals(afterCards, beforeCards + 1, 'createCard добавляет карточку в #target1');
                assertEquals(card.querySelector('h4').textContent, 'Тест', 'Заголовок карточки корректный');
                assertEquals(card.querySelector('p').textContent, 'Описание', 'Текст карточки корректный');

                const beforeLists = target.querySelectorAll('ol').length;
                const list = createList(['A', 'B', 'C']);
                const afterLists = target.querySelectorAll('ol').length;

                assert(!!list, 'createList возвращает созданный список');
                assertEquals(afterLists, beforeLists + 1, 'createList добавляет список в #target1');
                assertEquals(list.children.length, 3, 'Список содержит 3 элемента');
                assertEquals(list.children[1].textContent, 'B', 'Второй элемент списка — "B"');

                // Краевые случаи
                const emptyList = createList([]);
                assertEquals(emptyList.children.length, 0, 'Пустой массив создаёт пустой список');
            });

            // Группа 2: Навигация по DOM
            testGroup('Задание 2: Навигация по DOM', () => {
                assertEquals(countChildren(), 3, 'countChildren() возвращает 3');
                assert(findSpecialChild().includes('Особый'), 'findSpecialChild() находит особый элемент');
                assert(typeof getParentBackground() === 'string' && getParentBackground().length > 0,
                    'getParentBackground() возвращает непустую строку цвета');
            });

            // Группа 3: Классы и стили
            testGroup('Задание 3: Классы и стили', () => {
                const btn = document.getElementById('toggle-style');
                const el = document.getElementById('style-target');

                el.classList.remove('active-style');
                btn.click();
                assert(el.classList.contains('active-style'), 'Клик добавляет класс active-style');

                btn.click();
                assert(!el.classList.contains('active-style'), 'Повторный клик убирает класс active-style');

                // changeHeaderColor — проверяем, что стиль меняется
                const header = document.getElementById('main-header');
                const prev = header.style.background;
                changeHeaderColor();
                assert(header.style.background !== prev, 'changeHeaderColor() меняет фон header');
            });

            // Группа 4: События
            testGroup('Задание 4: Обработка событий', () => {
                const btn = document.getElementById('click-btn');
                const counter = document.getElementById('click-counter');

                // Сбрасываем счётчик — эмулируем клики
                const initialText = counter.textContent;
                btn.click();
                btn.click();
                const match = counter.textContent.match(/(\d+)/);
                assert(!!match, 'Счётчик содержит число');
                const count = Number(match[1]);
                assert(count >= 2, `Счётчик увеличивается (текущее значение: ${count})`);

                // Input display
                const input = document.getElementById('text-input');
                const display = document.getElementById('input-display');
                input.value = 'Привет, DOM!';
                input.dispatchEvent(new Event('input'));
                assertEquals(display.textContent, 'Привет, DOM!', 'Input отображается в реальном времени');
            });

            // Группа 5: Динамические списки
            testGroup('Задание 5: Динамические списки', () => {
                clearList();
                const list = document.getElementById('dynamic-list');
                const input = document.getElementById('item-input');
                const addBtn = document.getElementById('add-item');
                const clearBtn = document.getElementById('clear-list');

                // Пустой ввод — ничего не добавляется
                input.value = '   ';
                addBtn.click();
                assertEquals(list.children.length, 0, 'Пустой ввод не добавляет элемент');

                // Добавление
                input.value = 'Элемент 1';
                addBtn.click();
                assertEquals(list.children.length, 1, 'Добавлен первый элемент');

                input.value = 'Элемент 2';
                addBtn.click();
                assertEquals(list.children.length, 2, 'Добавлен второй элемент');
                assertEquals(input.value, '', 'Поле ввода очищается после добавления');

                // Удаление через кнопку
                const delBtn = list.querySelector('.delete-btn');
                delBtn.click();
                assertEquals(list.children.length, 1, 'Кнопка удаления удаляет элемент');

                // Очистка
                clearBtn.click();
                assertEquals(list.children.length, 0, 'Кнопка «Очистить» очищает список');
            });

            // Группа 6: Валидация формы
            testGroup('Задание 6: Валидация формы', () => {
                // Пустые данные
                const errs1 = validateForm({ name: '', email: '', age: '' });
                assert(errs1 !== null, 'Пустая форма возвращает ошибки');
                assert(!!errs1.name, 'Ошибка: имя слишком короткое');
                assert(!!errs1.email, 'Ошибка: email некорректен');

                // Слишком короткое имя
                const errs2 = validateForm({ name: 'A', email: 'a@b.ru', age: '25' });
                assert(errs2 !== null && !!errs2.name, 'Имя из 1 символа — ошибка');

                // Неверный email
                const errs3 = validateForm({ name: 'Иван', email: 'not-an-email', age: '25' });
                assert(errs3 !== null && !!errs3.email, 'Некорректный email — ошибка');

                // Возраст вне диапазона
                const errs4 = validateForm({ name: 'Иван', email: 'ivan@mail.ru', age: '150' });
                assert(errs4 !== null && !!errs4.age, 'Возраст > 120 — ошибка');

                const errs5 = validateForm({ name: 'Иван', email: 'ivan@mail.ru', age: '0' });
                assert(errs5 !== null && !!errs5.age, 'Возраст < 1 — ошибка');

                // Успешная валидация
                const ok = validateForm({ name: 'Иван', email: 'ivan@mail.ru', age: '30' });
                assertEquals(ok, null, 'Корректные данные — ошибок нет');

                // Возраст необязателен
                const okNoAge = validateForm({ name: 'Иван', email: 'ivan@mail.ru', age: '' });
                assertEquals(okNoAge, null, 'Пустой возраст допустим');

                // Проверка отображения ошибок
                const output = document.getElementById('form-output');
                displayFormErrors({ name: 'Тестовая ошибка' });
                assert(output.classList.contains('error-message'), 'displayFormErrors добавляет класс error-message');
                assert(output.textContent.includes('Тестовая ошибка'), 'displayFormErrors выводит текст ошибки');

                // Проверка отображения успеха
                displayFormSuccess({ name: 'Иван', email: 'ivan@mail.ru', age: '30' });
                assert(output.classList.contains('success-message'), 'displayFormSuccess добавляет класс success-message');
                assert(output.textContent.includes('Иван'), 'displayFormSuccess выводит имя');
            });

            // Итоги
            console.log('');
            console.log(`ИТОГИ ТЕСТИРОВАНИЯ: ✅ ${passed} / ❌ ${failed}`);

            // Вывод в DOM (в footer)
            const footer = document.getElementById('main-footer');
            if (footer) {
                const summary = document.createElement('div');
                summary.className = `test-result ${failed === 0 ? 'test-success' : 'test-failure'}`;
                summary.textContent = `Тесты: пройдено ${passed}, провалено ${failed}`;
                footer.appendChild(summary);
            }
        }, 300);
    });
})();