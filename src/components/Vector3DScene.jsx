import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './Vector3DScene.css';

/**
 * 3D Three.js-based vector visualization
 * Renders basis vectors and planes in 3D space
 */
const Vector3DScene = ({ subspaces }) => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xfafafa);
        sceneRef.current = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.outline = 'none';
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enableRotate = true;
        controls.enablePan = true;
        controls.autoRotate = false;
        controls.minDistance = 2;
        controls.maxDistance = 20;
        controlsRef.current = controls;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Add coordinate axes
        addAxes(scene);

        // Add grid
        const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
        scene.add(gridHelper);

        // Color mapping
        const colors = {
            column_space: 0x4F46E5,    // Indigo
            row_space: 0x10B981,       // Green
            null_space: 0xEF4444,      // Red
            left_null_space: 0x8B5CF6  // Purple
        };

        // Add vectors and planes
        Object.entries(subspaces).forEach(([spaceName, space]) => {
            if (space.dimension > 0 && space.basis) {
                const color = colors[spaceName];

                if (space.dimension === 1) {
                    // 1D: Draw single vector
                    space.basis.forEach(vector => {
                        if (vector.length === 3) {
                            addVectorArrow(scene, vector, color);
                        }
                    });
                } else if (space.dimension === 2 && space.basis.length >= 2) {
                    // 2D: Draw plane and basis vectors
                    const v1 = space.basis[0];
                    const v2 = space.basis[1];
                    if (v1.length === 3 && v2.length === 3) {
                        addPlane(scene, v1, v2, color);
                        addVectorArrow(scene, v1, color);
                        addVectorArrow(scene, v2, color);
                    }
                } else if (space.dimension === 3) {
                    // 3D: Draw all basis vectors
                    space.basis.forEach(vector => {
                        if (vector.length === 3) {
                            addVectorArrow(scene, vector, color);
                        }
                    });
                }
            }
        });

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize with ResizeObserver for better responsiveness
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    renderer.setSize(width, height);
                }
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Cleanup
        return () => {
            resizeObserver.disconnect();
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            controls.dispose();
        };
    }, [subspaces]);

    const addAxes = (scene) => {
        const axisLength = 5;

        // X-axis (red)
        const xGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(axisLength, 0, 0)
        ]);
        const xMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
        const xAxis = new THREE.Line(xGeometry, xMaterial);
        scene.add(xAxis);

        // Y-axis (green)
        const yGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, axisLength, 0)
        ]);
        const yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
        const yAxis = new THREE.Line(yGeometry, yMaterial);
        scene.add(yAxis);

        // Z-axis (blue)
        const zGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, axisLength)
        ]);
        const zMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 });
        const zAxis = new THREE.Line(zGeometry, zMaterial);
        scene.add(zAxis);
    };

    const addVectorArrow = (scene, vector, color) => {
        const dir = new THREE.Vector3(vector[0], vector[1], vector[2]);
        const length = dir.length();
        dir.normalize();

        const arrow = new THREE.ArrowHelper(
            dir,
            new THREE.Vector3(0, 0, 0),
            length,
            color,
            0.2 * length,
            0.15 * length
        );
        scene.add(arrow);
    };

    const addPlane = (scene, v1, v2, color) => {
        // Create plane geometry
        const geometry = new THREE.PlaneGeometry(5, 5, 10, 10);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2
        });
        const plane = new THREE.Mesh(geometry, material);

        // Calculate normal vector
        const vec1 = new THREE.Vector3(v1[0], v1[1], v1[2]);
        const vec2 = new THREE.Vector3(v2[0], v2[1], v2[2]);
        const normal = new THREE.Vector3().crossVectors(vec1, vec2).normalize();

        // Orient plane
        plane.lookAt(normal);
        scene.add(plane);

        // Add wireframe
        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        line.material.color.setHex(color);
        line.material.opacity = 0.3;
        line.material.transparent = true;
        line.lookAt(normal);
        scene.add(line);
    };

    return (
        <div className="vector-3d-container">
            <div ref={containerRef} className="vector-3d-scene" />
            <div className="vector-3d-controls">
                <p>🖱️ Drag to rotate • Scroll to zoom • Right-click to pan</p>
            </div>
        </div>
    );
};

export default Vector3DScene;
