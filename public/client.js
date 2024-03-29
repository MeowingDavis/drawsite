let id = false;
let is_drawing = false;
const squares = [];
const SQUARE_SIZE = 10; // Define the size of the square

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
            squares.push(msg.content);
            draw_frame(); // Redraw the canvas when a new square is added
        }
    };

    manage_incoming[msg.method]();
};

document.body.style.margin = 0;
document.body.style.overflow = 'hidden';

const cnv = document.createElement('canvas');
cnv.width = innerWidth;
cnv.height = innerHeight;

document.body.appendChild(cnv);

cnv.onpointerdown = e => {
    const msg = {
        method: 'click_location',
        content: {
            x: e.x / cnv.width,
            y: e.y / cnv.height,
        }
    };

    socket.send(JSON.stringify(msg));

    is_drawing = true;
};

cnv.onpointerup = e => {
    is_drawing = false;
};

cnv.onpointermove = e => {
    if (is_drawing) {
        const msg = {
            method: 'click_location',
            content: {
                x: e.x / cnv.width,
                y: e.y / cnv.height,
            }
        };
        socket.send(JSON.stringify(msg));
    }
};

const ctx = cnv.getContext('2d');

function draw_frame() {
    ctx.clearRect(0, 0, cnv.width, cnv.height); // Clear the canvas

    // Draw squares
    ctx.fillStyle = 'black';
    squares.forEach(square => {
        const x = square.x * cnv.width - SQUARE_SIZE / 2;
        const y = square.y * cnv.height - SQUARE_SIZE / 2;
        ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
    });
}

draw_frame(); // Draw initial frame
