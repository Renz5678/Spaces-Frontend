import { useState } from 'react';
import Vector2DCanvas from './Vector2DCanvas';
import Vector3DScene from './Vector3DScene';
import './BasisVisualization.css';

/**
 * Unified basis visualization component
 * Automatically chooses 2D or 3D visualization based on matrix dimensions
 */
const BasisVisualization = ({ results, onClose }) => {
    const [viewMode, setViewMode] = useState('auto'); // 'auto', '2d', '3d'

    if (!results) return null;

    // Determine visualization dimension
    const { rows, cols } = results.matrix;
    const maxDim = Math.max(rows, cols);
    const is3D = maxDim === 3;
    const is2D = maxDim === 2;

    // Check if we have any non-trivial spaces
    const hasVectors =
        results.column_space.dimension > 0 ||
        results.row_space.dimension > 0 ||
        results.null_space.dimension > 0 ||
        results.left_null_space.dimension > 0;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!hasVectors) {
        return (
            <div className="basis-modal-overlay" onClick={handleOverlayClick}>
                <div className="basis-modal">
                    <button className="modal-close" onClick={onClose}>×</button>
                    <div className="basis-empty">
                        <p>All subspaces are trivial - no vectors to visualize.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!is2D && !is3D) {
        return (
            <div className="basis-modal-overlay" onClick={handleOverlayClick}>
                <div className="basis-modal">
                    <button className="modal-close" onClick={onClose}>×</button>
                    <div className="basis-empty">
                        <p>Visualization is only available for 2D and 3D matrices.</p>
                        <p>Your matrix is {rows}×{cols}.</p>
                    </div>
                </div>
            </div>
        );
    }

    const subspaces = {
        column_space: results.column_space,
        row_space: results.row_space,
        null_space: results.null_space,
        left_null_space: results.left_null_space
    };

    // Determine which component to render
    const shouldShow2D = viewMode === '2d' || (viewMode === 'auto' && is2D);
    const shouldShow3D = viewMode === '3d' || (viewMode === 'auto' && is3D);

    return (
        <div className="basis-modal-overlay" onClick={handleOverlayClick}>
            <div className="basis-modal basis-modal-large">
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="basis-header">
                    <h2>Basis Vectors Visualization</h2>
                    <p className="basis-subtitle">
                        {is3D ? '3D' : '2D'} geometric representation of fundamental subspaces
                    </p>
                </div>

                {/* View mode toggle (only for 3D matrices) */}
                {is3D && (
                    <div className="view-mode-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'auto' ? 'active' : ''}`}
                            onClick={() => setViewMode('auto')}
                        >
                            3D View
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === '2d' ? 'active' : ''}`}
                            onClick={() => setViewMode('2d')}
                        >
                            2D Projection
                        </button>
                    </div>
                )}

                <div className="visualization-container">
                    {shouldShow2D && <Vector2DCanvas subspaces={subspaces} />}
                    {shouldShow3D && <Vector3DScene subspaces={subspaces} />}
                </div>

                <div className="basis-legend">
                    <h3>Legend</h3>
                    <div className="legend-grid">
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#4F46E5' }}></span>
                            <div>
                                <strong>Column Space C(A)</strong>
                                <span className="legend-desc">dim = {results.column_space.dimension}</span>
                            </div>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#10B981' }}></span>
                            <div>
                                <strong>Row Space C(A<sup>T</sup>)</strong>
                                <span className="legend-desc">dim = {results.row_space.dimension}</span>
                            </div>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#EF4444' }}></span>
                            <div>
                                <strong>Null Space N(A)</strong>
                                <span className="legend-desc">dim = {results.null_space.dimension}</span>
                            </div>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#8B5CF6' }}></span>
                            <div>
                                <strong>Left Null Space N(A<sup>T</sup>)</strong>
                                <span className="legend-desc">dim = {results.left_null_space.dimension}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasisVisualization;
