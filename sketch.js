// Mondrian colors
const COLORS = ['#BB422C', '#1F3D6F', '#DFBC53', '#171A11'];
const BORDER = 20;
const SCALE_FACTOR = 0.6; // Scale down the original dimensions
const ACTUAL_WIDTH = 800 * SCALE_FACTOR;
const ACTUAL_HEIGHT = 790 * SCALE_FACTOR;
const CANVAS_WIDTH = ACTUAL_WIDTH;
const CANVAS_HEIGHT = ACTUAL_HEIGHT;
const MOVEMENT_DURATION = 5; // seconds of free movement
const SETTLE_DURATION = 3;   // seconds to pause when settled

let shapes = [];
let positions = [];
let targetPositions = [];
let originalPositions = [];
let backgroundLines = [];
let backgroundLinePositions = [];
let foregroundLines = [];
let foregroundLinePositions = [];
let lastSettleTime = 0;
let isSettled = false;

class Shape {
    constructor(w, h, color, isBlackLine = false) {
        this.w = w;
        this.h = h;
        this.color = color;
        this.isBlackLine = isBlackLine;
        this.noiseOffsetX = random(1000);
        this.noiseOffsetY = random(1000);
        this.speed = random(0.001, 0.002); // Slower noise movement
    }

    draw(x, y) {
        fill(this.color);
        noStroke();
        rect(x, y, this.w, this.h);
    }
}

function setup() {
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent('sketch-holder'); // Mount the canvas in the sketch-holder div
    frameRate(60);
    
    // Create moving shapes with scaled dimensions
    shapes = [
        new Shape(415 * SCALE_FACTOR, 410 * SCALE_FACTOR, '#BB422C'),  // Red (large)
        new Shape(265 * SCALE_FACTOR, 300 * SCALE_FACTOR, '#DFBC53'),  // Yellow
        new Shape(105 * SCALE_FACTOR, 203 * SCALE_FACTOR, '#DFBC53'),  // Yellow
        new Shape(250 * SCALE_FACTOR, 160 * SCALE_FACTOR, '#1F3D6F'),  // Blue
        new Shape(215 * SCALE_FACTOR, 210 * SCALE_FACTOR, '#171A11'),  // Black
        new Shape(200 * SCALE_FACTOR, 60 * SCALE_FACTOR, '#171A11'),   // Black
        new Shape(50 * SCALE_FACTOR, 200 * SCALE_FACTOR, '#BB422C'),   // Red (small)
    ];

    // Create background black lines with scaled dimensions
    backgroundLines = [
        new Shape(14 * SCALE_FACTOR, 685 * SCALE_FACTOR, '#171A11', true),  // Vertical
        new Shape(740 * SCALE_FACTOR, 14 * SCALE_FACTOR, '#171A11', true),  // Horizontal
        new Shape(14 * SCALE_FACTOR, 213 * SCALE_FACTOR, '#171A11', true),
    ];

    // Set positions for background lines (scaled)
    backgroundLinePositions = [
        {x: 190 * SCALE_FACTOR, y: 20 * SCALE_FACTOR},   // Vertical
        {x: 20 * SCALE_FACTOR, y: 290 * SCALE_FACTOR},   // Horizontal
        {x: 620 * SCALE_FACTOR, y: 290 * SCALE_FACTOR},  // Vertical
    ];

    // Create foreground black lines with scaled dimensions
    foregroundLines = [
        new Shape(14 * SCALE_FACTOR, 675 * SCALE_FACTOR, '#171A11', true),
        new Shape(14 * SCALE_FACTOR, 740 * SCALE_FACTOR, '#171A11', true),
        new Shape(14 * SCALE_FACTOR, 740 * SCALE_FACTOR, '#171A11', true),
        new Shape(14 * SCALE_FACTOR, 280 * SCALE_FACTOR, '#171A11', true),
        new Shape(740 * SCALE_FACTOR, 14 * SCALE_FACTOR, '#171A11', true),
        new Shape(740 * SCALE_FACTOR, 14 * SCALE_FACTOR, '#171A11', true),
        new Shape(660 * SCALE_FACTOR, 14 * SCALE_FACTOR, '#171A11', true),
        new Shape(455 * SCALE_FACTOR, 14 * SCALE_FACTOR, '#171A11', true)
    ];

    // Set positions for foreground lines (scaled)
    foregroundLinePositions = [
        {x: 90 * SCALE_FACTOR, y: 90 * SCALE_FACTOR},    // Vertical
        {x: 490 * SCALE_FACTOR, y: 15 * SCALE_FACTOR},   // Vertical
        {x: 748 * SCALE_FACTOR, y: 19 * SCALE_FACTOR},   // Vertical
        {x: 300 * SCALE_FACTOR, y: 500 * SCALE_FACTOR},  // Vertical
        {x: 20 * SCALE_FACTOR, y: 90 * SCALE_FACTOR},    // Horizontal
        {x: 20 * SCALE_FACTOR, y: 590 * SCALE_FACTOR},   // Horizontal
        {x: 95 * SCALE_FACTOR, y: 490 * SCALE_FACTOR},   // Horizontal
        {x: 300 * SCALE_FACTOR, y: 745 * SCALE_FACTOR}   // Horizontal
    ];

    // Set initial positions for moving shapes (scaled)
    originalPositions = [
        {x: 90 * SCALE_FACTOR, y: 90 * SCALE_FACTOR},     // Red (large)
        {x: 490 * SCALE_FACTOR, y: 0},                    // Yellow
        {x: 0, y: 590 * SCALE_FACTOR},                    // Yellow
        {x: 500 * SCALE_FACTOR, y: 590 * SCALE_FACTOR},   // Blue
        {x: 90 * SCALE_FACTOR, y: 495 * SCALE_FACTOR},    // Black
        {x: 300 * SCALE_FACTOR, y: 690 * SCALE_FACTOR},   // Black
        {x: 750 * SCALE_FACTOR, y: 590 * SCALE_FACTOR},   // Red (small)
    ];

    // Initialize current positions with velocities
    positions = originalPositions.map(pos => ({
        x: pos.x,
        y: pos.y,
        velocityX: 0,
        velocityY: 0
    }));
    
    generateNewTargets();
}

function generateNewTargets() {
    // Define possible grid positions for colored rectangles
    let gridPositions = [
        {x: 90, y: 0},    // Top section
        {x: 490, y: 0},
        {x: 90, y: 290},  // Middle section
        {x: 300, y: 290},
        {x: 500, y: 290},
        {x: 0, y: 590},   // Bottom section
        {x: 300, y: 590},
        {x: 500, y: 590},
        {x: 750, y: 590}
    ];

    if(random() < 0.2) {
        targetPositions = [...originalPositions];
    } else {
        targetPositions = [];
        let availablePositions = [...gridPositions];
        
        // Generate new positions for moving shapes
        for(let i = 0; i < shapes.length; i++) {
            let pos;
            if(shapes[i].color === '#BB422C' && shapes[i].w > 400) {
                pos = {
                    x: random([90, 300]),
                    y: random([0, 290])
                };
            } else if(shapes[i].color === '#1F3D6F') {
                pos = {
                    x: random([500, 750]),
                    y: 590
                };
            } else {
                let randomIndex = floor(random(availablePositions.length));
                pos = availablePositions.splice(randomIndex, 1)[0];
            }
            targetPositions.push(pos);
        }
    }
}

function draw() {
    // Draw light gray background
    background('#D2D5DA');
    
    // Draw background lines first
    for(let i = 0; i < backgroundLines.length; i++) {
        backgroundLines[i].draw(backgroundLinePositions[i].x, backgroundLinePositions[i].y);
    }

    // Draw and update moving shapes
    if(isSettled) {
        if(millis() / 1000 - lastSettleTime > SETTLE_DURATION) {
            isSettled = false;
            generateNewTargets();
            // Give smaller initial velocity towards new targets
            for(let i = 0; i < positions.length; i++) {
                let pos = positions[i];
                let target = targetPositions[i];
                let dx = target.x - pos.x;
                let dy = target.y - pos.y;
                let dist = sqrt(dx * dx + dy * dy);
                pos.velocityX = (dx / dist) * 1.5; // Reduced initial velocity
                pos.velocityY = (dy / dist) * 1.5;
            }
        }
        // Draw moving shapes in settled state
        for(let i = 0; i < shapes.length; i++) {
            shapes[i].draw(positions[i].x, positions[i].y);
        }
    } else {
        let allSettled = true;
        let totalMovement = 0;
        
        // Update and draw moving shapes
        for(let i = 0; i < shapes.length; i++) {
            let pos = positions[i];
            let target = targetPositions[i];
            let shape = shapes[i];
            
            let dx = target.x - pos.x;
            let dy = target.y - pos.y;
            let distance = sqrt(dx * dx + dy * dy);
            
            totalMovement += abs(pos.velocityX) + abs(pos.velocityY);
            
            if(distance > 1 || abs(pos.velocityX) > 0.01 || abs(pos.velocityY) > 0.01) {
                allSettled = false;
                
                // Minimal noise, only when far from target
                let noiseAmount = distance > 100 ? 0.3 : 0;
                let noiseForceX = map(noise(shape.noiseOffsetX), 0, 1, -noiseAmount, noiseAmount);
                let noiseForceY = map(noise(shape.noiseOffsetY), 0, 1, -noiseAmount, noiseAmount);
                
                shape.noiseOffsetX += shape.speed;
                shape.noiseOffsetY += shape.speed;
                
                // Progressive attraction - stronger as it gets closer
                let attractionForce;
                if (distance < 20) {
                    attractionForce = 0.1; // Strong final snap
                } else if (distance < 50) {
                    attractionForce = 0.04; // Medium attraction
                } else {
                    attractionForce = 0.01; // Gentle initial pull
                }
                
                pos.velocityX += dx * attractionForce;
                pos.velocityY += dy * attractionForce;
                
                // Only add minimal noise when far from target
                if(distance > 100) {
                    pos.velocityX += noiseForceX * 0.05;
                    pos.velocityY += noiseForceY * 0.05;
                }
                
                // Progressive damping - stronger when closer to target
                let damping = distance < 20 ? 0.85 : 0.95;
                pos.velocityX *= damping;
                pos.velocityY *= damping;
                
                // Limit maximum velocity
                let maxSpeed = 3;
                let currentSpeed = sqrt(pos.velocityX * pos.velocityX + pos.velocityY * pos.velocityY);
                if (currentSpeed > maxSpeed) {
                    pos.velocityX = (pos.velocityX / currentSpeed) * maxSpeed;
                    pos.velocityY = (pos.velocityY / currentSpeed) * maxSpeed;
                }
                
                pos.x += pos.velocityX;
                pos.y += pos.velocityY;
            } else {
                // Snap precisely to position
                pos.x = target.x;
                pos.y = target.y;
                pos.velocityX = 0;
                pos.velocityY = 0;
            }
            
            shapes[i].draw(pos.x, pos.y);
        }
        
        if(allSettled && totalMovement < 0.1) {
            isSettled = true;
            lastSettleTime = millis() / 1000;
            for(let pos of positions) {
                pos.velocityX = 0;
                pos.velocityY = 0;
            }
        }
    }
    
    // Draw foreground lines last
    for(let i = 0; i < foregroundLines.length; i++) {
        foregroundLines[i].draw(foregroundLinePositions[i].x, foregroundLinePositions[i].y);
    }
}

function mousePressed() {
    targetPositions = [...originalPositions];
    for(let pos of positions) {
        pos.velocityX = 0;
        pos.velocityY = 0;
    }
    isSettled = false;
}

function mouseMoved() {
    // Additional interactivity could be added here
    return false;
} 