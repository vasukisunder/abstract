export function createMondrian(p) {
    const SCALE_FACTOR = 0.6;
    const ACTUAL_WIDTH = 800 * SCALE_FACTOR;
    const ACTUAL_HEIGHT = 790 * SCALE_FACTOR;
    const MOVEMENT_DURATION = 5;
    const SETTLE_DURATION = 3;

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
            this.noiseOffsetX = p.random(1000);
            this.noiseOffsetY = p.random(1000);
            this.speed = p.random(0.001, 0.002);
        }

        draw(x, y) {
            p.fill(this.color);
            p.noStroke();
            p.rect(x, y, this.w, this.h);
        }
    }

    p.setup = () => {
        const canvas = p.createCanvas(ACTUAL_WIDTH, ACTUAL_HEIGHT);
        p.frameRate(60);
        
        // Create moving shapes
        shapes = [
            new Shape(415 * SCALE_FACTOR, 410 * SCALE_FACTOR, '#dc432c'),
            new Shape(265 * SCALE_FACTOR, 300 * SCALE_FACTOR, '#DFBC53'),
            new Shape(105 * SCALE_FACTOR, 203 * SCALE_FACTOR, '#DFBC53'),
            new Shape(250 * SCALE_FACTOR, 160 * SCALE_FACTOR, '#1F3D6F'),
            new Shape(215 * SCALE_FACTOR, 210 * SCALE_FACTOR, '#171A11'),
            new Shape(200 * SCALE_FACTOR, 60 * SCALE_FACTOR, '#171A11'),
            new Shape(50 * SCALE_FACTOR, 200 * SCALE_FACTOR, '#dc432c'),
        ];

        // Create background lines
        backgroundLines = [
            new Shape(14 * SCALE_FACTOR, 685 * SCALE_FACTOR, '#171A11', true),
            new Shape(740 * SCALE_FACTOR, 14 * SCALE_FACTOR, '#171A11', true),
            new Shape(14 * SCALE_FACTOR, 213 * SCALE_FACTOR, '#171A11', true),
        ];

        backgroundLinePositions = [
            {x: 190 * SCALE_FACTOR, y: 20 * SCALE_FACTOR},
            {x: 20 * SCALE_FACTOR, y: 290 * SCALE_FACTOR},
            {x: 620 * SCALE_FACTOR, y: 290 * SCALE_FACTOR},
        ];

        // Create foreground lines
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

        foregroundLinePositions = [
            {x: 90 * SCALE_FACTOR, y: 90 * SCALE_FACTOR},
            {x: 490 * SCALE_FACTOR, y: 15 * SCALE_FACTOR},
            {x: 748 * SCALE_FACTOR, y: 19 * SCALE_FACTOR},
            {x: 300 * SCALE_FACTOR, y: 500 * SCALE_FACTOR},
            {x: 20 * SCALE_FACTOR, y: 90 * SCALE_FACTOR},
            {x: 20 * SCALE_FACTOR, y: 590 * SCALE_FACTOR},
            {x: 95 * SCALE_FACTOR, y: 490 * SCALE_FACTOR},
            {x: 300 * SCALE_FACTOR, y: 745 * SCALE_FACTOR}
        ];

        originalPositions = [
            {x: 90 * SCALE_FACTOR, y: 90 * SCALE_FACTOR},
            {x: 490 * SCALE_FACTOR, y: 0},
            {x: 0, y: 590 * SCALE_FACTOR},
            {x: 500 * SCALE_FACTOR, y: 590 * SCALE_FACTOR},
            {x: 90 * SCALE_FACTOR, y: 495 * SCALE_FACTOR},
            {x: 300 * SCALE_FACTOR, y: 690 * SCALE_FACTOR},
            {x: 750 * SCALE_FACTOR, y: 590 * SCALE_FACTOR},
        ];

        positions = originalPositions.map(pos => ({
            x: pos.x,
            y: pos.y,
            velocityX: 0,
            velocityY: 0
        }));
        
        generateNewTargets();
    };

    function generateNewTargets() {
        let gridPositions = [
            {x: 90, y: 0},
            {x: 490, y: 0},
            {x: 90, y: 290},
            {x: 300, y: 290},
            {x: 500, y: 290},
            {x: 0, y: 590},
            {x: 300, y: 590},
            {x: 500, y: 590},
            {x: 750, y: 590}
        ].map(pos => ({
            x: pos.x * SCALE_FACTOR,
            y: pos.y * SCALE_FACTOR
        }));

        if(p.random() < 0.2) {
            targetPositions = [...originalPositions];
        } else {
            targetPositions = [];
            let availablePositions = [...gridPositions];
            
            for(let i = 0; i < shapes.length; i++) {
                let pos;
                if(shapes[i].color === '#dc432c' && shapes[i].w > 400 * SCALE_FACTOR) {
                    pos = {
                        x: p.random([90, 300]) * SCALE_FACTOR,
                        y: p.random([0, 290]) * SCALE_FACTOR
                    };
                } else if(shapes[i].color === '#1F3D6F') {
                    pos = {
                        x: p.random([500, 750]) * SCALE_FACTOR,
                        y: 590 * SCALE_FACTOR
                    };
                } else {
                    let randomIndex = p.floor(p.random(availablePositions.length));
                    pos = availablePositions.splice(randomIndex, 1)[0];
                }
                targetPositions.push(pos);
            }
        }
    }

    p.draw = () => {
        p.background('#D2D5DA');
        
        for(let i = 0; i < backgroundLines.length; i++) {
            backgroundLines[i].draw(backgroundLinePositions[i].x, backgroundLinePositions[i].y);
        }

        if(isSettled) {
            if(p.millis() / 1000 - lastSettleTime > SETTLE_DURATION) {
                isSettled = false;
                generateNewTargets();
                for(let i = 0; i < positions.length; i++) {
                    let pos = positions[i];
                    let target = targetPositions[i];
                    let dx = target.x - pos.x;
                    let dy = target.y - pos.y;
                    let dist = p.sqrt(dx * dx + dy * dy);
                    pos.velocityX = (dx / dist) * 1.5;
                    pos.velocityY = (dy / dist) * 1.5;
                }
            }
            for(let i = 0; i < shapes.length; i++) {
                shapes[i].draw(positions[i].x, positions[i].y);
            }
        } else {
            let allSettled = true;
            let totalMovement = 0;
            
            for(let i = 0; i < shapes.length; i++) {
                let pos = positions[i];
                let target = targetPositions[i];
                let shape = shapes[i];
                
                let dx = target.x - pos.x;
                let dy = target.y - pos.y;
                let distance = p.sqrt(dx * dx + dy * dy);
                
                totalMovement += p.abs(pos.velocityX) + p.abs(pos.velocityY);
                
                if(distance > 1 || p.abs(pos.velocityX) > 0.01 || p.abs(pos.velocityY) > 0.01) {
                    allSettled = false;
                    
                    let noiseAmount = distance > 100 ? 0.3 : 0;
                    let noiseForceX = p.map(p.noise(shape.noiseOffsetX), 0, 1, -noiseAmount, noiseAmount);
                    let noiseForceY = p.map(p.noise(shape.noiseOffsetY), 0, 1, -noiseAmount, noiseAmount);
                    
                    shape.noiseOffsetX += shape.speed;
                    shape.noiseOffsetY += shape.speed;
                    
                    let attractionForce;
                    if (distance < 20) {
                        attractionForce = 0.1;
                    } else if (distance < 50) {
                        attractionForce = 0.04;
                    } else {
                        attractionForce = 0.01;
                    }
                    
                    pos.velocityX += dx * attractionForce;
                    pos.velocityY += dy * attractionForce;
                    
                    if(distance > 100) {
                        pos.velocityX += noiseForceX * 0.05;
                        pos.velocityY += noiseForceY * 0.05;
                    }
                    
                    let damping = distance < 20 ? 0.85 : 0.95;
                    pos.velocityX *= damping;
                    pos.velocityY *= damping;
                    
                    let maxSpeed = 3;
                    let currentSpeed = p.sqrt(pos.velocityX * pos.velocityX + pos.velocityY * pos.velocityY);
                    if (currentSpeed > maxSpeed) {
                        pos.velocityX = (pos.velocityX / currentSpeed) * maxSpeed;
                        pos.velocityY = (pos.velocityY / currentSpeed) * maxSpeed;
                    }
                    
                    pos.x += pos.velocityX;
                    pos.y += pos.velocityY;
                } else {
                    pos.x = target.x;
                    pos.y = target.y;
                    pos.velocityX = 0;
                    pos.velocityY = 0;
                }
                
                shapes[i].draw(pos.x, pos.y);
            }
            
            if(allSettled && totalMovement < 0.1) {
                isSettled = true;
                lastSettleTime = p.millis() / 1000;
                for(let pos of positions) {
                    pos.velocityX = 0;
                    pos.velocityY = 0;
                }
            }
        }
        
        for(let i = 0; i < foregroundLines.length; i++) {
            foregroundLines[i].draw(foregroundLinePositions[i].x, foregroundLinePositions[i].y);
        }
    };

    p.mousePressed = () => {
        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
            targetPositions = [...originalPositions];
            for(let pos of positions) {
                pos.velocityX = 0;
                pos.velocityY = 0;
            }
            isSettled = false;
            return false;
        }
    };
} 