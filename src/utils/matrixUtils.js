/**
 * Matrix utility functions for parsing, validation, and formatting
 */

/**
 * Parses a matrix cell value to a number
 * Supports fractions (e.g., "1/2") and decimals
 */
export function parseMatrixCell(value) {
    const trimmed = value.trim();
    if (trimmed === '') return 0;

    if (trimmed.includes('/')) {
        const [num, den] = trimmed.split('/').map(s => parseFloat(s.trim()));
        if (isNaN(num) || isNaN(den) || den === 0) {
            throw new Error(`Invalid fraction: ${trimmed}`);
        }
        return num / den;
    }

    const num = parseFloat(trimmed);
    if (isNaN(num)) {
        throw new Error(`Invalid number: ${trimmed}`);
    }
    return num;
}

/**
 * Converts a matrix of strings to numbers
 */
export function parseMatrix(matrix) {
    return matrix.map(row => row.map(parseMatrixCell));
}

/**
 * Validates matrix dimensions
 */
export function validateDimensions(rows, cols, min = 1, max = 5) {
    return {
        rows: Math.max(min, Math.min(max, rows)),
        cols: Math.max(min, Math.min(max, cols))
    };
}

/**
 * Creates an empty matrix with given dimensions
 */
export function createEmptyMatrix(rows, cols, defaultValue = '0') {
    return Array(rows).fill(null).map(() => Array(cols).fill(defaultValue));
}

/**
 * Resize matrix to new dimensions, preserving existing values
 */
export function resizeMatrix(matrix, newRows, newCols) {
    if (!matrix || !Array.isArray(matrix)) {
        return Array(newRows).fill(null).map(() => Array(newCols).fill(''));
    }

    const result = Array(newRows).fill(null).map(() => Array(newCols).fill(''));

    const minRows = Math.min(matrix.length, newRows);
    const minCols = Math.min(matrix[0]?.length || 0, newCols);

    for (let i = 0; i < minRows; i++) {
        for (let j = 0; j < minCols; j++) {
            result[i][j] = matrix[i]?.[j] ?? '';
        }
    }

    return result;
}

/**
 * Formats a number for display in matrix cells
 */
export function formatMatrixCell(value) {
    if (typeof value !== 'number') return value;
    return Number.isInteger(value) ? value : value.toFixed(2);
}
