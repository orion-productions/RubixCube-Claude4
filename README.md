# Interactive Rubik's Cube with Three.js

A fully interactive 3D Rubik's Cube implementation using Three.js that supports dynamic sizing from 2x2x2 up to 20x20x20, complete with shuffling, solving animations, and multiple control methods.

## 🎮 Play Online
**Live Demo**: [https://orion-productions.github.io/RubixCube-Claude4/](https://orion-productions.github.io/RubixCube-Claude4/)

## Features

### Core Functionality
- **Dynamic Cube Sizing**: Create cubes from 2x2x2 up to 20x20x20
- **Standard Colors**: Authentic Rubik's Cube colors (white, yellow, red, orange, blue, green)
- **Smooth Animations**: Fluid rotation animations with easing
- **Multiple Control Methods**: Mouse, keyboard, UI buttons, and gamepad support

### Interaction Methods
1. **Mouse Controls**:
   - Left click + drag: Rotate camera view
   - Right click + drag: Pan camera
   - Mouse wheel: Zoom in/out
   - Click on cube faces: Rotate layers

2. **Keyboard Controls**:
   - `R`: Rotate right face
   - `L`: Rotate left face  
   - `U`: Rotate up face
   - `D`: Rotate down face
   - `F`: Rotate front face
   - `B`: Rotate back face
   - `M`: Rotate middle layer (x-axis, odd sizes only)
   - `E`: Rotate equatorial layer (y-axis, odd sizes only)
   - `S`: Rotate standing layer (z-axis, odd sizes only)

3. **Gamepad Controls**:
   - A button: Front face rotation
   - B button: Right face rotation
   - X button: Back face rotation
   - Y button: Left face rotation
   - Left bumper: Up face rotation
   - Right bumper: Down face rotation
   - Left analog stick: Camera rotation
   - Right analog stick: Camera position
   - Select: Shuffle cube
   - Start: Solve cube

4. **UI Controls**:
   - Size slider and input field for cube dimensions
   - Generate new cube button
   - Shuffle button (20 random moves)
   - Solve button (reverses move history)
   - Reset button (instant return to solved state)
   - Individual layer rotation buttons

### Advanced Features
- **Shuffle Algorithm**: Performs 20 random rotations from solved state
- **Solve Algorithm**: Reverses the exact sequence of moves used in shuffling
- **Move History Tracking**: Records all moves for accurate solving
- **Performance Optimization**: Efficient geometry reuse and smooth animations
- **Responsive Design**: Adapts to different screen sizes
- **Status Updates**: Real-time feedback on operations
- **Loading Screen**: Professional loading experience

## Technical Implementation

### Architecture
- **RubiksCube Class**: Core cube logic, geometry management, and move tracking
- **RubiksCubeApp Class**: Main application, scene setup, and event handling
- **Modular Design**: Separated concerns for maintainability

### Key Algorithms
1. **Layer Detection**: Identifies cubes in specific layers based on position
2. **Rotation Animation**: Smooth quaternion-based rotations with easing
3. **Move History**: Stack-based tracking for accurate solve sequences
4. **Collision Detection**: Ray casting for interactive cube face selection

### Performance Features
- **Geometry Reuse**: Single geometry instance for all cubes
- **Efficient Materials**: Optimized material creation and reuse
- **Animation Batching**: Grouped rotations for smooth performance
- **Memory Management**: Proper cleanup and object pooling

## File Structure

```
RubixCube-Claude4/
├── index.html          # Main HTML structure and UI
├── rubiks-cube.js      # Complete Three.js implementation
└── README.md           # This documentation
```

## Getting Started

1. **Play Online**: Visit [https://orion-productions.github.io/RubixCube-Claude4/](https://orion-productions.github.io/RubixCube-Claude4/)

2. **Run Locally**:
   ```bash
   git clone https://github.com/orion-productions/RubixCube-Claude4.git
   cd RubixCube-Claude4
   python -m http.server 8000
   # Open http://localhost:8000 in your browser
   ```

## Usage Guide

### Basic Operations
1. **Change Cube Size**: Use the slider or input field (2-20), then click "Generate New Cube"
2. **Shuffle**: Click "Shuffle Cube" to randomize with 20 moves
3. **Solve**: Click "Solve Cube" to watch it solve step-by-step
4. **Reset**: Click "Reset to Solved" for instant solved state
5. **Rotate View**: Click and drag to explore different angles

### Advanced Techniques
- **Layer Rotation**: Click directly on cube faces to rotate specific layers
- **Keyboard Shortcuts**: Use standard cube notation (R, L, U, D, F, B)
- **Gamepad Control**: Connect a gamepad for enhanced control experience
- **Large Cubes**: Test performance with larger cubes (10x10x10 and above)

## Technical Specifications

### Dependencies
- **Three.js r128**: 3D graphics library
- **OrbitControls**: Camera control system
- **Modern Browser**: WebGL support required

### Performance
- **Optimized for**: 2x2x2 to 10x10x10 cubes (smooth performance)
- **Tested up to**: 20x20x20 cubes (may require powerful hardware)
- **Memory Usage**: Efficient geometry and material reuse
- **Animation**: 60 FPS smooth rotations with easing

### Browser Support
- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Touch controls supported

## Testing

The application includes comprehensive unit tests that verify:
- Cube creation for different sizes
- Layer rotation mechanics
- Shuffle and solve algorithms
- Size change functionality

Tests run automatically in development environments and log results to the browser console.

## Customization

### Colors
Modify the `colors` object in the `RubiksCube` class to change face colors:
```javascript
this.colors = {
    white: 0xffffff,   // Top
    yellow: 0xffff00,  // Bottom  
    red: 0xff0000,     // Front
    orange: 0xff8c00,  // Back
    blue: 0x0000ff,    // Right
    green: 0x00ff00    // Left
};
```

### Animation Speed
Adjust the `duration` variable in the `animateRotation` method:
```javascript
const duration = 600; // milliseconds (current: 2x slower)
```

### Shuffle Complexity
Change the number of shuffle moves:
```javascript
await this.shuffle(20); // Default: 20 moves
```

## Future Enhancements

Potential improvements for future versions:
- **Advanced Solving**: Implement actual Rubik's Cube solving algorithms (CFOP, Roux, etc.)
- **Pattern Generation**: Pre-defined patterns and configurations
- **Multiplayer**: Collaborative solving or racing modes
- **VR Support**: Virtual reality integration
- **Sound Effects**: Audio feedback for rotations
- **Statistics**: Move counting and timing
- **Save/Load**: Cube state persistence

## Contributing

This is a complete, self-contained implementation. The code is well-documented and modular for easy modification and extension.

## License

This project is open source and available under the MIT License.
