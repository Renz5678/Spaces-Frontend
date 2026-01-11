/**
 * Main Matrix Computation Engine
 * Orchestrates all matrix computations for the frontend
 */

import { computeAllSpaces } from './spaceCalculator.js';
import { parseMatrixCell } from './matrixUtils.js';

/**
 * Example matrices for quick testing
 */
export const EXAMPLE_MATRICES = [
    {
        name: "2×3 Matrix",
        description: "Simple rectangular matrix",
        matrix: [
            [1, 2, 3],
            [4, 5, 6]
        ]
    },
    {
        name: "3×3 Identity",
        description: "Full rank square matrix",
        matrix: [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]
    },
    {
        name: "3×3 Singular",
        description: "Rank-deficient matrix",
        matrix: [
            [1, 2, 3],
            [2, 4, 6],
            [3, 6, 9]
        ]
    },
    {
        name: "4×4 Mixed",
        description: "Larger matrix with fractions",
        matrix: [
            [1, 0, 2, 1],
            [0, 1, 1, 0],
            [2, 1, 5, 2],
            [1, 1, 4, 1]
        ]
    },
    {
        name: "Projection Matrix",
        description: "Rank 2 projection",
        matrix: [
            [1, 0, 1],
            [0, 1, 1],
            [1, 1, 2]
        ]
    }
];

/**
 * Parse matrix from string input
 * Handles various formats including fractions
 */
export function parseMatrixInput(matrixData) {
    try {
        return matrixData.map(row =>
            row.map(cell => {
                if (typeof cell === 'string') {
                    return parseMatrixCell(cell);
                }
                return cell;
            })
        );
    } catch (error) {
        throw new Error(`Failed to parse matrix: ${error.message}`);
    }
}

/**
 * Validate matrix dimensions
 */
export function validateMatrix(matrixData) {
    if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
        throw new Error('Matrix cannot be empty');
    }

    const rows = matrixData.length;
    const cols = matrixData[0]?.length || 0;

    if (cols === 0) {
        throw new Error('Matrix must have at least one column');
    }

    if (rows > 5 || cols > 5) {
        throw new Error('Matrix dimensions must be ≤ 5×5');
    }

    // Check all rows have same length
    if (!matrixData.every(row => Array.isArray(row) && row.length === cols)) {
        throw new Error('All rows must have the same number of columns');
    }

    // Check all values are numeric
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const val = matrixData[i][j];
            if (typeof val !== 'number' || !isFinite(val)) {
                throw new Error(`Invalid value at position (${i + 1}, ${j + 1})`);
            }
        }
    }

    return { rows, cols };
}

/**
 * Main computation function
 * Parses, validates, and computes all fundamental spaces
 */
export function computeMatrix(matrixData, trackOperations = true) {
    try {
        // Parse the matrix
        const parsed = parseMatrixInput(matrixData);

        // Validate
        validateMatrix(parsed);

        // Compute all spaces (with operation tracking)
        const results = computeAllSpaces(parsed, trackOperations);

        return {
            success: true,
            data: results
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get example matrices
 */
export function getExamples() {
    return {
        examples: EXAMPLE_MATRICES
    };
}
