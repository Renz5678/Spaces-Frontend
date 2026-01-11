/**
 * Fraction utilities for exact arithmetic in matrix computations
 * Avoids floating-point precision errors
 */

/**
 * Represents a rational number as a fraction
 */
export class Fraction {
    constructor(numerator, denominator = 1) {
        if (denominator === 0) {
            throw new Error('Denominator cannot be zero');
        }

        // Handle negative denominators
        if (denominator < 0) {
            numerator = -numerator;
            denominator = -denominator;
        }

        const gcd = this.gcd(Math.abs(numerator), Math.abs(denominator));
        this.numerator = numerator / gcd;
        this.denominator = denominator / gcd;
    }

    /**
     * Greatest Common Divisor using Euclidean algorithm
     */
    gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    /**
     * Add two fractions
     */
    add(other) {
        const num = this.numerator * other.denominator + other.numerator * this.denominator;
        const den = this.denominator * other.denominator;
        return new Fraction(num, den);
    }

    /**
     * Subtract two fractions
     */
    subtract(other) {
        const num = this.numerator * other.denominator - other.numerator * this.denominator;
        const den = this.denominator * other.denominator;
        return new Fraction(num, den);
    }

    /**
     * Multiply two fractions
     */
    multiply(other) {
        return new Fraction(
            this.numerator * other.numerator,
            this.denominator * other.denominator
        );
    }

    /**
     * Divide two fractions
     */
    divide(other) {
        if (other.numerator === 0) {
            throw new Error('Division by zero');
        }
        return new Fraction(
            this.numerator * other.denominator,
            this.denominator * other.numerator
        );
    }

    /**
     * Negate the fraction
     */
    negate() {
        return new Fraction(-this.numerator, this.denominator);
    }

    /**
     * Check if fraction is zero
     */
    isZero() {
        return this.numerator === 0;
    }

    /**
     * Check if two fractions are equal
     */
    equals(other) {
        if (!(other instanceof Fraction)) {
            return false;
        }
        return this.numerator === other.numerator && this.denominator === other.denominator;
    }

    /**
     * Convert to decimal number
     */
    toNumber() {
        return this.numerator / this.denominator;
    }

    /**
     * Convert to display string
     */
    toString() {
        if (this.denominator === 1) {
            return this.numerator.toString();
        }
        return `${this.numerator}/${this.denominator}`;
    }

    /**
     * Convert to LaTeX format
     */
    toLatex() {
        if (this.denominator === 1) {
            return this.numerator.toString();
        }
        if (this.numerator < 0) {
            return `-\\frac{${Math.abs(this.numerator)}}{${this.denominator}}`;
        }
        return `\\frac{${this.numerator}}{${this.denominator}}`;
    }

    /**
     * Create fraction from string (supports "1/2", "3", "0.5")
     */
    static fromString(str) {
        const trimmed = str.trim();

        if (trimmed.includes('/')) {
            const [num, den] = trimmed.split('/').map(s => parseFloat(s.trim()));
            if (isNaN(num) || isNaN(den)) {
                throw new Error(`Invalid fraction: ${str}`);
            }
            return new Fraction(num, den);
        }

        const num = parseFloat(trimmed);
        if (isNaN(num)) {
            throw new Error(`Invalid number: ${str}`);
        }

        // Convert decimal to fraction
        return Fraction.fromDecimal(num);
    }

    /**
     * Convert decimal to fraction with reasonable precision
     */
    static fromDecimal(decimal, maxDenominator = 10000) {
        if (Number.isInteger(decimal)) {
            return new Fraction(decimal, 1);
        }

        const sign = decimal < 0 ? -1 : 1;
        decimal = Math.abs(decimal);

        let bestNumerator = 1;
        let bestDenominator = 1;
        let bestError = Math.abs(decimal - 1);

        for (let denominator = 1; denominator <= maxDenominator; denominator++) {
            const numerator = Math.round(decimal * denominator);
            const error = Math.abs(decimal - numerator / denominator);

            if (error < bestError) {
                bestNumerator = numerator;
                bestDenominator = denominator;
                bestError = error;

                if (error < 1e-10) break;
            }
        }

        return new Fraction(sign * bestNumerator, bestDenominator);
    }

    /**
     * Create fraction from number or string
     */
    static from(value) {
        if (value instanceof Fraction) {
            return value;
        }
        if (typeof value === 'string') {
            return Fraction.fromString(value);
        }
        if (typeof value === 'number') {
            return Fraction.fromDecimal(value);
        }
        throw new Error(`Cannot convert ${typeof value} to Fraction`);
    }
}
