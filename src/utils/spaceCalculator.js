/**
 * Four Fundamental Subspaces Calculator
 * Computes: Column Space, Row Space, Null Space, Left Null Space
 */

import { Matrix, computeRREF, getNonZeroRows } from './rrefCalculator.js';
import { Fraction } from './fractionUtils.js';

/**
 * Compute the column space (range) of a matrix
 * Returns basis vectors as columns from the original matrix
 */
export function computeColumnSpace(matrix) {
    const { pivots } = computeRREF(matrix);
    const basis = [];

    // The pivot columns of the original matrix form a basis for the column space
    for (const col of pivots) {
        const vector = [];
        for (let i = 0; i < matrix.rows; i++) {
            vector.push(matrix.get(i, col));
        }
        basis.push(vector);
    }

    return basis;
}

/**
 * Compute the row space of a matrix
 * Returns basis vectors as the non-zero rows of RREF
 */
export function computeRowSpace(matrix) {
    const { rref } = computeRREF(matrix);
    const nonZeroRows = getNonZeroRows(rref);
    return nonZeroRows;
}

/**
 * Compute the null space (kernel) of a matrix
 * Returns basis vectors such that Ax = 0
 */
export function computeNullSpace(matrix) {
    const { rref, pivots } = computeRREF(matrix);
    const n = matrix.cols;

    // Find free variables (non-pivot columns)
    const freeVars = [];
    for (let j = 0; j < n; j++) {
        if (!pivots.includes(j)) {
            freeVars.push(j);
        }
    }

    // If no free variables, null space is trivial
    if (freeVars.length === 0) {
        return [];
    }

    const basis = [];

    // For each free variable, create a basis vector
    for (const freeVar of freeVars) {
        const vector = Array(n).fill(null).map(() => new Fraction(0));
        vector[freeVar] = new Fraction(1); // Set free variable to 1

        // Solve for pivot variables
        for (let i = pivots.length - 1; i >= 0; i--) {
            const pivotCol = pivots[i];
            let sum = new Fraction(0);

            // Sum up contributions from variables to the right
            for (let j = pivotCol + 1; j < n; j++) {
                sum = sum.add(rref.get(i, j).multiply(vector[j]));
            }

            vector[pivotCol] = sum.negate();
        }

        basis.push(vector);
    }

    return basis;
}

/**
 * Compute the left null space of a matrix
 * Returns basis vectors such that A^T y = 0
 */
export function computeLeftNullSpace(matrix) {
    const transposed = matrix.transpose();
    return computeNullSpace(transposed);
}

/**
 * Format a vector as LaTeX
 */
function vectorToLatex(vector) {
    const elements = vector.map(f => {
        if (f instanceof Fraction) {
            return f.toLatex();
        }
        const frac = Fraction.from(f);
        return frac.toLatex();
    }).join(' \\\\ ');

    return `\\begin{bmatrix} ${elements} \\end{bmatrix}`;
}

/**
 * Format basis vectors for output
 */
function formatBasis(basis) {
    const basisValues = basis.map(vector =>
        vector.map(f => {
            if (f instanceof Fraction) {
                return f.toNumber();
            }
            return Fraction.from(f).toNumber();
        })
    );

    const latexVectors = basis.map(vector => vectorToLatex(vector));

    return {
        basis: basisValues,
        latex: latexVectors
    };
}

/**
 * Compute all four fundamental subspaces
 */
export function computeAllSpaces(matrixData, trackOperations = false) {
    // Validate input
    if (!matrixData || !Array.isArray(matrixData) || matrixData.length === 0) {
        throw new Error('Matrix cannot be empty');
    }

    if (!matrixData.every(row => Array.isArray(row) && row.length === matrixData[0].length)) {
        throw new Error('All rows must have the same number of columns');
    }

    const m = matrixData.length;
    const n = matrixData[0].length;

    if (m > 5 || n > 5) {
        throw new Error('Matrix dimensions must be ≤ 5×5');
    }

    // Create matrix
    const matrix = new Matrix(matrixData);

    // Compute RREF and rank (with operation tracking)
    const { rref, pivots, operations } = computeRREF(matrix, trackOperations);
    const rank = pivots.length;

    // Compute all spaces
    const columnSpace = computeColumnSpace(matrix);
    const rowSpace = computeRowSpace(matrix);
    const nullSpace = computeNullSpace(matrix);
    const leftNullSpace = computeLeftNullSpace(matrix);

    // Format results
    const columnSpaceFormatted = formatBasis(columnSpace);
    const rowSpaceFormatted = formatBasis(rowSpace);
    const nullSpaceFormatted = formatBasis(nullSpace);
    const leftNullSpaceFormatted = formatBasis(leftNullSpace);

    const result = {
        matrix: {
            data: matrix.toArray(),
            rows: m,
            cols: n,
            latex: matrix.toLatex()
        },
        rank,
        rref: {
            matrix: rref.toArray(),
            latex: rref.toLatex(),
            pivots: pivots
        },
        column_space: {
            basis: columnSpaceFormatted.basis,
            latex: columnSpaceFormatted.latex,
            dimension: columnSpace.length,
            description: `Subspace of R^${m}`
        },
        row_space: {
            basis: rowSpaceFormatted.basis,
            latex: rowSpaceFormatted.latex,
            dimension: rowSpace.length,
            description: `Subspace of R^${n}`
        },
        null_space: {
            basis: nullSpaceFormatted.basis,
            latex: nullSpaceFormatted.latex,
            dimension: nullSpace.length,
            description: `Subspace of R^${n}`
        },
        left_null_space: {
            basis: leftNullSpaceFormatted.basis,
            latex: leftNullSpaceFormatted.latex,
            dimension: leftNullSpace.length,
            description: `Subspace of R^${m}`
        },
        dimension_check: {
            rank_plus_nullity: `${rank} + ${n - rank} = ${n} (columns)`,
            rank_plus_left_nullity: `${rank} + ${m - rank} = ${m} (rows)`,
            valid: (
                columnSpace.length === rank &&
                rowSpace.length === rank &&
                nullSpace.length === n - rank &&
                leftNullSpace.length === m - rank
            )
        }
    };

    // Add operations if tracking was enabled
    if (trackOperations && operations) {
        result.operations = operations;
    }

    return result;
}
