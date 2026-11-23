// Мини-фреймворк для тестирования

const TestRunner = (() => {
    let passed = 0;
    let failed = 0;
    const results = [];

    function assertEqual(actual, expected, testName) {
        const ok = JSON.stringify(actual) === JSON.stringify(expected);
        record(ok, testName, ok ? null : { actual, expected });
    }

    function assertDeepEqual(actual, expected, testName) {
        const ok = JSON.stringify(actual) === JSON.stringify(expected);
        record(ok, testName, ok ? null : { actual, expected });
    }

    function assertTrue(value, testName) {
        record(!!value, testName, value ? null : { actual: value, expected: true });
    }

    function assertThrows(fn, testName) {
        try {
            fn();
            record(false, testName, { actual: "no throw", expected: "throw" });
        } catch (e) {
            record(true, testName, null);
        }
    }

    function record(ok, name, info) {
        if (ok) {
            passed++;
            results.push({ ok, name });
        } else {
            failed++;
            results.push({ ok, name, info });
        }
    }

    function print() {
        const container = typeof document !== "undefined"
            ? document.getElementById("testResults")
            : null;

        results.forEach(r => {
            const line = `${r.ok ? "✅" : "❌"} ${r.name}`;
            console.log(line);
            if (!r.ok && r.info) console.log("   ", r.info);
            if (container) {
                const div = document.createElement("div");
                div.className = `test-result ${r.ok ? "success" : "error"}`;
                div.textContent = line;
                container.appendChild(div);
            }
        });

        const summary = `\nИтого: ${passed} прошло, ${failed} провалено`;
        console.log(summary);
        if (container) {
            const div = document.createElement("div");
            div.className = "task";
            div.innerHTML = `<strong>Итого: ${passed} прошло, ${failed} провалено</strong>`;
            container.appendChild(div);
        }
    }

    return { assertEqual, assertDeepEqual, assertTrue, assertThrows, print };
})();

const { assertEqual, assertDeepEqual, assertTrue, assertThrows } = TestRunner;

// Тесты

// sum
assertEqual(sum(1, 2, 3), 6, "sum: 1+2+3 = 6");
assertEqual(sum(), 0, "sum: без аргументов = 0");
assertEqual(sum(5), 5, "sum: один аргумент = 5");
assertEqual(sum(-1, -2, -3), -6, "sum: отрицательные числа");
assertEqual(sum(1.5, 2.5), 4, "sum: дробные числа");

// createUser
assertEqual(
    createUser({ name: "Иван", age: 25, email: "ivan@mail.ru" }),
    "Пользователь: Иван, возраст: 25, email: ivan@mail.ru",
    "createUser: все поля"
);
assertEqual(
    createUser({ name: "Мария", age: 30 }),
    "Пользователь: Мария, возраст: 30, email: не указан",
    "createUser: без email"
);
assertEqual(
    createUser({ name: "Олег", age: 20, email: "" }),
    "Пользователь: Олег, возраст: 20, email: ",
    "createUser: пустой email (явно передан)"
);

// secretMessage
const checkSecret = secretMessage("qwerty", "Секрет");
assertEqual(checkSecret("qwerty"), "Секрет", "secretMessage: верный пароль");
assertEqual(checkSecret("wrong"), "Доступ запрещен", "secretMessage: неверный пароль");
assertEqual(checkSecret(""), "Доступ запрещен", "secretMessage: пустой пароль");
assertEqual(checkSecret("QWERTY"), "Доступ запрещен", "secretMessage: регистрозависимость");

// compose
const add1 = x => x + 1;
const double = x => x * 2;
assertEqual(compose(add1, double)(3), 7, "compose: double → add1 (3→6→7)");
assertEqual(compose(double, add1)(3), 8, "compose: add1 → double (3→4→8)");
assertEqual(compose()(5), 5, "compose: без функций — возвращает вход");
assertEqual(compose(add1)(10), 11, "compose: одна функция");

// myMap
assertDeepEqual(myMap([1, 2, 3], x => x * 2), [2, 4, 6], "myMap: удвоение");
assertDeepEqual(myMap([], x => x), [], "myMap: пустой массив");
assertDeepEqual(
    myMap(["a", "b"], (x, i) => `${i}:${x}`),
    ["0:a", "1:b"],
    "myMap: с индексом"
);

// myFilter
assertDeepEqual(myFilter([1, 2, 3, 4], x => x % 2 === 0), [2, 4], "myFilter: чётные");
assertDeepEqual(myFilter([], () => true), [], "myFilter: пустой массив");
assertDeepEqual(
    myFilter([1, 2, 3], (x, i) => i > 0),
    [2, 3],
    "myFilter: по индексу"
);

// myReduce
assertEqual(myReduce([1, 2, 3, 4], (a, b) => a + b, 0), 10, "myReduce: сумма");
assertEqual(myReduce([1, 2, 3], (a, b) => a + b), 6, "myReduce: без начального значения");
assertEqual(myReduce([], (a, b) => a + b, 100), 100, "myReduce: пустой массив с initial");
assertThrows(
    () => myReduce([], (a, b) => a + b),
    "myReduce: пустой массив без initial — исключение"
);
assertEqual(
    myReduce(["a", "b", "c"], (acc, x) => acc + x, ""),
    "abc",
    "myReduce: конкатенация строк"
);

// curry
const add3 = (a, b, c) => a + b + c;
const curriedAdd3 = curry(add3);
assertEqual(curriedAdd3(1)(2)(3), 6, "curry: по одному аргументу");
assertEqual(curriedAdd3(1, 2)(3), 6, "curry: 2 + 1");
assertEqual(curriedAdd3(1)(2, 3), 6, "curry: 1 + 2");
assertEqual(curriedAdd3(1, 2, 3), 6, "curry: все сразу");

// memoize
let callCount = 0;
const slowSquare = memoize(x => { callCount++; return x * x; });
assertEqual(slowSquare(5), 25, "memoize: 5² = 25");
assertEqual(slowSquare(5), 25, "memoize: повторный вызов");
assertEqual(callCount, 1, "memoize: функция вызвана один раз");
assertEqual(slowSquare(6), 36, "memoize: другое значение");
assertEqual(callCount, 2, "memoize: кэш по разным ключам");

// debounce (асинхронные тесты)
const debounceResults = [];
function debounceTest() {
    const fn = debounce(x => debounceResults.push(x), 50);
    fn(1); fn(2); fn(3);
    setTimeout(() => {
        assertDeepEqual(debounceResults, [3], "debounce: вызвана только последняя");
    }, 100);
}
debounceTest();

// throttle (асинхронные тесты)
const throttleResults = [];
function throttleTest() {
    const fn = throttle(x => throttleResults.push(x), 50);
    fn(1); fn(2); fn(3);
    setTimeout(() => {
        // Первый вызов — сразу, затем trailing после паузы
        assertTrue(throttleResults[0] === 1, "throttle: первый вызов сразу");
        assertTrue(throttleResults.includes(3), "throttle: последний вызов (trailing)");
    }, 120);
}
throttleTest();

// createValidator
const strongValidator = createValidator({
    minLength: 8,
    requireDigit: true,
    requireUppercase: true,
});

assertTrue(strongValidator("Abcdefg1").valid, "validator: корректный пароль");
assertTrue(!strongValidator("abc").valid, "validator: слишком короткий");
assertTrue(!strongValidator("abcdefgh").valid, "validator: без цифры и заглавной");
assertTrue(!strongValidator("abcdefg1").valid, "validator: без заглавной");
assertTrue(!strongValidator("ABCDEFG1").valid, "validator: без строчной? (нет проверки) → valid");
assertTrue(!strongValidator(123).valid, "validator: не строка");

const lightValidator = createValidator({ minLength: 3 });
assertTrue(lightValidator("abc").valid, "validator: только minLength — ок");
assertTrue(!lightValidator("ab").valid, "validator: только minLength — мало");

const emptyValidator = createValidator();
assertTrue(emptyValidator("").valid, "validator: без опций — всё валидно");

// Печать результатов
TestRunner.print();