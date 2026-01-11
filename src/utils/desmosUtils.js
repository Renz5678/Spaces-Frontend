/**
 * Desmos utility functions for converting matrix subspaces to Desmos expressions
 */

/**
 * Check if a matrix can be visualized (dimensions ≤ 3)
 */
export function canVisualize(results) {
    if (!results || !results.matrix) return false;
    const { rows, cols } = results.matrix;
    return rows <= 3 && cols <= 3;
}

/**
 * Determine if we should use 2D or 3D visualization
 */
export function getVisualizationDimension(results) {
    const { rows, cols } = results.matrix;
    const maxDim = Math.max(rows, cols);
    return maxDim <= 2 ? 2 : 3;
}

/**
 * Convert a basis vector to a Desmos point expression
 * For 2D: (x, y)
 * For 3D: (x, y, z)
 */
function vectorToPoint(vector) {
    if (vector.length === 2) {
        return `(${vector[0]}, ${vector[1]})`;
    } else if (vector.length === 3) {
        return `(${vector[0]}, ${vector[1]}, ${vector[2]})`;
    }
    return '';
}

/**
 * Create a parametric line expression for a vector
 * 2D: x = t*v1, y = t*v2
 * 3D: x = t*v1, y = t*v2, z = t*v3
 */
function vectorToParametricLine(vector, paramName = 't') {
    if (vector.length === 2) {
        return {
            latex: `(${paramName}\\cdot${vector[0]}, ${paramName}\\cdot${vector[1]})`,
            parametricDomain: { min: '-3', max: '3' }
        };
    } else if (vector.length === 3) {
        return {
            latex: `(${paramName}\\cdot${vector[0]}, ${paramName}\\cdot${vector[1]}, ${paramName}\\cdot${vector[2]})`,
            parametricDomain: { min: '-3', max: '3' }
        };
    }
    return null;
}

/**
 * Create a plane expression from two basis vectors (3D only)
 * Plane: P = s*v1 + t*v2
 */
function vectorsToPlane(v1, v2) {
    if (v1.length !== 3 || v2.length !== 3) return null;

    return {
        latex: `(s\\cdot${v1[0]}+t\\cdot${v2[0]}, s\\cdot${v1[1]}+t\\cdot${v2[1]}, s\\cdot${v1[2]}+t\\cdot${v2[2]})`,
        parametricDomain: { min: '-2', max: '2' }
    };
}

/**
 * Generate Desmos expressions for a subspace
 */
export function generateSubspaceExpressions(subspace, spaceName, color, idPrefix) {
    const expressions = [];
    const basis = subspace.basis;
    const dimension = subspace.dimension;

    if (dimension === 0) {
        // Trivial space - don't add anything to avoid clutter
        return expressions;
    }

    // Determine vector dimension
    const vectorDim = basis[0]?.values?.length || 0;

    if (vectorDim === 2) {
        // 2D visualization
        if (dimension === 1) {
            // 1D subspace in 2D: line through origin
            const vector = basis[0].values;
            const v1 = vector[0];
            const v2 = vector[1];

            // Parametric line: (t*v1, t*v2)
            expressions.push({
                id: `${idPrefix}_line`,
                latex: `(${v1}t, ${v2}t)`,
                color: color
            });

            // Add the basis vector as a point
            expressions.push({
                id: `${idPrefix}_point`,
                latex: `(${v1}, ${v2})`,
                color: color
            });
        } else if (dimension === 2) {
            // 2D subspace in 2D: entire plane (show basis vectors as points)
            basis.forEach((basisVec, idx) => {
                const vector = basisVec.values;
                const v1 = vector[0];
                const v2 = vector[1];
                expressions.push({
                    id: `${idPrefix}_vec${idx}`,
                    latex: `(${v1}, ${v2})`,
                    color: color
                });
            });
        }
    } else if (vectorDim === 3) {
        // 3D visualization - Note: Standard Desmos doesn't support 3D
        // We'll create 2D projections (x-y plane)
        if (dimension === 1) {
            // 1D subspace in 3D: show as 2D projection (x-y plane)
            const vector = basis[0].values;
            const v1 = vector[0];
            const v2 = vector[1];

            expressions.push({
                id: `${idPrefix}_line_xy`,
                latex: `(${v1}t, ${v2}t)`,
                color: color
            });

            expressions.push({
                id: `${idPrefix}_point_xy`,
                latex: `(${v1}, ${v2})`,
                color: color
            });
        } else if (dimension === 2) {
            // 2D subspace in 3D: show basis vectors in x-y projection
            basis.forEach((basisVec, idx) => {
                const vector = basisVec.values;
                const v1 = vector[0];
                const v2 = vector[1];
                expressions.push({
                    id: `${idPrefix}_vec${idx}_xy`,
                    latex: `(${v1}, ${v2})`,
                    color: color
                });
            });
        } else if (dimension === 3) {
            // 3D subspace in 3D: show basis vectors in x-y projection
            basis.forEach((basisVec, idx) => {
                const vector = basisVec.values;
                const v1 = vector[0];
                const v2 = vector[1];
                expressions.push({
                    id: `${idPrefix}_vec${idx}_xy`,
                    latex: `(${v1}, ${v2})`,
                    color: color
                });
            });
        }
    }

    return expressions;
}

/**
 * Generate all expressions for visualizing the four fundamental subspaces
 */
export function generateAllExpressions(results) {
    const expressions = [];

    // Color scheme
    const colors = {
        columnSpace: '#4F46E5', // Indigo
        rowSpace: '#10B981',    // Green
        nullSpace: '#EF4444',   // Red
        leftNullSpace: '#8B5CF6' // Purple
    };

    // Column Space
    const columnExprs = generateSubspaceExpressions(
        results.column_space,
        'C(A)',
        colors.columnSpace,
        'col'
    );
    expressions.push(...columnExprs);

    // Row Space
    const rowExprs = generateSubspaceExpressions(
        results.row_space,
        'C(A^T)',
        colors.rowSpace,
        'row'
    );
    expressions.push(...rowExprs);

    // Null Space
    const nullExprs = generateSubspaceExpressions(
        results.null_space,
        'N(A)',
        colors.nullSpace,
        'null'
    );
    expressions.push(...nullExprs);

    // Left Null Space
    const leftNullExprs = generateSubspaceExpressions(
        results.left_null_space,
        'N(A^T)',
        colors.leftNullSpace,
        'leftnull'
    );
    expressions.push(...leftNullExprs);

    return expressions;
}

/**
 * Get appropriate viewport bounds based on dimension
 */
export function getViewportBounds(dimension) {
    if (dimension === 2) {
        return {
            left: -5,
            right: 5,
            bottom: -5,
            top: 5
        };
    } else {
        return {
            left: -5,
            right: 5,
            bottom: -5,
            top: 5,
            zmin: -5,
            zmax: 5
        };
    }
}
