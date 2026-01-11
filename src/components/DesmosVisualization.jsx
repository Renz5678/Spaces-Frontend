import { useState, useEffect, useRef, useCallback } from 'react';
import { canVisualize, getVisualizationDimension, generateAllExpressions, getViewportBounds } from '../utils/desmosUtils';
import './DesmosVisualization.css';

/**
 * Desmos Visualization Component
 * Embeds Desmos graphing calculator to visualize fundamental subspaces
 */
const DesmosVisualization = ({ results, onClose }) => {
    const calculatorRef = useRef(null);
    const [calculator, setCalculator] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load Desmos API script
    useEffect(() => {
        if (window.Desmos) {
            setIsLoading(false);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
        script.async = true;

        script.onload = () => {
            setIsLoading(false);
        };

        script.onerror = () => {
            setError('Failed to load Desmos API');
            setIsLoading(false);
        };

        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    // Initialize calculator
    useEffect(() => {
        if (!calculatorRef.current || isLoading || !window.Desmos || calculator) {
            return;
        }

        try {
            const dimension = getVisualizationDimension(results);
            const is3D = dimension === 3;

            const calc = window.Desmos.GraphingCalculator(calculatorRef.current, {
                keypad: false,
                expressions: true,
                settingsMenu: true,
                zoomButtons: true,
                expressionsTopbar: true,
                projectorMode: false,
                invertedColors: false,
                fontSize: 14,
                ...(is3D && {
                    // 3D specific options
                    product: 'graphing-3d'
                })
            });

            // Set viewport
            const bounds = getViewportBounds(dimension);
            calc.setMathBounds(bounds);

            setCalculator(calc);
        } catch (err) {
            setError('Failed to initialize calculator: ' + err.message);
        }
    }, [isLoading, results, calculator]);

    // Plot subspaces
    useEffect(() => {
        if (!calculator || !results) return;

        try {
            // Generate all expressions
            const expressions = generateAllExpressions(results);

            // Clear existing expressions
            calculator.setBlank();

            // Add all expressions
            expressions.forEach(expr => {
                calculator.setExpression(expr);
            });

            // Add legend
            const dimension = getVisualizationDimension(results);
            const yOffset = dimension === 2 ? 4.5 : 4.5;

            calculator.setExpression({
                id: 'legend_col',
                latex: `\\text{Column Space (Blue)}`,
                color: '#4F46E5',
                showLabel: true,
                label: 'C(A)',
                labelSize: '1',
                labelOrientation: 'right'
            });

            calculator.setExpression({
                id: 'legend_row',
                latex: `\\text{Row Space (Green)}`,
                color: '#10B981',
                showLabel: true,
                label: 'C(A^T)',
                labelSize: '1',
                labelOrientation: 'right'
            });

            calculator.setExpression({
                id: 'legend_null',
                latex: `\\text{Null Space (Red)}`,
                color: '#EF4444',
                showLabel: true,
                label: 'N(A)',
                labelSize: '1',
                labelOrientation: 'right'
            });

            calculator.setExpression({
                id: 'legend_leftnull',
                latex: `\\text{Left Null Space (Purple)}`,
                color: '#8B5CF6',
                showLabel: true,
                label: 'N(A^T)',
                labelSize: '1',
                labelOrientation: 'right'
            });

        } catch (err) {
            setError('Failed to plot subspaces: ' + err.message);
        }
    }, [calculator, results]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (calculator) {
                calculator.destroy();
            }
        };
    }, [calculator]);

    if (!canVisualize(results)) {
        return (
            <div className="desmos-modal-overlay" onClick={onClose}>
                <div className="desmos-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>×</button>
                    <div className="error-message">
                        This matrix cannot be visualized. Only matrices with dimensions ≤ 3×3 can be visualized.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="desmos-modal-overlay" onClick={onClose}>
            <div className="desmos-modal desmos-large" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="desmos-header">
                    <h2>Fundamental Subspaces Visualization</h2>
                    <p className="desmos-subtitle">
                        {getVisualizationDimension(results)}D visualization of the four fundamental subspaces
                    </p>
                </div>

                {isLoading && (
                    <div className="desmos-loading">
                        <svg className="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
                        </svg>
                        <span>Loading Desmos...</span>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div
                    ref={calculatorRef}
                    className="desmos-calculator"
                    style={{ display: isLoading ? 'none' : 'block' }}
                />

                <div className="desmos-legend">
                    <h3>Legend</h3>
                    <div className="legend-items">
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#4F46E5' }}></span>
                            <span>Column Space C(A)</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#10B981' }}></span>
                            <span>Row Space C(A<sup>T</sup>)</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#EF4444' }}></span>
                            <span>Null Space N(A)</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#8B5CF6' }}></span>
                            <span>Left Null Space N(A<sup>T</sup>)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesmosVisualization;
