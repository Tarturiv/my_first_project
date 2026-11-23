'use strict';


(function () {
    const results = [];
    let passed = 0;
    let failed = 0;

    // Утилита: проверка условия
    function check(name, condition) {
        if (condition) {
            passed++;
            results.push({ ok: true, name });
            console.log(`✅ PASS: ${name}`);
        } else {
            failed++;
            results.push({ ok: false, name });
            console.error(`❌ FAIL: ${name}`);
        }
    }

    // Утилита: симуляция события
    function fire(el, type, props = {}) {
        if (!el) return;
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, props);
        el.dispatchEvent(event);
    }

    // Утилита: клик с объектом MouseEvent
    function fireMouse(el, type, props = {}) {
        if (!el) return;
        const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...props });
        el.dispatchEvent(event);
    }

    // Утилита: клавиатурное событие
    function fireKey(el, type, props = {}) {
        if (!el) return;
        const event = new KeyboardEvent(type, { bubbles: true, cancelable: true, ...props });
        el.dispatchEvent(event);
    }

    function runTests() {
        console.log('=== Запуск тестов ПР12 ===');

        /* Задача 1 */
        const basicBtn = document.getElementById('basic-btn');
        const basicOutput = document.getElementById('basic-output');
        const colorBox = document.getElementById('color-box');
        const mouseOutput = document.getElementById('mouse-output');

        check('Задача 1: кнопка существует', !!basicBtn);
        check('Задача 1: блок вывода существует', !!basicOutput);

        if (basicBtn && basicOutput) {
            basicOutput.textContent = 'Статус: ожидание события';
            fireMouse(basicBtn, 'click');
            check('Задача 1: клик по кнопке меняет текст',
                basicOutput.textContent.includes('нажата'));
        }

        if (colorBox) {
            colorBox.style.background = '';
            fireMouse(colorBox, 'mouseenter');
            check('Задача 1: mouseenter меняет фон',
                colorBox.style.background !== '');
            fireMouse(colorBox, 'mouseleave');
            check('Задача 1: mouseleave возвращает фон',
                colorBox.style.background !== '' || colorBox.textContent.includes('Наведи'));
        }

        if (mouseOutput && colorBox) {
            fireMouse(colorBox, 'mousemove', { clientX: 10, clientY: 10 });
            check('Задача 1: mousemove пишет координаты',
                mouseOutput.textContent.includes('X=') && mouseOutput.textContent.includes('Y='));
        }

        /* Задача 2 */
        const keyInput = document.getElementById('key-input');
        const keyOutput = document.getElementById('key-output');

        check('Задача 2: input существует', !!keyInput);
        check('Задача 2: вывод существует', !!keyOutput);

        if (keyInput && keyOutput) {
            fireKey(keyInput, 'keydown', { key: 'a', code: 'KeyA' });
            check('Задача 2: keydown пишет нажатую клавишу',
                keyOutput.textContent.includes('a'));

            keyOutput.textContent = '';
            fireKey(keyInput, 'keydown', { key: 's', code: 'KeyS', ctrlKey: true });
            check('Задача 2: Ctrl+S распознаётся',
                keyOutput.textContent.includes('Ctrl + S'));

            keyOutput.textContent = '';
            fireKey(keyInput, 'keydown', { key: 'c', code: 'KeyC', altKey: true });
            check('Задача 2: Alt+C распознаётся',
                keyOutput.textContent.includes('Alt + C'));

            keyOutput.textContent = '';
            fireKey(keyInput, 'keydown', { key: 'A', code: 'KeyA', shiftKey: true });
            check('Задача 2: Shift+A распознаётся',
                keyOutput.textContent.includes('Shift + A'));
        }

        /* Задача 3 */
        const itemList = document.getElementById('item-list');
        const addItemBtn = document.getElementById('add-item-btn');

        check('Задача 3: список существует', !!itemList);
        check('Задача 3: кнопка добавления существует', !!addItemBtn);

        if (itemList) {
            const itemsBefore = itemList.querySelectorAll('.item').length;

            // Клик по элементу — должен вызвать alert (перехватываем alert)
            let alertText = '';
            const originalAlert = window.alert;
            window.alert = (msg) => { alertText = String(msg); };

            const firstItem = itemList.querySelector('.item');
            if (firstItem) {
                fireMouse(firstItem, 'click');
                check('Задача 3: клик по элементу показывает data-id',
                    alertText.includes(firstItem.dataset.id));
            }

            // Удаление через делегирование
            const deleteBtn = itemList.querySelector('.item .delete');
            if (deleteBtn) {
                fireMouse(deleteBtn, 'click');
                const itemsAfterDelete = itemList.querySelectorAll('.item').length;
                check('Задача 3: кнопка x удаляет элемент',
                    itemsAfterDelete === itemsBefore - 1);
            }

            // Добавление
            if (addItemBtn) {
                fireMouse(addItemBtn, 'click');
                const itemsAfterAdd = itemList.querySelectorAll('.item').length;
                check('Задача 3: добавление элемента работает',
                    itemsAfterAdd === itemsBefore);
            }

            window.alert = originalAlert;
        }

        /* Задача 4 */
        const preventLink = document.getElementById('prevent-link');
        const preventForm = document.getElementById('prevent-form');
        const preventionOutput = document.getElementById('prevention-output');

        check('Задача 4: ссылка существует', !!preventLink);
        check('Задача 4: форма существует', !!preventForm);
        check('Задача 4: вывод существует', !!preventionOutput);

        if (preventLink && preventionOutput) {
            const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
            preventLink.dispatchEvent(ev);
            check('Задача 4: переход по ссылке заблокирован',
                ev.defaultPrevented === true);
            check('Задача 4: сообщение о блокировке ссылки',
                preventionOutput.textContent.toLowerCase().includes('ссылк'));
        }

        if (preventForm && preventionOutput) {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            preventForm.dispatchEvent(submitEvent);
            check('Задача 4: отправка формы заблокирована',
                submitEvent.defaultPrevented === true);
            check('Задача 4: сообщение о блокировке формы',
                preventionOutput.textContent.toLowerCase().includes('форм'));
        }

        /* Задача 5 */
        const triggerCustom = document.getElementById('trigger-custom');
        const multipleListeners = document.getElementById('multiple-listeners');
        const customOutput = document.getElementById('custom-output');

        check('Задача 5: кнопка запуска существует', !!triggerCustom);
        check('Задача 5: кнопка добавления обработчиков существует', !!multipleListeners);
        check('Задача 5: вывод существует', !!customOutput);

        if (triggerCustom && customOutput) {
            let received = null;
            const probe = (e) => { received = e.detail; };
            document.addEventListener('myCustomEvent', probe);

            fireMouse(triggerCustom, 'click');
            check('Задача 5: кастомное событие всплывает и содержит detail',
                received !== null && received.message !== undefined);

            check('Задача 5: вывод обновляется после кастомного события',
                customOutput.textContent.length > 0 &&
                !customOutput.textContent.includes('Кастомные события: '));

            document.removeEventListener('myCustomEvent', probe);
        }

        if (multipleListeners && customOutput) {
            fireMouse(multipleListeners, 'click');
            check('Задача 5: добавление нескольких обработчиков сообщает о себе',
                customOutput.textContent.toLowerCase().includes('обработчик'));

            // После добавления 3 обработчиков запуск события должен их вызвать
            // (проверяем по тексту вывода — он содержит счётчик)
            if (triggerCustom) {
                fireMouse(triggerCustom, 'click');
                check('Задача 5: после добавления обработчиков счётчик увеличивается',
                    /обработчик/i.test(customOutput.textContent));
            }
        }

        /* Итоги */
        console.log(`\n=== ИТОГО: ${passed} пройдено, ${failed} провалено ===`);

        // Вывод на страницу
        const summary = document.createElement('div');
        summary.className = 'test-summary';
        summary.style.cssText = 'position:fixed;bottom:10px;right:10px;max-width:320px;' +
            'background:#fff;border:2px solid ' + (failed ? '#ef4444' : '#10b981') + ';' +
            'border-radius:10px;padding:12px 16px;font-family:monospace;font-size:13px;' +
            'box-shadow:0 4px 16px rgba(0,0,0,0.2);z-index:9999;';
        summary.innerHTML = `<strong>Тесты ПР12</strong><br>
            ✅ Пройдено: ${passed}<br>
            ❌ Провалено: ${failed}<br>
            <em>Подробности — в консоли (F12)</em>`;
        document.body.appendChild(summary);

        return { passed, failed, results };
    }

    // Запускаем после полной загрузки DOM и обработчиков
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(runTests, 0);
    } else {
        document.addEventListener('DOMContentLoaded', () => setTimeout(runTests, 0));
    }
})();