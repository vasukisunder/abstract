export function createMondrian(p) {
    const ACTUAL_WIDTH = 480;
    const ACTUAL_HEIGHT = 474;
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
        
        shapes = [
            new Shape(249, 246, '#dc432c'),
            new Shape(159, 180, '#DFBC53'),
            new Shape(63, 122, '#DFBC53'),
            new Shape(150, 96, '#1F3D6F'),
            new Shape(129, 126, '#171A11'),
            new Shape(120, 36, '#171A11'),
            new Shape(30, 120, '#dc432c'),
        ];

        backgroundLines = [
            new Shape(8.4, 411, '#171A11', true),
            new Shape(444, 8.4, '#171A11', true),
            new Shape(8.4, 128, '#171A11', true),
        ];

        backgroundLinePositions = [
            {x: 114, y: 12},
            {x: 12, y: 174},
            {x: 372, y: 174},
        ];

        foregroundLines = [
            new Shape(8.4, 405, '#171A11', true),
            new Shape(8.4, 444, '#171A11', true),
            new Shape(8.4, 444, '#171A11', true),
            new Shape(8.4, 168, '#171A11', true),
            new Shape(444, 8.4, '#171A11', true),
            new Shape(444, 8.4, '#171A11', true),
            new Shape(396, 8.4, '#171A11', true),
            new Shape(273, 8.4, '#171A11', true)
        ];

        foregroundLinePositions = [
            {x: 54, y: 54},
            {x: 294, y: 9},
            {x: 449, y: 11},
            {x: 180, y: 300},
            {x: 12, y: 54},
            {x: 12, y: 354},
            {x: 57, y: 294},
            {x: 180, y: 447}
        ];

        originalPositions = [
            {x: 54, y: 54},
            {x: 294, y: 0},
            {x: 0, y: 354},
            {x: 300, y: 354},
            {x: 54, y: 297},
            {x: 180, y: 414},
            {x: 450, y: 354},
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
            {x: 54, y: 0},
            {x: 294, y: 0},
            {x: 54, y: 174},
            {x: 180, y: 174},
            {x: 300, y: 174},
            {x: 0, y: 354},
            {x: 180, y: 354},
            {x: 300, y: 354},
            {x: 450, y: 354}
        ];

        if(p.random() < 0.2) {
            targetPositions = [...originalPositions];
        } else {
            targetPositions = [];
            let availablePositions = [...gridPositions];
            
            for(let i = 0; i < shapes.length; i++) {
                let pos;
                if(shapes[i].color === '#dc432c' && shapes[i].w > 240) {
                    pos = {
                        x: p.random([54, 180]),
                        y: p.random([0, 174])
                    };
                } else if(shapes[i].color === '#1F3D6F') {
                    pos = {
                        x: p.random([300, 450]),
                        y: 354
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