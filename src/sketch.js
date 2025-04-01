// Import Matter.js modules
const { Engine, World, Bodies, Body, Composite } = Matter;

const marbleCategory = 0x0001;
const bassMarbleCategory = 0x0002;
const worldCategory = 0x0003;

// DOM and global variables
const body = document.querySelector('body');
let engine, world;
let marbles = [], borders = [], grid = [], chimes = [];
let isDragging = false;
let bassMarble;
let dragStart = null;

// Mode toggles for placing marbles or creating strings
const mode = { marbles: true, grid: false };

// Call drawCanvas in setup and on resize
function setup() {
    setupUI();
    drawCanvas();

    // Initialize Matter.js engine and world
    engine = Engine.create();
    engine.gravity.y = 0
    world = engine.world;

    // Generate borders and add initial objects
    createBorders();
    createChimes();

    // Create bass marble
    bassMarble = new BassMarble(width / 2, height / 2 + 200, 50);

    // Add collision event listener
    Matter.Events.on(engine, 'collisionStart', handleCollision);
    redrawCanvas();   // Resize canvas 
}

// Handles collisions between marbles and strings
function handleCollision(event) {
    const pairs = event.pairs;

    pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        // Check if one body is a marble and the other is a string
        const isMarbleAndString =
            (bodyA.label === 'marble' && bodyB.label.startsWith('chime')) ||
            (bodyA.label.startsWith('chime') && bodyB.label === 'marble');

        const isBassMarbleAndString =
            (bodyA.label === 'bass-marble' && bodyB.label.startsWith('chime')) ||
            (bodyA.label.startsWith('chime') && bodyB.label === 'bass-marble');

        if (isMarbleAndString) {
            const chimeBody = bodyA.label.startsWith('chime') ? bodyA : bodyB;

            // const marbleBody = bodyB;
            // const velocity = Math.hypot(marbleBody.velocity.x, marbleBody.velocity.y);

            // Find the corresponding String instance and play sound
            const chimeInstance = chimes.find(chime => chime.body === chimeBody);
            if (chimeInstance) {
                // stringInstance.play(smoothVelocity(velocity));
                chimeInstance.play();
            }
        }

        if (isBassMarbleAndString) {
            const chimeBody = bodyA.label.startsWith('chime') ? bodyA : bodyB;
            const chimeInstance = chimes.find(chime => chime.body === chimeBody);
            
            // Switch chime notes and play root note
            if (chimeInstance) {
                switch (chimeInstance.body.label) {
                    case 'chime-1':
                        createChimes(cMaj.first, cMaj.third, cMaj.fifth, cMaj.seventh, cMaj.extended);
                        chimes[0].play(1/2);
                        break;
                    case 'chime-2':
                        createChimes(dMin.first, dMin.third, dMin.fifth, dMin.seventh, dMin.extended);
                        chimes[0].play(1/2);
                        break;
                    case 'chime-3':
                        createChimes(fMaj.first, fMaj.third, fMaj.fifth, fMaj.seventh, fMaj.extended);
                        chimes[0].play(1/2);
                        break;
                    case 'chime-4':
                        createChimes(gMaj.first, gMaj.third, gMaj.fifth, gMaj.seventh, gMaj.extended);
                        chimes[0].play(1/2);
                        break;
                    case 'chime-5':
                        createChimes(aMin.first, aMin.third, aMin.fifth, aMin.seventh, aMin.extended);
                        chimes[0].play(1/2);
                        break;
                    default:
                        break;
                }
            }
        }
    });
}

function mousePressed() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // true for mobile device
        touchStarted();
    } else {
        // false for not mobile device
        // Limit mouse presses to canvas area
        let gridX, gridY;
        if (mouseX < 0 || mouseY < 0 || mouseX >= width || mouseY >= height) return;

        // Place marbles
        if (mode.marbles) {
            marbles.push(new Marble(mouseX, mouseY, 30));
        }
    }
}

function touchStarted() {
    // Place marbles
    if (mode.marbles) {
        marbles.push(new Marble(mouseX, mouseY, 30));
    }
}

// Main draw loop
function draw() {
    clear();
    background(255);
    Engine.update(engine);

    if (mode.grid) grid.forEach(gridLine => gridLine.draw());
    // borders.forEach(border => border.draw());
    chimes.forEach(chime => chime.draw());
    bassMarble.draw();
    marbles.forEach(marble => marble.draw());
}

function redrawCanvas() {
    bassMarble.remove();
    bassMarble = new BassMarble(width / 2, height / 2 + 200, 50);
    clearBorders();
    clearChimes();
    drawCanvas();
    drawGrid();
    createBorders();
    createChimes(cMaj.first, cMaj.third, cMaj.fifth, cMaj.seventh, cMaj.extended);
}

window.addEventListener('resize', redrawCanvas);