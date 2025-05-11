/**
 * Класс для работы с полем Галуа GF(256)
*/
export class GF256 {
    // Неприводимый полином для GF(256): x^8 + x^4 + x^3 + x^2 + 1 (0x11D)

    // Таблицы логарифмов и антилогарифмов (экспонент)
    // public static LOG_TABLE: number[] = new Array(256).fill(0);
    // public static EXP_TABLE: number[] = new Array(256).fill(0);
    public static EXP_TABLE: number[] = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1d, 0x3a, 0x74, 0xe8, 0xcd, 0x87, 0x13, 0x26, 0x4c, 0x98, 0x2d, 0x5a, 0xb4, 0x75, 0xea, 0xc9, 0x8f, 0x03, 0x06, 0x0c, 0x18, 0x30, 0x60, 0xc0, 0x9d, 0x27, 0x4e, 0x9c, 0x25, 0x4a, 0x94, 0x35, 0x6a, 0xd4, 0xb5, 0x77, 0xee, 0xc1, 0x9f, 0x23, 0x46, 0x8c, 0x05, 0x0a, 0x14, 0x28, 0x50, 0xa0, 0x5d, 0xba, 0x69, 0xd2, 0xb9, 0x6f, 0xde, 0xa1, 0x5f, 0xbe, 0x61, 0xc2, 0x99, 0x2f, 0x5e, 0xbc, 0x65, 0xca, 0x89, 0x0f, 0x1e, 0x3c, 0x78, 0xf0, 0xfd, 0xe7, 0xd3, 0xbb, 0x6b, 0xd6, 0xb1, 0x7f, 0xfe, 0xe1, 0xdf, 0xa3, 0x5b, 0xb6, 0x71, 0xe2, 0xd9, 0xaf, 0x43, 0x86, 0x11, 0x22, 0x44, 0x88, 0x0d, 0x1a, 0x34, 0x68, 0xd0, 0xbd, 0x67, 0xce, 0x81, 0x1f, 0x3e, 0x7c, 0xf8, 0xed, 0xc7, 0x93, 0x3b, 0x76, 0xec, 0xc5, 0x97, 0x33, 0x66, 0xcc, 0x85, 0x17, 0x2e, 0x5c, 0xb8, 0x6d, 0xda, 0xa9, 0x4f, 0x9e, 0x21, 0x42, 0x84, 0x15, 0x2a, 0x54, 0xa8, 0x4d, 0x9a, 0x29, 0x52, 0xa4, 0x55, 0xaa, 0x49, 0x92, 0x39, 0x72, 0xe4, 0xd5, 0xb7, 0x73, 0xe6, 0xd1, 0xbf, 0x63, 0xc6, 0x91, 0x3f, 0x7e, 0xfc, 0xe5, 0xd7, 0xb3, 0x7b, 0xf6, 0xf1, 0xff, 0xe3, 0xdb, 0xab, 0x4b, 0x96, 0x31, 0x62, 0xc4, 0x95, 0x37, 0x6e, 0xdc, 0xa5, 0x57, 0xae, 0x41, 0x82, 0x19, 0x32, 0x64, 0xc8, 0x8d, 0x07, 0x0e, 0x1c, 0x38, 0x70, 0xe0, 0xdd, 0xa7, 0x53, 0xa6, 0x51, 0xa2, 0x59, 0xb2, 0x79, 0xf2, 0xf9, 0xef, 0xc3, 0x9b, 0x2b, 0x56, 0xac, 0x45, 0x8a, 0x09, 0x12, 0x24, 0x48, 0x90, 0x3d, 0x7a, 0xf4, 0xf5, 0xf7, 0xf3, 0xfb, 0xeb, 0xcb, 0x8b, 0x0b, 0x16, 0x2c, 0x58, 0xb0, 0x7d, 0xfa, 0xe9, 0xcf, 0x83, 0x1b, 0x36, 0x6c, 0xd8, 0xad, 0x47, 0x8e, 0x01]
    public static LOG_TABLE: number[] = new Array(256).fill(0);
    // Инициализация таблиц (выполняется один раз при первом использовании класса)
    private static initialized = false;
    
    private static initializeTables() {
        if (this.initialized) return;
    
        for (let k = 1; k < 255; k++) {
            const x = this.EXP_TABLE[k]; // x = αᵏ
            this.LOG_TABLE[x] = k; // log(x) = k
        }

        this.initialized = true
    }

    /**
     * Сложение в поле Галуа (это просто XOR)
     * @param a Первый элемент
     * @param b Второй элемент
     * @returns Результат сложения a + b в GF(256)
    */
    static add(a: number, b: number): number {
        return a ^ b;
    }

    /**
     * Умножение в поле Галуа
     * @param a Первый элемент
     * @param b Второй элемент
     * @returns Результат умножения a * b в GF(256)
    */
    static multiply(a: number, b: number): number {
        this.initializeTables()
        if (a === 0 || b === 0) return 0;
        const logA = this.LOG_TABLE[a];
        const logB = this.LOG_TABLE[b];
        const logSum = (logA + logB) % 255;
        return this.EXP_TABLE[logSum];
    }

    /**
     * Возведение в степень в поле Галуа
     * @param a Основание
     * @param power Показатель степени
     * @returns Результат a^power в GF(256)
     */
    static pow(a: number, power: number): number {
        this.initializeTables();
        if (power === 0) return 1;
        if (a === 0) return 0;
        const logA = this.LOG_TABLE[a];
        const logResult = (logA * power) % 255;
        return this.EXP_TABLE[(logResult + 255) % 255]; // безопасно для отрицательных n
    }

    /**
     * Деление в поле Галуа
     * @param a Делимое
     * @param b Делитель
     * @returns Результат деления a / b в GF(256)
    */
    static divide(a: number, b: number): number {
        this.initializeTables()
        if (b === 0) throw new Error("Деление на ноль");
        if (a === 0) return 0;
                
        const logA = this.LOG_TABLE[a];
        const logB = this.LOG_TABLE[b];
        const logResult = (logA - logB + 255) % 255;
        
        return this.EXP_TABLE[logResult];
    }

    /**
     * Умножает два полинома в GF(256)
     * @param polyA Коэффициенты первого полинома (от старшей степени к младшей)
     * @param polyB Коэффициенты второго полинома
     * @returns Коэффициенты произведения полиномов
     */
    static multiplyPolynomials(polyA: number[], polyB: number[]): number[] {
        const resultDegree = polyA.length + polyB.length - 2;
        const result = new Array(resultDegree + 1).fill(0);

        for (let i = 0; i < polyA.length; i++) {
            for (let j = 0; j < polyB.length; j++) {
                const coeff = GF256.multiply(polyA[i], polyB[j]);
                result[i + j] = GF256.add(result[i + j], coeff);
            }
        }

        return result;
    }

    /**
     * Находит остаток от деления полинома dividend на divisor в GF(256)
     * @param dividend Делимое (коэффициенты от старшей степени к младшей)
     * @param divisor Делитель (коэффициенты от старшей степени к младшей)
     * @returns Остаток от деления (коэффициенты от старшей степени к младшей)
    */
    static polynomialMod(dividend: number[], divisor: number[]): number[] {
        // Создаем копии и удаляем ведущие нули
        let remainder = [...dividend];
        let cleanDivisor = [...divisor];
        
        while (remainder.length > 1 && remainder[0] === 0) remainder.shift();
        while (cleanDivisor.length > 1 && cleanDivisor[0] === 0) cleanDivisor.shift();
    
        // Проверка особых случаев
        if (cleanDivisor.length === 0) throw new Error("Деление на нуль");
        if (remainder.length < cleanDivisor.length) return remainder;
    
        const divisorLeadingTerm = cleanDivisor[0];
    
        // Основной алгоритм
        while (remainder.length >= cleanDivisor.length) {
            const degreeDiff = remainder.length - cleanDivisor.length;
            const leadingTerm = remainder[0];
    
            // Вычисляем множитель
            const factor = GF256.divide(leadingTerm, divisorLeadingTerm);
    
            // Вычитаем (XOR) умноженный делитель
            for (let i = 0; i < cleanDivisor.length; i++) {
                remainder[i] = GF256.add(remainder[i], GF256.multiply(cleanDivisor[i], factor));
            }
    
            // Удаляем ведущий ноль
            remainder.shift();
    
            // Защита от бесконечного цикла
            if (degreeDiff === 0) break;
        }
    
        return remainder.length === 0 ? [0] : remainder;
    }

    /**
     * Вычисляет значение полинома в точке x в поле GF(256)
     * @param coefficients Коэффициенты полинома от старшей степени к младшей
     * @param x Точка, в которой вычисляем значение
     * @returns Значение полинома в точке x
     */
    static evaluatePolynomial(coefficients: number[], x: number): number {
        // Инициализируем результат нулём поля GF(256)
        let result = 0;
        
        // Проходим по всем коэффициентам (от старшей степени к младшей)
        for (const coeff of coefficients) {
            // Умножаем текущий результат на x в поле GF(256)
            result = GF256.multiply(result, x);
            // Прибавляем (XOR) текущий коэффициент
            result = GF256.add(result, coeff);
        }
        
        return result;
    }
    
    /**
     * Возведение в степень в GF(256)
     * @param base Основание
     * @param exponent Показатель степени
     * @returns base^exponent в GF(256)
     */
    static gfPow(base: number, exponent: number): number {
        if (exponent === 0) return 1;
        if (base === 0) return 0;
        
        let result = 1;
        for (let i = 0; i < exponent; i++) {
            result = this.multiply(result, base); // Используем GF(256) умножение
        }
        return result;
    }

    /**
     * Алгоритм Берлекэмпа-Мэсси для нахождения полинома локаторов ошибок
     * @param syndromes Полином синдромов [S1, S2, ..., S2t]
     * @param t Количество исправляемых ошибок (избыточных символов)
     * @returns Полином локаторов ошибок (младшая степень первая)
     */
    public static berlekampMassey(syndromes: number[]): number[] {
        let C = [1]; // Полином локатора ошибок
        let B = [1];
        let L = 0;
        let m = 1;
        let b = 1;
    
        for (let n = 0; n < syndromes.length; n++) {
            let d = syndromes[n];
            for (let i = 1; i <= L; i++) {
                d ^= this.multiply(C[i], syndromes[n - i]);
            }
    
            if (d === 0) {
                m += 1;
            } else {
                const T = C.slice(); // копия C
    
                const coef = this.divide(d, b);
                const p = Array(m).fill(0).concat(B.map(c => this.multiply(c, coef)));
    
                // Расширение длины C при необходимости
                if (p.length > C.length) {
                    C = C.concat(Array(p.length - C.length).fill(0));
                }
    
                for (let i = 0; i < p.length; i++) {
                    C[i] ^= p[i];
                }
    
                if (2 * L <= n) {
                    L = n + 1 - L;
                    B = T;
                    b = d;
                    m = 1;
                } else {
                    m += 1;
                }
            }
        }
    
        return C;
    }
    

    /**
     * Находит позиции ошибок по полиному-локатору (алгоритм Ченя)
     * @param locator Полином локаторов ошибок [1, σ1, σ2, ...] (младшая степень первая)
     * @param messageLength Длина кодового слова (для определения диапазона проверки)
     * @returns Массив позиций ошибок (индексы символов)
     */
    public static findErrorPositions(locator: number[], messageLength: number): number[] {
        const errorPositions: number[] = [];
    
        for (let i = 0; i < messageLength; i++) {
            let sum = 0;
    
            for (let j = 0; j < locator.length; j++) {
                if (locator[j] !== 0) {
                    sum ^= this.multiply(locator[j], this.EXP_TABLE[(j * i) % 255]);
                }
            }
    
            if (sum === 0) {
                // Ошибка в позиции (messageLength - 1 - i)
                errorPositions.push(messageLength - 1 - i);
            }
        }    
        return errorPositions;
    }
    
    /**
     * Вспомогательная функция для быстрого возведения в степень
     * @param k число, возводимое в степень
     * @returns число в степени
     */
    public static exp(k: number): number {
        this.initializeTables()
        // Используем предвычисленную таблицу EXP_TABLE с учетом цикличности GF(256)
        return GF256.EXP_TABLE[k % 255];
    }


    /**
     * Вычисляет амплитуды ошибок
     * @param syndromes полином синдромов
     * @param errorLocator полином-локатор
     * @param errorPositions позиции ошибок
     * @param messageLength длина полученного сообщения, включая избыточные байты
     * @returns амплитуды ошибок
     */
    public static computeErrorMagnitudes(
        syndromes: number[],
        errorLocator: number[],
        errorPositions: number[],
        messageLength: number
      ): number[] {
        const t = errorLocator.length - 1;
      
        // Omega(x) = [S(x) * Λ(x)] mod x^t
        const xToT = new Array(t + 1).fill(0);
        xToT[0] = 1; // x^t в виде [1, 0, 0, ...] (от старшей к младшей)
      
        const product = GF256.multiplyPolynomials(syndromes, errorLocator);
        const omega = GF256.polynomialMod(product, xToT);
      
        const errorMagnitudes: number[] = [];
      
        for (const pos of errorPositions) {
            const i = messageLength - 1 - pos;
            const xi = GF256.EXP_TABLE[255 - i]; // α^{−i}
        
            // omega(xi)
            let omegaVal = 0;
            for (let j = 0; j < omega.length; j++) {
                omegaVal ^= GF256.multiply(omega[omega.length - 1 - j], GF256.pow(xi, j));
            }
        
            // locator'(xi)
            let locatorDeriv = 0;
            for (let j = 1; j < errorLocator.length; j += 2) {
                locatorDeriv ^= GF256.multiply(errorLocator[errorLocator.length - 1 - j], GF256.pow(xi, j - 1));
            }
        
            if (locatorDeriv === 0) {
                throw new Error("Производная локатора равна нулю — деление невозможно");
            }
        
            const magnitude = GF256.divide(omegaVal, locatorDeriv);
            errorMagnitudes.push(magnitude);
        }
      
        return errorMagnitudes;
    }
      
      
    
    
    // console.log("syndromes", JSON.stringify(syndromes))
    // console.log("errorLocator", JSON.stringify(errorLocator))
    // console.log("errorPositions", JSON.stringify(errorPositions))
    // console.log("errorMagnitudes", JSON.stringify(errorMagnitudes))

    /**
     * Исправляет ошибки
     * @param corrupted повреждённое сообщение
     * @param errorPositions позиции ошибок
     * @param errorMagnitudes амплитуды ошибок
     * @returns исправленное сообщение
     */
    public static correctMessage(
        corrupted: number[],
        errorPositions: number[],
        errorMagnitudes: number[],
    ): number[] {
        const corrected = [...corrupted];
    
        for (let i = 0; i < errorPositions.length; i++) {
        const pos = errorPositions[i];
        const mag = errorMagnitudes[i];
    
        // Исправляем: символ = символ ⊕ амплитуда ошибки
        corrected[pos] ^= mag;
        }
    
        return corrected;
    }
      
}