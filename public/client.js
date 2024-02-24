let id = false;
let is_drawing = false;
let lastX = 0;
let lastY = 0;

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
    lastX = e.x / cnv.width;
    lastY = e.y / cnv.height;
};

cnv.onpointerup = e => {
    is_drawing = false;
};

cnv.onpointermove = e => {
    if (is_drawing) {
        const currentX = e.x / cnv.width;
        const currentY = e.y / cnv.height;
        draw_line(lastX, lastY, currentX, currentY);
        lastX = currentX;
        lastY = currentY;
        const msg = {
            method: 'click_location',
            content: {
                x: currentX,
                y: currentY
            }
        };
        socket.send(JSON.stringify(msg));
    }
};

const ctx = cnv.getContext('2d');

function draw_line(startX, startY, endX, endY) {
    ctx.clearRect(0, 0, cnv.width, cnv.height); // Clear the canvas
    ctx.beginPath();
    ctx.moveTo(startX * cnv.width, startY * cnv.height);
    ctx.lineTo(endX * cnv.width, endY * cnv.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
}
