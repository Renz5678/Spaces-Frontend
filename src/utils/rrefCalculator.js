/**
 * RREF (Row Reduced Echelon Form) Calculator
 * Implements Gaussian elimination with partial pivoting
 */

import { Fraction } from './fractionUtils.js';

/**
 * Matrix class for exact arithmetic operations
 */
export class Matrix {
    constructor(data) {
        // Convert all elements to Fractions
        this.data = data.map(row =>
            row.map(val => Fraction.from(val))
        );
        this.rows = this.data.length;
        this.cols = this.data[0]?.length || 0;
    }

    /**
     * Get element at position (i, j)
     */
    get(i, j) {
        return this.data[i][j];
    }

    /**
     * Set element at position (i, j)
     */
    set(i, j, value) {
        this.data[i][j] = Fraction.from(value);
    }

    /**
     * Create a copy of the matrix
     */
    clone() {
        const newData = this.data.map(row => [...row]);
        const matrix = Object.create(Matrix.prototype);
        matrix.data = newData;
        matrix.rows = this.rows;
        matrix.cols = this.cols;
        return matrix;
    }

    /**
     * Swap two rows
     */
    swapRows(i, j) {
        [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    }

    /**
     * Multiply a row by a scalar
     */
    multiplyRow(i, scalar) {
        const frac = Fraction.from(scalar);
        for (let j = 0; j < this.cols; j++) {
            this.data[i][j] = this.data[i][j].multiply(frac);
        }
    }

    /**
     * Add a multiple of one row to another: row[i] += scalar * row[j]
     */
    addRowMultiple(i, j, scalar) {
        const frac = Fraction.from(scalar);
        for (let k = 0; k < this.cols; k++) {
            this.data[i][k] = this.data[i][k].add(this.data[j][k].multiply(frac));
        }
    }

    /**
     * Convert to plain JavaScript array
     */
    toArray() {
        return this.data.map(row => row.map(f => f.toNumber()));
    }

    /**
     * Convert to nested array of fractions
     */
    toFractionArray() {
        return this.data.map(row => [...row]);
    }

    /**
     * Convert to LaTeX format
     */
    toLatex() {
        const rows = this.data.map(row =>
            row.map(f => f.toLatex()).join(' & ')
        ).join(' \\\\ ');
        return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
    }

    /**
     * Get transpose of the matrix
     */
    transpose() {
        const transposed = Array(this.cols).fill(null).map(() =>
            Array(this.rows).fill(null)
        );

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                transposed[j][i] = this.data[i][j];
            }
        }

        const matrix = Object.create(Matrix.prototype);
        matrix.data = transposed;
        matrix.rows = this.cols;
        matrix.cols = this.rows;
        return matrix;
    }
}

/**
 * Compute RREF and pivot columns with operation tracking
 * Returns { rref: Matrix, pivots: number[], operations: Operation[] }
 */
export function computeRREF(matrix, trackOperations = false) {
    const m = matrix.clone();
    const pivots = [];
    const operations = trackOperations ? [] : null;
    let currentRow = 0;

    // Helper to record operation
    const recordOperation = (type, notation, description, params) => {
        if (!trackOperations) return;
        operations.push({
            type,
            notation,
            description,
            params,
            matrixBefore: m.clone(),
        });
    };

    // Helper to update last operation with result
    const updateLastOperation = () => {
        if (!trackOperations || operations.length === 0) return;
        operations[operations.length - 1].matrixAfter = m.clone();
    };

    for (let col = 0; col < m.cols && currentRow < m.rows; col++) {
        // Find pivot (largest absolute value in column)
        let pivotRow = currentRow;
        let maxVal = Math.abs(m.get(currentRow, col).toNumber());

        for (let row = currentRow + 1; row < m.rows; row++) {
            const val = Math.abs(m.get(row, col).toNumber());
            if (val > maxVal) {
                maxVal = val;
                pivotRow = row;
            }
        }

        // Skip if column is all zeros
        if (m.get(pivotRow, col).isZero()) {
            continue;
        }

        // Swap rows if needed
        if (pivotRow !== currentRow) {
            const notation = `E_{${currentRow + 1}${pivotRow + 1}}`;
            const description = `Swap row ${currentRow + 1} and row ${pivotRow + 1}`;
            recordOperation('swap', notation, description, {
                row1: currentRow,
                row2: pivotRow
            });
            m.swapRows(currentRow, pivotRow);
            updateLastOperation();
        }

        // Scale pivot row to make pivot = 1
        const pivot = m.get(currentRow, col);
        const pivotFraction = pivot instanceof Fraction ? pivot : Fraction.from(pivot);
        const one = new Fraction(1, 1);

        if (!pivotFraction.equals(one)) {
            const scalar = one.divide(pivotFraction);
            const notation = `E_{(${scalar.toLatex()})}^{${currentRow + 1}}`;
            const description = `Multiply row ${currentRow + 1} by ${scalar.toLatex()}`;
            recordOperation('scale', notation, description, {
                row: currentRow,
                scalar: scalar
            });
            m.multiplyRow(currentRow, scalar);
            updateLastOperation();
        }

        // Eliminate all other entries in this column
        for (let row = 0; row < m.rows; row++) {
            if (row !== currentRow && !m.get(row, col).isZero()) {
                const factor = m.get(row, col).negate();
                const notation = `E_{(${factor.toLatex()})}^{${row + 1}${currentRow + 1}}`;
                const description = `Multiply row ${currentRow + 1} by ${factor.toLatex()} and add to row ${row + 1}`;
                recordOperation('add', notation, description, {
                    targetRow: row,
                    sourceRow: currentRow,
                    scalar: factor
                });
                m.addRowMultiple(row, currentRow, factor);
                updateLastOperation();
            }
        }

        pivots.push(col);
        currentRow++;
    }

    return { rref: m, pivots, operations };
}

/**
 * Compute rank of a matrix
 */
export function computeRank(matrix) {
    const { pivots } = computeRREF(matrix);
    return pivots.length;
}

/**
 * Check if a row is all zeros
 */
export function isZeroRow(matrix, rowIndex) {
    for (let j = 0; j < matrix.cols; j++) {
        if (!matrix.get(rowIndex, j).isZero()) {
            return false;
        }
    }
    return true;
}

/**
 * Get non-zero rows from a matrix
 */
export function getNonZeroRows(matrix) {
    const rows = [];
    for (let i = 0; i < matrix.rows; i++) {
        if (!isZeroRow(matrix, i)) {
            rows.push(matrix.data[i]);
        }
    }
    return rows;
}
