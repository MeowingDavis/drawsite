let id = false;
let is_drawing = false;
const squares = [];

// const socket = new WebSocket (`ws://localhost/`)
const socket = new WebSocket('wss://draw-with-friends.deno.dev/');

socket.onopen = () => console.log(`client: websocket opened!`);
socket.onclose = () => console.log(`client: websocket closed!`);

socket.onerror = e => console.dir(e);

socket.onmessage = e => {
    const msg = JSON.parse(e.data);

    const manage_incoming = {

        id: () => {
            id = msg.content;
            console.log(`id is ${id}`);
        },

        add_square: () => {
            console.log(`adding a square!`);
            squares.push(msg.content);
        }
    };

    manage_incoming[msg.method]();
};

document.body.style.margin = 0;
document.body.style.overflow = `hidden`;

const cnv = document.createElement(`canvas`);
cnv.width = innerWidth;
cnv.height = innerHeight;

document.body.appendChild(cnv);

let currentLine = []; // Store points for the current line

cnv.onpointerdown = e => {
    currentLine = []; // Start a new line
    const point = {
        x: e.x / cnv.width,
        y: e.y / cnv.height
    };
    currentLine.push(point);
};

cnv.onpointermove = e => {
    if (is_drawing) {
        const point = {
            x: e.x / cnv.width,
            y: e.y / cnv.height
        };
        currentLine.push(point); // Add point to the current line
    }
};

cnv.onpointerup = e => {
    if (currentLine.length > 1) {
        squares.push(currentLine); // Store the completed line
    }
};

const ctx = cnv.getContext(`2d`);

draw_frame();

function draw_frame() {
    ctx.clearRect(0, 0, cnv.width, cnv.height); // Clear the canvas

    // Draw previously drawn lines
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    for (const line of squares) {
        ctx.beginPath();
        ctx.moveTo(line[0].x * cnv.width, line[0].y * cnv.height);
        for (let i = 1; i < line.length; i++) {
            ctx.lineTo(line[i].x * cnv.width, line[i].y * cnv.height);
        }
        ctx.stroke();
    }

    requestAnimationFrame(draw_frame);
}
