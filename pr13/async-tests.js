(function runAsyncTests() {
    const results = [];

    function assert(condition, message) {
        if (condition) {
            results.push({ ok: true, message });
        } else {
            results.push({ ok: false, message });
        }
    }

    async function run() {
        console.group('Запуск тестов асинхронных операций');

        // Тест 1: createBasicPromise резолвится
        try {
            const value = await createBasicPromise(true);
            assert(value === 'Успех!', 'createBasicPromise(true) резолвится со значением "Успех!"');
        } catch (e) {
            assert(false, 'createBasicPromise(true) не должен реджектиться');
        }

        // Тест 2: createBasicPromise реджектится 
        try {
            await createBasicPromise(false);
            assert(false, 'createBasicPromise(false) должен реджектиться');
        } catch (e) {
            assert(e.message === 'Ошибка!', 'createBasicPromise(false) реджектится с сообщением "Ошибка!"');
        }

        // Тест 3: delayWithPromise
        const start = performance.now();
        await delayWithPromise(300);
        const elapsed = performance.now() - start;
        assert(elapsed >= 280, `delayWithPromise(300) выдерживает задержку (${Math.round(elapsed)} мс)`);

        // Тест 4: Promise.all в parallelAsyncExecution — быстрое выполнение
        // (косвенно проверяем через Promise.all напрямую)
        const t0 = performance.now();
        const parallelResults = await Promise.all([
            delayWithPromise(200).then(() => 'A'),
            delayWithPromise(200).then(() => 'B'),
            delayWithPromise(200).then(() => 'C')
        ]);
        const parallelElapsed = performance.now() - t0;
        assert(
            parallelResults.length === 3 && parallelElapsed < 500,
            `Promise.all выполнил 3 задачи за ${Math.round(parallelElapsed)} мс (параллельно)`
        );

        // Тест 5: Promise.allSettled
        const settled = await Promise.allSettled([
            Promise.resolve('ok'),
            Promise.reject(new Error('fail'))
        ]);
        assert(
            settled[0].status === 'fulfilled' && settled[1].status === 'rejected',
            'Promise.allSettled корректно возвращает статусы всех промисов'
        );

        // Тест 6: Проверка наличия всех кнопок в DOM
        const requiredIds = [
            'basic-promise', 'promise-chain', 'promise-error',
            'basic-async', 'async-error', 'async-parallel',
            'fetch-users', 'fetch-post', 'fetch-error',
            'start-interval', 'stop-interval', 'delay-promise',
            'try-catch', 'multiple-errors', 'retry-pattern',
            'promise-all', 'promise-race', 'promise-allSettled',
            'sequential-requests', 'upload-simulation', 'cache-requests'
        ];
        const missing = requiredIds.filter((id) => !document.getElementById(id));
        assert(missing.length === 0, `Все кнопки присутствуют в DOM ${missing.length ? '(отсутствуют: ' + missing.join(', ') + ')' : ''}`);

        // Вывод результатов
        const container = document.getElementById('tasks-section');
        const header = document.createElement('div');
        header.className = 'test-result';
        header.innerHTML = '<strong>🧪 Результаты автоматических тестов:</strong>';
        container.prepend(header);

        results.forEach((r) => {
            const div = document.createElement('div');
            div.className = 'test-result' + (r.ok ? '' : ' test-failure');
            div.textContent = (r.ok ? '✔ ' : '✖ ') + r.message;
            container.prepend(div);
            if (r.ok) {
                console.log('✔ ' + r.message);
            } else {
                console.error('✖ ' + r.message);
            }
        });

        const passed = results.filter((r) => r.ok).length;
        console.log(`\nИтого: ${passed}/${results.length} тестов пройдено`);
        console.groupEnd();
    }

    // Запускаем после загрузки DOM и подключения обработчиков
    window.addEventListener('load', () => {
        setTimeout(run, 100);
    });
})();