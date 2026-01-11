import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { parseMatrix, validateDimensions, createEmptyMatrix, resizeMatrix } from '../utils/matrixUtils';
import { MATRIX_LIMITS } from '../constants';
import './MatrixInput.css';

/**
 * Matrix input component with dynamic grid and dimension controls
 */
const MatrixInput = ({ onCompute, isLoading, examples, initialMatrix }) => {
    const [rows, setRows] = useState(MATRIX_LIMITS.DEFAULT_ROWS);
    const [cols, setCols] = useState(MATRIX_LIMITS.DEFAULT_COLS);
    const [matrix, setMatrix] = useState(
        Array(MATRIX_LIMITS.DEFAULT_ROWS).fill(null).map(() =>
            Array(MATRIX_LIMITS.DEFAULT_COLS).fill('')
        )
    );
    const [computeSuccess, setComputeSuccess] = useState(false);
    const computeButtonRef = useRef(null);

    useEffect(() => {
        if (initialMatrix && initialMatrix.length > 0) {
            const initRows = initialMatrix.length;
            const initCols = initialMatrix[0]?.length || 0;
            setRows(initRows);
            setCols(initCols);
            setMatrix(initialMatrix.map(row => row.map(v => String(v))));
        }
    }, [initialMatrix]);

    // Reset success state when loading completes
    useEffect(() => {
        if (!isLoading && computeSuccess) {
            const timer = setTimeout(() => setComputeSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, computeSuccess]);

    const handleDimensionChange = useCallback((newRows, newCols) => {
        const validated = validateDimensions(
            newRows,
            newCols,
            MATRIX_LIMITS.MIN_DIMENSION,
            MATRIX_LIMITS.MAX_DIMENSION
        );

        setRows(validated.rows);
        setCols(validated.cols);

        // Use functional update to ensure we're working with latest state
        setMatrix(prev => {
            const resized = resizeMatrix(prev, validated.rows, validated.cols);
            return resized;
        });
    }, []);

    const handleCellChange = useCallback((i, j, value) => {
        setMatrix(prev => prev.map((row, ri) =>
            row.map((cell, ci) => (ri === i && ci === j) ? value : cell)
        ));
    }, []);

    const handleSubmit = useCallback(async () => {
        try {
            const numericMatrix = parseMatrix(matrix);
            setComputeSuccess(false);

            // Add button press animation
            if (computeButtonRef.current) {
                computeButtonRef.current.classList.add('btn-pressed');
                setTimeout(() => {
                    computeButtonRef.current?.classList.remove('btn-pressed');
                }, 200);
            }

            // Await computation
            const result = await onCompute(numericMatrix);

            // Show success state if computation succeeded
            if (result) {
                setComputeSuccess(true);

                // Smooth scroll to results with better timing
                setTimeout(() => {
                    const resultsElement = document.querySelector('.results-container');
                    if (resultsElement) {
                        const yOffset = -20; // Offset from top
                        const y = resultsElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

                        window.scrollTo({
                            top: y,
                            behavior: 'smooth'
                        });
                    }
                }, 400); // Slightly longer delay for smoother experience
            }
        } catch (error) {
            alert(error.message);
        }
    }, [matrix, onCompute]);

    const loadExample = useCallback((example) => {
        const exampleMatrix = example.matrix;
        const exampleRows = exampleMatrix.length;
        const exampleCols = exampleMatrix[0].length;

        setRows(exampleRows);
        setCols(exampleCols);
        setMatrix(exampleMatrix.map(row => row.map(v => String(v))));
    }, []);

    const clearMatrix = useCallback(() => {
        setMatrix(Array(rows).fill(null).map(() => Array(cols).fill('')));
    }, [rows, cols]);

    const fillZeros = useCallback(() => {
        setMatrix(prev => prev.map(row =>
            row.map(cell => cell.trim() === '' ? '0' : cell)
        ));
    }, []);

    const gridStyle = useMemo(() => ({
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
    }), [rows, cols]);

    return (
        <div className="matrix-input-container">
            <div className="matrix-controls">
                <div className="dimension-control">
                    <label>
                        Rows:
                        <input
                            type="number"
                            min={MATRIX_LIMITS.MIN_DIMENSION}
                            max={MATRIX_LIMITS.MAX_DIMENSION}
                            value={rows}
                            onChange={(e) => handleDimensionChange(parseInt(e.target.value) || 1, cols)}
                            disabled={isLoading}
                        />
                    </label>
                    <label>
                        Columns:
                        <input
                            type="number"
                            min={MATRIX_LIMITS.MIN_DIMENSION}
                            max={MATRIX_LIMITS.MAX_DIMENSION}
                            value={cols}
                            onChange={(e) => handleDimensionChange(rows, parseInt(e.target.value) || 1)}
                            disabled={isLoading}
                        />
                    </label>
                </div>

                {examples && examples.length > 0 && (
                    <div className="examples-dropdown">
                        <select
                            onChange={(e) => {
                                const idx = parseInt(e.target.value);
                                if (!isNaN(idx) && examples[idx]) {
                                    loadExample(examples[idx]);
                                }
                            }}
                            defaultValue=""
                            disabled={isLoading}
                        >
                            <option value="" disabled>Load example...</option>
                            {examples.map((ex, idx) => (
                                <option key={idx} value={idx}>{ex.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="matrix-grid-wrapper">
                <div className="bracket left">[</div>
                <div className={`matrix-grid ${isLoading ? 'computing' : ''}`} style={gridStyle}>
                    {matrix.map((row, i) =>
                        row.map((cell, j) => (
                            <input
                                key={`${i}-${j}`}
                                type="text"
                                className="matrix-cell"
                                value={cell}
                                onChange={(e) => handleCellChange(i, j, e.target.value)}
                                placeholder="0"
                                disabled={isLoading}
                            />
                        ))
                    )}
                </div>
                <div className="bracket right">]</div>
            </div>

            <div className="matrix-actions">
                <button
                    ref={computeButtonRef}
                    className={`btn btn-primary ${isLoading ? 'loading' : ''} ${computeSuccess ? 'success' : ''}`}
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
                            </svg>
                            <span>Computing...</span>
                        </>
                    ) : computeSuccess ? (
                        <>
                            <svg className="checkmark" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Complete!</span>
                        </>
                    ) : (
                        'Compute Subspaces'
                    )}
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={clearMatrix}
                    disabled={isLoading}
                >
                    Clear
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={fillZeros}
                    disabled={isLoading}
                    title="Fill all blank cells with zeros"
                >
                    Fill Zeros
                </button>
            </div>
        </div>
    );
};

export default MatrixInput;
