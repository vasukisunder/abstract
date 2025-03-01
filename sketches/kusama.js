export function createKusama(p) {
    let circles = [];
    let growth = [];
    let diameters = [];
    let strokeWeights = [];

    p.setup = () => {
        const canvas = p.createCanvas(500, 650);
        p.background('#030400');

        // Starting at 12,12 to more closely mimic the artwork
        for (let x = 12; x <= p.width; x += 10) {
            for (let y = 12; y <= p.height; y += 10) {
                let diameter = p.random(3, 7);
                circles.push({x: x, y: y, d: diameter}); // storing the x y coordinates and the random diameter
                growth.push(p.random(0.01, 0.2));  // storing a random value for growth so it pulses
                diameters.push(diameter);  // remembering original diameter so mouse XY has an effect
                strokeWeights.push(p.random(1, 3));
            }
        }
    };

    p.draw = () => {
        p.background('#030400');
        for (let i = 0; i < circles.length; i++) {
            let circle = circles[i];

            let d = p.dist(p.mouseX, p.mouseY, circle.x, circle.y);
            if (d < 100) {
                circle.d = diameters[i] + 0.5;
            } else {
                circle.d += growth[i];

                // Pulsing effect
                if (circle.d > 7 || circle.d < 3) {
                    growth[i] *= -1;
                }
            }

            p.noFill();
            p.stroke('#D5D6CE');
            p.strokeWeight(strokeWeights[i]);
            p.ellipse(circle.x, circle.y, circle.d);
        }
    };
} 