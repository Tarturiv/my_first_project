// Часть 2.1: Функции для работы с числами

// Проверка, является ли число простым
// Временная сложность: O(√n) - так как проверяем делители до корня
function isPrime(number) {
    if (number < 2) return false;
    if (number === 2) return true;
    if (number % 2 === 0) return false;
    for (let i = 3; i * i <= number; i += 2) {
        if (number % i === 0) return false;
    }
    return true;
}

// Факториал числа
// Временная сложность: O(n) - линейная
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Первые n чисел Фибоначчи (итеративная реализация)
// Временная сложность: O(n) - линейная
function fibonacci(n) {
    if (n <= 0) return [];
    if (n === 1) return [0];
    const result = [0, 1];
    for (let i = 2; i < n; i++) {
        result.push(result[i - 1] + result[i - 2]);
    }
    return result;
}

// Наибольший общий делитель (алгоритм Евклида)
// Временная сложность: O(log(min(a, b))) - логарифмическая
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

// Часть 2.2: Функции для работы со строками

// Проверка строки на палиндром (игнорируя пробелы и регистр)
// Временная сложность: O(n) - линейная
function isPalindrome(str) {
    const clean = str.toLowerCase().replace(/[^a-zа-яё0-9]/g, '');
    let left = 0;
    let right = clean.length - 1;
    while (left < right) {
        if (clean[left] !== clean[right]) return false;
        left++;
        right--;
    }
    return true;
}

// Подсчёт гласных букв в строке
// Временная сложность: O(n) - линейная
function countVowels(str) {
    const vowels = 'аеёиоуыэюяaeiouy';
    let count = 0;
    const lower = str.toLowerCase();
    for (let i = 0; i < lower.length; i++) {
        if (vowels.includes(lower[i])) count++;
    }
    return count;
}

// Переворот строки без встроенных методов reverse
// Временная сложность: O(n) - линейная
function reverseString(str) {
    let result = '';
    for (let i = str.length - 1; i >= 0; i--) {
        result += str[i];
    }
    return result;
}

// Поиск самого длинного слова в предложении
// Временная сложность: O(n) - линейная
function findLongestWord(sentence) {
    const words = sentence.split(/\s+/);
    let longest = '';
    for (const word of words) {
        const cleanWord = word.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '');
        if (cleanWord.length > longest.length) {
            longest = cleanWord;
        }
    }
    return longest;
}

// Часть 2.3: Функции для работы с массивами

// Поиск максимального элемента в массиве
// Временная сложность: O(n) - линейная
function findMax(arr) {
    if (!arr || arr.length === 0) return undefined;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

// Удаление дубликатов из массива
// Временная сложность: O(n) - линейная (с использованием Set)
function removeDuplicates(arr) {
    return [...new Set(arr)];
}

// Пузырьковая сортировка
// Временная сложность: O(n²) - квадратичная
function bubbleSort(arr) {
    const result = [...arr];
    const n = result.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - 1 - i; j++) {
            if (result[j] > result[j + 1]) {
                [result[j], result[j + 1]] = [result[j + 1], result[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return result;
}

// Бинарный поиск в отсортированном массиве
// Временная сложность: O(log n) - логарифмическая
function binarySearch(sortedArr, target) {
    let left = 0;
    let right = sortedArr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (sortedArr[mid] === target) return mid;
        if (sortedArr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

// Часть 2.4: Утилитарные функции

// Форматирование денежной суммы
// Временная сложность: O(n) - линейная (зависит от длины числа)
function formatCurrency(amount, currency = '₽') {
    const rounded = Math.round(amount * 100) / 100;
    const parts = rounded.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${integerPart}.${parts[1]} ${currency}`;
}

// Проверка валидности email с помощью регулярного выражения
// Временная сложность: O(n) - линейная
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Генерация случайного пароля
// Временная сложность: O(n) - линейная
function generatePassword(length = 8) {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = upper + lower + digits + special;

    // Гарантируем наличие хотя бы одного символа каждого типа
    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Перемешиваем символы
    return password.split('').sort(() => Math.random() - 0.5).join('');
}