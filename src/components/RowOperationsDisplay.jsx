import { useState, memo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './RowOperationsDisplay.css';

/**
 * Component to display step-by-step elementary row operations
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const RowOperationsDisplay = memo(({ operations }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    if (!operations || operations.length === 0) {
        return (
            <div className="row-operations-empty">
                <p>No row operations needed - matrix is already in RREF form.</p>
            </div>
        );
    }

    const renderMatrix = (matrix) => {
        if (!matrix) return null;

        try {
            const latex = matrix.toLatex();
            const html = katex.renderToString(latex, {
                throwOnError: false,
                displayMode: true
            });
            return <div dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (error) {
            return <div className="error">Error rendering matrix</div>;
        }
    };

    const LaTeXNotation = ({ latex }) => {
        try {
            const html = katex.renderToString(latex, {
                throwOnError: false,
                displayMode: false
            });
            return <span dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (error) {
            return <span>{latex}</span>;
        }
    };

    const renderDescription = (description) => {
        // Split description by LaTeX patterns (e.g., \frac{1}{2}, -\frac{3}{4})
        // Match LaTeX commands like \frac{...}{...}
        const latexPattern = /(\\frac\{[^}]+\}\{[^}]+\}|-?\\frac\{[^}]+\}\{[^}]+\})/g;
        const parts = description.split(latexPattern);

        return (
            <span>
                {parts.map((part, index) => {
                    // Check if this part is a LaTeX expression
                    if (part && part.includes('\\frac')) {
                        return <LaTeXNotation key={index} latex={part} />;
                    }
                    return <span key={index}>{part}</span>;
                })}
            </span>
        );
    };

    const currentOperation = operations[currentStep];

    return (
        <div className="row-operations-container">
            <div className="row-operations-header">
                <button
                    className="toggle-button"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? '▼' : '▶'} Step-by-Step Row Operations ({operations.length} steps)
                </button>
            </div>

            {isExpanded && (
                <div className="row-operations-content">
                    <div className="step-controls">
                        <button
                            className="step-button"
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                        >
                            ← Previous
                        </button>
                        <span className="step-indicator">
                            Step {currentStep + 1} of {operations.length}
                        </span>
                        <button
                            className="step-button"
                            onClick={() => setCurrentStep(Math.min(operations.length - 1, currentStep + 1))}
                            disabled={currentStep === operations.length - 1}
                        >
                            Next →
                        </button>
                    </div>

                    <div className="operation-display">
                        <div className="operation-header">
                            <span className={`operation-badge operation-${currentOperation.type}`}>
                                <LaTeXNotation latex={currentOperation.notation} />
                            </span>
                            <span className="operation-description">
                                {renderDescription(currentOperation.description)}
                            </span>
                        </div>

                        <div className="matrices-comparison">
                            <div className="matrix-section">
                                <h4>Before</h4>
                                <div className="matrix-display">
                                    {renderMatrix(currentOperation.matrixBefore)}
                                </div>
                            </div>

                            <div className="arrow">→</div>

                            <div className="matrix-section">
                                <h4>After</h4>
                                <div className="matrix-display">
                                    {renderMatrix(currentOperation.matrixAfter)}
                                </div>
                            </div>
                        </div>

                        <div className="operation-details">
                            <h4>Operation Type</h4>
                            <ul>
                                {currentOperation.type === 'swap' && (
                                    <li><strong>Type 1 (Row Swap):</strong> Exchange two rows</li>
                                )}
                                {currentOperation.type === 'scale' && (
                                    <li><strong>Type 2 (Row Scaling):</strong> Multiply a row by a non-zero scalar</li>
                                )}
                                {currentOperation.type === 'add' && (
                                    <li><strong>Type 3 (Row Addition):</strong> Add a multiple of one row to another</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="all-steps-summary">
                        <h4>All Steps</h4>
                        <div className="steps-list">
                            {operations.map((op, idx) => (
                                <div
                                    key={idx}
                                    className={`step-item ${idx === currentStep ? 'active' : ''}`}
                                    onClick={() => setCurrentStep(idx)}
                                >
                                    <span className={`step-badge operation-${op.type}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="step-notation">
                                        <LaTeXNotation latex={op.notation} />
                                    </span>
                                    <span className="step-desc">{renderDescription(op.description)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

RowOperationsDisplay.displayName = 'RowOperationsDisplay';

export default RowOperationsDisplay;
