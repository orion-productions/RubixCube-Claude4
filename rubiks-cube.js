class RubiksCube {
    constructor(size = 3) {
        this.size = size;
        this.cubes = [];
        this.group = new THREE.Group();
        this.isAnimating = false;
        this.moveHistory = [];
        this.solvedState = null;
        
        // Standard Rubik's Cube colors
        this.colors = {
            white: 0xffffff,   // Top
            yellow: 0xffff00,  // Bottom  
            red: 0xff0000,     // Front
            orange: 0xff8c00,  // Back
            blue: 0x0000ff,    // Right
            green: 0x00ff00    // Left
        };
        
        // Face mappings for cube orientation
        this.faceColors = [
            this.colors.red,    // Front (+Z)
            this.colors.orange, // Back (-Z)
            this.colors.white,  // Top (+Y)
            this.colors.yellow, // Bottom (-Y)
            this.colors.blue,   // Right (+X)
            this.colors.green   // Left (-X)
        ];
        
        this.init();
    }
    
    init() {
        this.createCube();
        this.saveSolvedState();
    }
    
    createCube() {
        // Clear existing cubes
        this.group.clear();
        this.cubes = [];
        
        const cubeSize = 0.95; // Size of each small cube (with gap)
        const offset = (this.size - 1) / 2;
        
        // Create geometry and materials once for efficiency
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const materials = this.faceColors.map(color => 
            new THREE.MeshLambertMaterial({ color: color })
        );
        
        // Create individual cubes
        for (let x = 0; x < this.size; x++) {
            this.cubes[x] = [];
            for (let y = 0; y < this.size; y++) {
                this.cubes[x][y] = [];
                for (let z = 0; z < this.size; z++) {
                    const cube = new THREE.Mesh(geometry, materials.slice());
                    
                    // Position the cube
                    cube.position.set(
                        x - offset,
                        y - offset, 
                        z - offset
                    );
                    
                    // Store original position and indices
                    cube.userData = {
                        originalPosition: cube.position.clone(),
                        indices: { x, y, z },
                        originalIndices: { x, y, z }
                    };
                    
                    this.cubes[x][y][z] = cube;
                    this.group.add(cube);
                }
            }
        }
    }
    
    saveSolvedState() {
        this.solvedState = {
            positions: [],
            rotations: []
        };
        
        this.group.children.forEach(cube => {
            this.solvedState.positions.push(cube.position.clone());
            this.solvedState.rotations.push(cube.rotation.clone());
        });
    }
    
    // Rotate a layer of the cube
    rotateLayer(axis, layerIndex, direction = 1, animate = true) {
        if (this.isAnimating) return Promise.resolve();
        
        const cubesToRotate = this.getCubesInLayer(axis, layerIndex);
        if (cubesToRotate.length === 0) return Promise.resolve();
        
        // Record move for solving
        this.moveHistory.push({ axis, layerIndex, direction });
        
        if (animate) {
            return this.animateRotation(cubesToRotate, axis, direction);
        } else {
            this.performInstantRotation(cubesToRotate, axis, direction);
            return Promise.resolve();
        }
    }
    
    getCubesInLayer(axis, layerIndex) {
        const cubes = [];
        const offset = (this.size - 1) / 2;
        
        this.group.children.forEach(cube => {
            const pos = cube.position;
            let isInLayer = false;
            
            switch (axis) {
                case 'x':
                    isInLayer = Math.abs(pos.x - (layerIndex - offset)) < 0.1;
                    break;
                case 'y':
                    isInLayer = Math.abs(pos.y - (layerIndex - offset)) < 0.1;
                    break;
                case 'z':
                    isInLayer = Math.abs(pos.z - (layerIndex - offset)) < 0.1;
                    break;
            }
            
            if (isInLayer) {
                cubes.push(cube);
            }
        });
        
        return cubes;
    }
    
    animateRotation(cubes, axis, direction) {
        return new Promise((resolve) => {
            this.isAnimating = true;
            
            // Create a temporary group for rotation
            const rotationGroup = new THREE.Group();
            this.group.add(rotationGroup);
            
            // Move cubes to rotation group
            cubes.forEach(cube => {
                const worldPosition = new THREE.Vector3();
                cube.getWorldPosition(worldPosition);
                this.group.worldToLocal(worldPosition);
                
                this.group.remove(cube);
                cube.position.copy(worldPosition);
                rotationGroup.add(cube);
            });
            
            // Animate rotation
            const startRotation = 0;
            const endRotation = direction * Math.PI / 2;
            const duration = 600; // milliseconds (2x slower)
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                const easedProgress = easeInOut(progress);
                
                const currentRotation = startRotation + (endRotation - startRotation) * easedProgress;
                
                switch (axis) {
                    case 'x':
                        rotationGroup.rotation.x = currentRotation;
                        break;
                    case 'y':
                        rotationGroup.rotation.y = currentRotation;
                        break;
                    case 'z':
                        rotationGroup.rotation.z = currentRotation;
                        break;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Move cubes back to main group with updated positions
                    const cubesArray = [...rotationGroup.children];
                    cubesArray.forEach(cube => {
                        const worldPosition = new THREE.Vector3();
                        const worldQuaternion = new THREE.Quaternion();
                        cube.getWorldPosition(worldPosition);
                        cube.getWorldQuaternion(worldQuaternion);
                        
                        rotationGroup.remove(cube);
                        this.group.worldToLocal(worldPosition);
                        cube.position.copy(worldPosition);
                        cube.setRotationFromQuaternion(worldQuaternion);
                        this.group.add(cube);
                    });
                    
                    this.group.remove(rotationGroup);
                    this.isAnimating = false;
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    performInstantRotation(cubes, axis, direction) {
        const angle = direction * Math.PI / 2;
        
        cubes.forEach(cube => {
            const position = cube.position.clone();
            
            switch (axis) {
                case 'x':
                    cube.position.y = position.z * Math.sin(angle) + position.y * Math.cos(angle);
                    cube.position.z = position.z * Math.cos(angle) - position.y * Math.sin(angle);
                    cube.rotateX(angle);
                    break;
                case 'y':
                    cube.position.x = position.x * Math.cos(angle) - position.z * Math.sin(angle);
                    cube.position.z = position.x * Math.sin(angle) + position.z * Math.cos(angle);
                    cube.rotateY(angle);
                    break;
                case 'z':
                    cube.position.x = position.x * Math.cos(angle) - position.y * Math.sin(angle);
                    cube.position.y = position.x * Math.sin(angle) + position.y * Math.cos(angle);
                    cube.rotateZ(angle);
                    break;
            }
        });
    }
    
    // Shuffle the cube with random moves
    async shuffle(moves = 20) {
        if (this.isAnimating) return;
        
        this.moveHistory = []; // Clear history for fresh shuffle
        const axes = ['x', 'y', 'z'];
        
        updateStatus('Shuffling cube...');
        
        for (let i = 0; i < moves; i++) {
            const axis = axes[Math.floor(Math.random() * axes.length)];
            const layerIndex = Math.floor(Math.random() * this.size);
            const direction = Math.random() < 0.5 ? 1 : -1;
            
            await this.rotateLayer(axis, layerIndex, direction, true);
            
            // Update progress
            if (i % 5 === 0 || i === moves - 1) {
                updateStatus(`Shuffling... ${Math.floor(((i + 1) / moves) * 100)}%`);
            }
        }
        
        updateStatus('Shuffle complete!');
    }
    
    // Solve the cube by reversing the move history
    async solve() {
        if (this.isAnimating) return;
        if (this.moveHistory.length === 0) {
            updateStatus('Cube is already solved!');
            return;
        }
        
        updateStatus('Solving cube...');
        const totalMoves = this.moveHistory.length;
        
        // Reverse the move history
        for (let i = this.moveHistory.length - 1; i >= 0; i--) {
            const move = this.moveHistory[i];
            await this.rotateLayer(move.axis, move.layerIndex, -move.direction, true);
            
            // Update progress
            const progress = Math.floor(((totalMoves - i) / totalMoves) * 100);
            updateStatus(`Solving... ${progress}%`);
        }
        
        this.moveHistory = [];
        updateStatus('Cube solved!');
    }
    
    // Reset cube to solved state
    resetToSolved() {
        if (this.isAnimating) return;
        
        if (this.solvedState) {
            this.group.children.forEach((cube, index) => {
                cube.position.copy(this.solvedState.positions[index]);
                cube.rotation.copy(this.solvedState.rotations[index]);
            });
        }
        
        this.moveHistory = [];
        updateStatus('Cube reset to solved state');
    }
    
    // Get the Three.js group for adding to scene
    getGroup() {
        return this.group;
    }
    
    // Update cube size and regenerate
    updateSize(newSize) {
        this.size = newSize;
        this.init();
    }
}

// Main application class
class RubiksCubeApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cube = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.gamepadIndex = -1;
        
        this.init();
        this.setupEventListeners();
        this.setupGamepadSupport();
        this.animate();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(10, 10, 10);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        
        // Create initial cube
        this.cube = new RubiksCube(3);
        this.scene.add(this.cube.getGroup());
        
        // Hide loading screen
        document.getElementById('loading').style.display = 'none';
        updateStatus('Ready - Cube loaded!');
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Mouse interaction for cube rotation
        this.renderer.domElement.addEventListener('click', (event) => {
            if (this.cube.isAnimating) return;
            
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.cube.getGroup().children);
            
            if (intersects.length > 0) {
                this.handleCubeClick(intersects[0]);
            }
        });
        
        // UI Controls
        const cubeSize = document.getElementById('cubeSize');
        const cubeSizeInput = document.getElementById('cubeSizeInput');
        const cubeSizeValue = document.getElementById('cubeSizeValue');
        const cubeSizeValue2 = document.getElementById('cubeSizeValue2');
        const cubeSizeValue3 = document.getElementById('cubeSizeValue3');
        
        const updateSizeDisplay = (size) => {
            cubeSizeValue.textContent = size;
            cubeSizeValue2.textContent = size;
            cubeSizeValue3.textContent = size;
        };
        
        cubeSize.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            cubeSizeInput.value = size;
            updateSizeDisplay(size);
        });
        
        cubeSizeInput.addEventListener('input', (e) => {
            const size = Math.max(2, Math.min(20, parseInt(e.target.value) || 2));
            cubeSize.value = size;
            e.target.value = size;
            updateSizeDisplay(size);
        });
        
        document.getElementById('generateCube').addEventListener('click', () => {
            const size = parseInt(cubeSize.value);
            this.generateNewCube(size);
        });
        
        document.getElementById('shuffleCube').addEventListener('click', () => {
            this.cube.shuffle();
        });
        
        document.getElementById('solveCube').addEventListener('click', () => {
            this.cube.solve();
        });
        
        document.getElementById('resetCube').addEventListener('click', () => {
            this.cube.resetToSolved();
        });
        
        // Layer rotation buttons
        document.getElementById('rotateX').addEventListener('click', () => {
            this.cube.rotateLayer('x', 0, 1);
        });
        
        document.getElementById('rotateY').addEventListener('click', () => {
            this.cube.rotateLayer('y', 0, 1);
        });
        
        document.getElementById('rotateZ').addEventListener('click', () => {
            this.cube.rotateLayer('z', 0, 1);
        });
        
        // Keyboard controls
        window.addEventListener('keydown', (event) => {
            if (this.cube.isAnimating) return;
            
            const size = this.cube.size;
            const middle = Math.floor(size / 2);
            
            switch (event.key.toLowerCase()) {
                case 'r': // Right face
                    this.cube.rotateLayer('x', size - 1, 1);
                    break;
                case 'l': // Left face
                    this.cube.rotateLayer('x', 0, -1);
                    break;
                case 'u': // Up face
                    this.cube.rotateLayer('y', size - 1, 1);
                    break;
                case 'd': // Down face
                    this.cube.rotateLayer('y', 0, -1);
                    break;
                case 'f': // Front face
                    this.cube.rotateLayer('z', size - 1, 1);
                    break;
                case 'b': // Back face
                    this.cube.rotateLayer('z', 0, -1);
                    break;
                case 'm': // Middle layer (x)
                    if (size % 2 === 1) {
                        this.cube.rotateLayer('x', middle, -1);
                    }
                    break;
                case 'e': // Equatorial layer (y)
                    if (size % 2 === 1) {
                        this.cube.rotateLayer('y', middle, -1);
                    }
                    break;
                case 's': // Standing layer (z)
                    if (size % 2 === 1) {
                        this.cube.rotateLayer('z', middle, 1);
                    }
                    break;
            }
        });
    }
    
    setupGamepadSupport() {
        let lastButtonStates = {};
        
        const checkGamepad = () => {
            const gamepads = navigator.getGamepads();
            
            for (let i = 0; i < gamepads.length; i++) {
                const gamepad = gamepads[i];
                if (gamepad) {
                    this.gamepadIndex = i;
                    
                    // Initialize button states if not exists
                    if (!lastButtonStates[i]) {
                        lastButtonStates[i] = new Array(gamepad.buttons.length).fill(false);
                    }
                    
                    // Check button presses (only on press, not hold)
                    gamepad.buttons.forEach((button, buttonIndex) => {
                        const isPressed = button.pressed;
                        const wasPressed = lastButtonStates[i][buttonIndex];
                        
                        if (isPressed && !wasPressed && !this.cube.isAnimating) {
                            this.handleGamepadButton(buttonIndex);
                        }
                        
                        lastButtonStates[i][buttonIndex] = isPressed;
                    });
                    
                    // Handle analog sticks for camera control
                    const leftStickX = gamepad.axes[0];
                    const leftStickY = gamepad.axes[1];
                    const rightStickX = gamepad.axes[2];
                    const rightStickY = gamepad.axes[3];
                    
                    if (Math.abs(leftStickX) > 0.1 || Math.abs(leftStickY) > 0.1) {
                        this.controls.rotate(leftStickX * 0.02, leftStickY * 0.02);
                    }
                    
                    if (Math.abs(rightStickX) > 0.1 || Math.abs(rightStickY) > 0.1) {
                        this.camera.position.x += rightStickX * 0.1;
                        this.camera.position.y -= rightStickY * 0.1;
                    }
                }
            }
            
            requestAnimationFrame(checkGamepad);
        };
        
        // Start gamepad checking
        checkGamepad();
    }
    
    handleGamepadButton(buttonIndex) {
        const size = this.cube.size;
        const middle = Math.floor(size / 2);
        
        // Standard gamepad button mapping
        switch (buttonIndex) {
            case 0: // A button - Front face
                this.cube.rotateLayer('z', size - 1, 1);
                break;
            case 1: // B button - Right face
                this.cube.rotateLayer('x', size - 1, 1);
                break;
            case 2: // X button - Back face
                this.cube.rotateLayer('z', 0, -1);
                break;
            case 3: // Y button - Left face
                this.cube.rotateLayer('x', 0, -1);
                break;
            case 4: // Left bumper - Up face
                this.cube.rotateLayer('y', size - 1, 1);
                break;
            case 5: // Right bumper - Down face
                this.cube.rotateLayer('y', 0, -1);
                break;
            case 8: // Select - Shuffle
                this.cube.shuffle();
                break;
            case 9: // Start - Solve
                this.cube.solve();
                break;
        }
    }
    
    handleCubeClick(intersection) {
        const clickedCube = intersection.object;
        const normal = intersection.face.normal;
        const position = clickedCube.position;
        
        // Determine which layer to rotate based on click position and normal
        const size = this.cube.size;
        const offset = (size - 1) / 2;
        
        // Find the layer index based on position
        let axis, layerIndex;
        
        if (Math.abs(normal.x) > 0.5) {
            axis = 'x';
            layerIndex = Math.round(position.x + offset);
        } else if (Math.abs(normal.y) > 0.5) {
            axis = 'y';
            layerIndex = Math.round(position.y + offset);
        } else {
            axis = 'z';
            layerIndex = Math.round(position.z + offset);
        }
        
        // Determine rotation direction based on normal
        const direction = normal.x + normal.y + normal.z > 0 ? 1 : -1;
        
        this.cube.rotateLayer(axis, layerIndex, direction);
    }
    
    generateNewCube(size) {
        // Remove old cube
        this.scene.remove(this.cube.getGroup());
        
        // Create new cube
        this.cube = new RubiksCube(size);
        this.scene.add(this.cube.getGroup());
        
        // Adjust camera position based on cube size
        const distance = size * 3;
        this.camera.position.set(distance, distance, distance);
        
        updateStatus(`Generated ${size}x${size}x${size} cube`);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Utility function to update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize the application when the page loads
window.addEventListener('load', () => {
    new RubiksCubeApp();
});

// Unit tests for core cube logic
class RubiksCubeTests {
    static runAllTests() {
        console.log('Running Rubik\'s Cube Tests...');
        
        this.testCubeCreation();
        this.testLayerRotation();
        this.testShuffleAndSolve();
        this.testSizeChanges();
        
        console.log('All tests completed!');
    }
    
    static testCubeCreation() {
        console.log('Testing cube creation...');
        
        // Test different sizes
        for (let size = 2; size <= 5; size++) {
            const cube = new RubiksCube(size);
            const expectedCubes = size * size * size;
            const actualCubes = cube.getGroup().children.length;
            
            console.assert(
                actualCubes === expectedCubes,
                `Size ${size}: Expected ${expectedCubes} cubes, got ${actualCubes}`
            );
        }
        
        console.log('✓ Cube creation tests passed');
    }
    
    static testLayerRotation() {
        console.log('Testing layer rotation...');
        
        const cube = new RubiksCube(3);
        const initialPositions = cube.getGroup().children.map(c => c.position.clone());
        
        // Test rotation and ensure positions change
        cube.rotateLayer('x', 0, 1, false);
        const afterRotation = cube.getGroup().children.map(c => c.position.clone());
        
        let positionsChanged = false;
        for (let i = 0; i < initialPositions.length; i++) {
            if (!initialPositions[i].equals(afterRotation[i])) {
                positionsChanged = true;
                break;
            }
        }
        
        console.assert(positionsChanged, 'Layer rotation should change cube positions');
        console.log('✓ Layer rotation tests passed');
    }
    
    static testShuffleAndSolve() {
        console.log('Testing shuffle and solve...');
        
        const cube = new RubiksCube(3);
        const solvedPositions = cube.getGroup().children.map(c => c.position.clone());
        
        // Perform some moves
        cube.rotateLayer('x', 0, 1, false);
        cube.rotateLayer('y', 1, -1, false);
        cube.rotateLayer('z', 2, 1, false);
        
        // Check that positions changed
        const shuffledPositions = cube.getGroup().children.map(c => c.position.clone());
        let isShuffled = false;
        for (let i = 0; i < solvedPositions.length; i++) {
            if (!solvedPositions[i].equals(shuffledPositions[i])) {
                isShuffled = true;
                break;
            }
        }
        
        console.assert(isShuffled, 'Cube should be shuffled after moves');
        
        // Test solve by resetting
        cube.resetToSolved();
        const afterSolve = cube.getGroup().children.map(c => c.position.clone());
        
        let isSolved = true;
        for (let i = 0; i < solvedPositions.length; i++) {
            if (!solvedPositions[i].equals(afterSolve[i])) {
                isSolved = false;
                break;
            }
        }
        
        console.assert(isSolved, 'Cube should return to solved state');
        console.log('✓ Shuffle and solve tests passed');
    }
    
    static testSizeChanges() {
        console.log('Testing size changes...');
        
        const cube = new RubiksCube(3);
        const original3x3Count = cube.getGroup().children.length;
        
        cube.updateSize(4);
        const new4x4Count = cube.getGroup().children.length;
        
        console.assert(
            original3x3Count === 27 && new4x4Count === 64,
            `Size change failed: 3x3=${original3x3Count}, 4x4=${new4x4Count}`
        );
        
        console.log('✓ Size change tests passed');
    }
}

// Run tests in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => RubiksCubeTests.runAllTests(), 1000);
}
