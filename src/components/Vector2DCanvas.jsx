import { useEffect, useRef } from 'react';
import './Vector2DCanvas.css';

/**
 * 2D Canvas-based vector visualization
 * Renders basis vectors as arrows on a 2D coordinate plane
 */
const Vector2DCanvas = ({ subspaces }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Set up coordinate system (center of canvas)
        ctx.save();
        ctx.translate(width / 2, height / 2);

        // Draw grid
        drawGrid(ctx, width, height);

        // Draw axes
        drawAxes(ctx, width, height);

        // Color mapping for subspaces
        const colors = {
            column_space: '#4F46E5',    // Indigo
            row_space: '#10B981',       // Green
            null_space: '#EF4444',      // Red
            left_null_space: '#8B5CF6'  // Purple
        };

        // Draw all basis vectors
        Object.entries(subspaces).forEach(([spaceName, space]) => {
            if (space.dimension > 0 && space.basis) {
                const color = colors[spaceName];
                space.basis.forEach((vector, idx) => {
                    if (vector.length === 2) {
                        drawVector(ctx, vector[0], vector[1], color, `${spaceName}_${idx}`);
                    }
                });
            }
        });

        ctx.restore();
    }, [subspaces]);

    const drawGrid = (ctx, width, height) => {
        const gridSize = 50; // pixels per unit
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;

        // Vertical lines
        for (let x = -width / 2; x <= width / 2; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, -height / 2);
            ctx.lineTo(x, height / 2);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = -height / 2; y <= height / 2; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(-width / 2, y);
            ctx.lineTo(width / 2, y);
            ctx.stroke();
        }
    };

    const drawAxes = (ctx, width, height) => {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        // X-axis
        ctx.beginPath();
        ctx.moveTo(-width / 2, 0);
        ctx.lineTo(width / 2, 0);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(0, height / 2);
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.fillText('x', width / 2 - 20, -10);
        ctx.fillText('y', 10, -height / 2 + 20);
    };

    const drawVector = (ctx, x, y, color, label) => {
        const scale = 50; // pixels per unit
        const endX = x * scale;
        const endY = -y * scale; // Flip Y for canvas coordinates

        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(endY, endX);
        const headLength = 15;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - headLength * Math.cos(angle - Math.PI / 6),
            endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - headLength * Math.cos(angle + Math.PI / 6),
            endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        // Draw point at end
        ctx.beginPath();
        ctx.arc(endX, endY, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw label
        ctx.fillStyle = color;
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`(${x.toFixed(2)}, ${y.toFixed(2)})`, endX + 10, endY - 10);
    };

    return (
        <div className="vector-2d-container">
            <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="vector-2d-canvas"
            />
        </div>
    );
};

export default Vector2DCanvas;
