// Часть 2: Основные задания

// 1. sum — принимает любое количество аргументов (rest parameters)
function sum(...numbers) {
    return numbers.reduce((acc, n) => acc + n, 0);
}

// 2. createUser — деструктуризация объекта с параметром по умолчанию
function createUser({ name, age, email = "не указан" }) {
    return `Пользователь: ${name}, возраст: ${age}, email: ${email}`;
}

// 3. secretMessage — замыкание
function secretMessage(password, message) {
    return function (inputPassword) {
        return inputPassword === password ? message : "Доступ запрещен";
    };
}

// Часть 3: Рекурсия и функции высшего порядка

// 4. compose — композиция функций (справа налево)
function compose(...functions) {
    return function (initialValue) {
        return functions.reduceRight((acc, fn) => fn(acc), initialValue);
    };
}

// 5. myMap — аналог Array.prototype.map
function myMap(array, callback) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
        result.push(callback(array[i], i, array));
    }
    return result;
}

// 6. myFilter — аналог Array.prototype.filter
function myFilter(array, callback) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
        if (callback(array[i], i, array)) {
            result.push(array[i]);
        }
    }
    return result;
}

// 7. myReduce — аналог Array.prototype.reduce
function myReduce(array, callback, initialValue) {
    let accumulator;
    let startIndex;

    if (initialValue !== undefined) {
        accumulator = initialValue;
        startIndex = 0;
    } else {
        if (array.length === 0) {
            throw new TypeError("Reduce of empty array with no initial value");
        }
        accumulator = array[0];
        startIndex = 1;
    }

    for (let i = startIndex; i < array.length; i++) {
        accumulator = callback(accumulator, array[i], i, array);
    }
    return accumulator;
}

// Часть 4: Сложно, но важно

// 8. curry — каррирование
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function (...nextArgs) {
            return curried.apply(this, args.concat(nextArgs));
        };
    };
}

// 9. memoize — кэширование результатов
function memoize(fn) {
    const cache = new Map();
    return function (...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// 10. debounce — откладывает вызов до паузы
function debounce(fn, delay) {
    let timerId = null;
    return function (...args) {
        const context = this;
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn.apply(context, args);
            timerId = null;
        }, delay);
    };
}

// 11. throttle — ограничивает частоту вызовов
function throttle(fn, interval) {
    let lastCall = 0;
    let timerId = null;
    return function (...args) {
        const context = this;
        const now = Date.now();
        const remaining = interval - (now - lastCall);

        if (remaining <= 0) {
            if (timerId) {
                clearTimeout(timerId);
                timerId = null;
            }
            lastCall = now;
            fn.apply(context, args);
        } else if (!timerId) {
            timerId = setTimeout(() => {
                lastCall = Date.now();
                timerId = null;
                fn.apply(context, args);
            }, remaining);
        }
    };
}

// 12. createValidator — фабрика валидаторов (замыкание + опции)
function createValidator(options) {
    const {
        minLength = 0,
        requireDigit = false,
        requireUppercase = false,
    } = options || {};

    return function (value) {
        const errors = [];

        if (typeof value !== "string") {
            return { valid: false, errors: ["Значение должно быть строкой"] };
        }
        if (value.length < minLength) {
            errors.push(`Минимальная длина — ${minLength} символов`);
        }
        if (requireDigit && !/\d/.test(value)) {
            errors.push("Должна быть хотя бы одна цифра");
        }
        if (requireUppercase && !/[A-ZА-ЯЁ]/.test(value)) {
            errors.push("Должна быть хотя бы одна заглавная буква");
        }

        return { valid: errors.length === 0, errors };
    };
}

// Экспорт для Node.js (если тесты запускаются через Node)
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        sum, createUser, secretMessage,
        compose, myMap, myFilter, myReduce,
        curry, memoize, debounce, throttle, createValidator,
    };
}