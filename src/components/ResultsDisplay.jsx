import { useEffect, useRef, useState, memo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './ResultsDisplay.css';
import DesmosVisualization from './DesmosVisualization';
import RowOperationsDisplay from './RowOperationsDisplay';
import BasisVisualization from './BasisVisualization';
import { canVisualize } from '../utils/desmosUtils';

const ResultsDisplay = memo(({ results }) => {
    const [showDesmos, setShowDesmos] = useState(false);
    const [showBasisViz, setShowBasisViz] = useState(false);

    if (!results) return null;

    return (
        <div className="results-container fade-in">
            <h2 className="results-title">Fundamental Subspaces</h2>

            <div className="matrix-info" style={{ animationDelay: '0.1s' }}>
                <div className="info-card">
                    <span className="info-label">Dimensions</span>
                    <span className="info-value">{results.matrix.rows} × {results.matrix.cols}</span>
                </div>
                <div className="info-card highlight">
                    <span className="info-label">Rank</span>
                    <span className="info-value">{results.rank}</span>
                </div>
            </div>

            <div className="rref-section" style={{ animationDelay: '0.2s' }}>
                <h3>Row-Reduced Echelon Form (RREF)</h3>
                <LaTeXDisplay latex={results.rref.latex} />
                <p className="pivot-info">Pivot columns: {results.rref.pivots.map(p => p + 1).join(', ') || 'None'}</p>

                {/* Add row operations display */}
                {results.operations && <RowOperationsDisplay operations={results.operations} />}
            </div>

            <div className="dimension-theorem" style={{ animationDelay: '0.3s' }}>
                <h3>Dimension Theorem Check</h3>
                <div className="theorem-cards">
                    <div className="theorem-card">
                        <span>rank(A) + dim(Null A) = n</span>
                        <span className="theorem-value">{results.dimension_check.rank_plus_nullity}</span>
                    </div>
                    <div className="theorem-card">
                        <span>rank(A) + dim(Left Null A) = m</span>
                        <span className="theorem-value">{results.dimension_check.rank_plus_left_nullity}</span>
                    </div>
                </div>
            </div>

            <div className="subspaces-grid">
                <div style={{ animationDelay: '0.4s' }}>
                    <SubspaceCard
                        name="Column Space"
                        symbol="C(A)"
                        data={results.column_space}
                        color="indigo"
                    />
                </div>
                <div style={{ animationDelay: '0.5s' }}>
                    <SubspaceCard
                        name="Row Space"
                        symbol="C(Aᵀ)"
                        data={results.row_space}
                        color="purple"
                    />
                </div>
                <div style={{ animationDelay: '0.6s' }}>
                    <SubspaceCard
                        name="Null Space"
                        symbol="N(A)"
                        data={results.null_space}
                        color="blue"
                    />
                </div>
                <div style={{ animationDelay: '0.7s' }}>
                    <SubspaceCard
                        name="Left Null Space"
                        symbol="N(Aᵀ)"
                        data={results.left_null_space}
                        color="cyan"
                    />
                </div>
            </div>

            {canVisualize(results) && (
                <div className="visualize-section">
                    <button
                        className="btn-visualize"
                        onClick={() => setShowDesmos(true) || setShowBasisViz(false)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        Visualize in Desmos
                    </button>
                    <button
                        className="btn-visualize"
                        onClick={() => setShowDesmos(false) || setShowBasisViz(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        Visualize Basis Vectors
                    </button>
                </div>
            )}

            {showDesmos && (
                <DesmosVisualization
                    results={results}
                    onClose={() => setShowDesmos(false)}
                />
            )}

            {showBasisViz && (
                <BasisVisualization
                    results={results}
                    onClose={() => setShowBasisViz(false)}
                />
            )}
        </div>
    );
});

const LaTeXDisplay = ({ latex }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && latex) {
            try {
                katex.render(latex, containerRef.current, {
                    throwOnError: false,
                    displayMode: true,
                });
            } catch (e) {
                containerRef.current.textContent = latex;
            }
        }
    }, [latex]);

    return <div ref={containerRef} className="latex-display"></div>;
};

const SubspaceCard = ({ name, symbol, data, color }) => {
    return (
        <div className={`subspace-card subspace-${color}`}>
            <div className="subspace-header">
                <h4>{name}</h4>
                <span className="subspace-symbol">{symbol}</span>
            </div>
            <div className="subspace-meta">
                <span className="dimension-badge">dim = {data.dimension}</span>
                <span className="description">{data.description}</span>
            </div>
            <div className="subspace-basis">
                {data.dimension === 0 ? (
                    <p className="trivial-space">Trivial (only zero vector)</p>
                ) : (
                    <div className="basis-vectors">
                        <span className="basis-label">Basis:</span>
                        {data.latex.map((vec, idx) => (
                            <div key={idx} className="vector-container">
                                <span className="vector-label">v<sub>{idx + 1}</sub> =</span>
                                <LaTeXDisplay latex={vec} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

ResultsDisplay.displayName = 'ResultsDisplay';

export default ResultsDisplay;
