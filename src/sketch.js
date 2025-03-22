// Import Matter.js modules
const { Engine, World, Bodies, Composite } = Matter;

const GRID_SIZE = 50;

// DOM and global variables
const body = document.querySelector('body');
let engine, world;
let strings = [], marbles = [], borders = [], grid = [];
let buttonHighlight = '#252525';
let buttonHighlightText = 'white';
let mouseCount = 0;
let stringPos1, stringPos2;

let audioContext;
let source;

// Mode toggles for placing marbles or creating strings
const mode = { marbles: true, strings: false, grid: false };

// Call drawCanvas in setup and on resize
function setup() {
    setupUI();
    drawCanvas();

    // Initialize Matter.js engine and world
    engine = Engine.create();
    world = engine.world;

    // Generate borders and add initial objects
    generateBorders();
    strings.push(new String(150, 100, width * 0.6, 5, 0.4));
    marbles.push(new Marble(50, 50, 30));

    // Add collision event listener
    Matter.Events.on(engine, 'collisionStart', handleCollision);
}

window.addEventListener('resize', () => {
    clearBorders();
    drawCanvas();
    generateBorders();
});

// Handles collisions between marbles and strings
function handleCollision(event) {
    const pairs = event.pairs;

    pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        // Check if one body is a marble and the other is a string
        const isMarbleAndString =
            (bodyA.label === 'marble' && bodyB.label === 'string') ||
            (bodyA.label === 'string' && bodyB.label === 'marble');

        if (isMarbleAndString) {
            const stringBody = bodyA.label === 'string' ? bodyA : bodyB;

            // Find the corresponding String instance and play sound
            const stringInstance = strings.find(string => string.body === stringBody);
            if (stringInstance) {
                stringInstance.play(stringInstance.w); // Play sound at 440 Hz
            }
        }
    });
}

// Sets up the UI with buttons for different actions
function setupUI() {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'controls-container';

    const buttons = [
        { id: 'place-marble-btn', text: 'Place Marble', handler: () => setMode(true) },
        { id: 'create-string-btn', text: 'Create String', handler: () => setMode(false) },
        { id: 'clear-marbles-btn', text: 'Clear Marbles', handler: clearMarbles },
        { id: 'clear-strings-btn', text: 'Clear Strings', handler: clearStrings },
        { id: 'grid-btn', text: 'Grid', handler: toggleGrid }
    ];

    buttons.forEach(({ id, text, handler }) => {
        const btn = document.createElement('button');
        btn.id = id;
        btn.textContent = text;

        // Highlight the "Place Marble" button by default
        if (id === 'place-marble-btn') applyButtonHighlight(btn, true);

        btn.addEventListener('click', handler);
        controlsContainer.appendChild(btn);
    });

    body.appendChild(controlsContainer);
}

// Toggles between marble and string placement modes
function setMode(marblesActive) {
    mode.marbles = marblesActive;
    mode.strings = !marblesActive;

    applyButtonHighlight(document.getElementById('place-marble-btn'), marblesActive);
    applyButtonHighlight(document.getElementById('create-string-btn'), !marblesActive);
}

// Highlights the active button
function applyButtonHighlight(button, isActive) {
    button.style.background = isActive ? buttonHighlight : '#efefef';
    button.style.color = isActive ? buttonHighlightText : 'black';
}

// Handles mouse press events for placing marbles or creating strings
function mousePressed() {
    // Limit mouse presses to canvas area
    let gridX, gridY;
    if (mouseX < 0 || mouseY < 0 || mouseX >= width || mouseY >= height) return;

    if (mode.marbles) {
        // Grid mode trial
        marbles.push(new Marble(mouseX, mouseY, 30));
    } else {
        // Round to nearest 10
        if (mode.grid) {
            gridX = Math.round(mouseX / GRID_SIZE) * GRID_SIZE;
            gridY = Math.round(mouseY / GRID_SIZE) * GRID_SIZE;
            console.log(gridX, gridY);
        } else {
            gridX = mouseX;
            gridY = mouseY;
        }
        if (mouseCount === 0) {
            stringPos1 = { x: gridX, y: gridY };
            mouseCount++;
        } else {
            stringPos2 = { x: gridX, y: gridY };
            createLineBetweenPoints(strings, stringPos1, stringPos2);
            mouseCount = 0;
        }
    }
}

function drawGrid() {
    console.log('test');
    // grid.push(new GridLine(width/2, 10, width, 1));
    for (let i = 0; i < height; i++) {
        if (i % GRID_SIZE === 0) {
            grid.push(new GridLine(width/2, i, width, 1));
        }
    }
    
    for (let j = 0; j < height; j++) {
        if (j % GRID_SIZE === 0) {
            grid.push(new GridLine(j, height/2, 1, height));
        }
    }
}

function toggleGrid() {
    if (mode.grid) {
        mode.grid = false;
    } else {
        mode.grid = true;
    }
    applyButtonHighlight(document.getElementById('grid-btn'), mode.grid);
    drawGrid();
}

// Checks if coordinates are within the canvas, accounting for rounded corners
function isWithinCanvas(x, y, radius) {
    if (x >= 0 && x <= width && y >= radius && y <= height - radius) return true;
    if (x >= radius && x <= width - radius && y >= 0 && y <= height) return true;

    const corners = [
        { cx: radius, cy: radius },                     // Top-left
        { cx: width - radius, cy: radius },             // Top-right
        { cx: radius, cy: height - radius },            // Bottom-left
        { cx: width - radius, cy: height - radius }     // Bottom-right
    ];

    return corners.some(({ cx, cy }) => (x - cx) ** 2 + (y - cy) ** 2 < radius ** 2);
}

// Creates a line between two points and adds it to the specified array
function createLineBetweenPoints(arr, pos1, pos2) {
    const midX = (pos2.x + pos1.x) / 2;
    const midY = (pos2.y + pos1.y) / 2;

    let opp = pos2.y - pos1.y;
    let adj = pos2.x - pos1.x;

    if (adj < 0) opp *= -1;

    const hyp = Math.hypot(opp, adj);
    const rotation = Math.asin(opp / hyp);

    if (arr === strings) {
        arr.push(new String(midX, midY, hyp, 5, rotation));
    } else {
        arr.push(new Boundary(midX, midY, hyp, 5, rotation));
    }
}

// Generates borders around the canvas
function generateBorders() {
    const thickness = 50;
    borders.push(new Boundary(width / 2, -thickness / 2, width, thickness));
    borders.push(new Boundary(-thickness / 2, height / 2, thickness, height));
    borders.push(new Boundary(width / 2, height + thickness / 2, width, thickness));
    borders.push(new Boundary(width + thickness / 2, height / 2, thickness, height));

    createCornerBorders();
}

// Creates corner borders with angled lines
function createCornerBorders() {
    // Top-left corner
    createLineBetweenPoints(borders, { x: -6, y: 50 }, { x: 50, y: -6 });
    createLineBetweenPoints(borders, { x: 0, y: 25 }, { x: 75, y: -10 });
    createLineBetweenPoints(borders, { x: -10, y: 75 }, { x: 25, y: 0 });

    // Top-right corner
    createLineBetweenPoints(borders, { x: width + 6, y: 50 }, { x: width - 50, y: -6 });
    createLineBetweenPoints(borders, { x: width, y: 25 }, { x: width - 75, y: -10 });
    createLineBetweenPoints(borders, { x: width + 10, y: 75 }, { x: width - 25, y: 0 });

    // Bottom-left corner
    createLineBetweenPoints(borders, { x: -6, y: height - 50 }, { x: 50, y: height + 6 });
    createLineBetweenPoints(borders, { x: 0, y: height - 25 }, { x: 75, y: height + 10 });
    createLineBetweenPoints(borders, { x: -10, y: height - 75 }, { x: 25, y: height });

    // Bottom-right corner
    createLineBetweenPoints(borders, { x: width + 6, y: height - 50 }, { x: width - 50, y: height + 6 });
    createLineBetweenPoints(borders, { x: width, y: height - 25 }, { x: width - 75, y: height + 10 });
    createLineBetweenPoints(borders, { x: width + 10, y: height - 75 }, { x: width - 25, y: height });
}

// Clears all marbles from the canvas
function clearMarbles() {
    marbles.forEach(marble => marble.remove());
    marbles = [];
}

// Clears all strings from the canvas
function clearStrings() {
    strings.forEach(string => string.remove());
    strings = [];
}

// Clears all borders from the canvas
function clearBorders() {
    borders.forEach(border => border.remove());
    borders = [];
}

// Main draw loop
function draw() {
    clear();
    background(255);
    Engine.update(engine);

    if (mode.grid) grid.forEach(gridLine => gridLine.draw());
    strings.forEach(string => string.draw());
    borders.forEach(border => border.draw());
    marbles.forEach(marble => marble.draw());
}

// Draw canvas to nearest 10 or 100 to ensure grid works correctly
function drawCanvas() {
    const screenWidthCutoff = screen.width % 100;
    const screenHeightCutoff = screen.height % 100;
    const screenWidth = screen.width - screenWidthCutoff;
    const screenHeight = screen.height - screenHeightCutoff;
    const controlsContainer = document.getElementById('controls-container');
    const heightAdjust = Math.floor((screenHeight - controlsContainer.offsetHeight) / 10) * 10;

    if (screen.width > screen.height) {
        if (screen.width > 640) {
            createCanvas(screenHeight, screenHeight);
        } else {
            createCanvas(screenWidth, heightAdjust);
        }
    } else {
        if (screen.width > 640) {
            createCanvas(screenWidth, screenWidth);
            console.log('test');
        } else {
            createCanvas(screenWidth, heightAdjust);
        }
    }
    
    // Get width of canvas and controls container
    const canvasControlsWidth = (body.offsetWidth > body.offsetHeight) ? 
    width + 200:
    width + controlsContainer.offsetWidth;

    if (canvasControlsWidth > screen.width) {
        body.style.flexDirection = 'column';
        body.style.gap = '1em';
        controlsContainer.style.flexDirection = 'row';
        controlsContainer.style.flexWrap = 'wrap';
        controlsContainer.style.justifyContent = 'center';
        if (screen.width > 640) createCanvas(heightAdjust, heightAdjust);
    } else {
        body.style.flexDirection = 'row';
        body.style.gap = '3em';
        controlsContainer.style.flexDirection = 'column';
    }
    
}