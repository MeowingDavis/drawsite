let id = false;
let is_drawing = false;
let selectedColor = 'red'; // Default color
let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };

const shapes = [];

// const socket = new WebSocket (`ws://localhost/`)
const socket = new WebSocket('ws://draw-with-friends.deno.dev/');

socket.onopen = () => console.log(`client: websocket opened!`);
socket.onclose = () => console.log(`client: websocket closed!`);

socket.onerror = (e) => console.dir(e);

socket.onmessage = (e) => {
  const msg = JSON.parse(e.data);

  const manage_incoming = {
    id: () => {
      id = msg.content;
      console.log(`id is ${id}`);
    },

    add_shape: () => {
      console.log(`adding a shape!`);
      shapes.push(msg.content);
    },
  };

  manage_incoming[msg.method]();
};

document.body.style.margin = 0;
document.body.style.overflow = `hidden`;

const cnv = document.createElement(`canvas`);
cnv.width = innerWidth;
cnv.height = innerHeight;

document.body.appendChild(cnv);

// Color options UI
const colorOptions = document.createElement('div');
colorOptions.style.position = 'absolute';
colorOptions.style.bottom = '20px'; // Centered at the bottom
colorOptions.style.left = '50%';
colorOptions.style.transform = 'translateX(-50%)';

const colors = ['red', 'green', 'blue'];

colors.forEach((color) => {
  const colorButton = document.createElement('button');
  colorButton.style.backgroundColor = color;
  colorButton.style.borderRadius = '50%'; // Make the button round
  colorButton.style.width = '50px';
  colorButton.style.height = '50px';
  colorButton.style.margin = '0 10px'; // Add some space between buttons
  colorButton.addEventListener('click', () => {
    selectedColor = color;
  });
  colorOptions.appendChild(colorButton);
});

document.body.appendChild(colorOptions);

cnv.onpointerdown = (e) => {
  startPoint = {
    x: e.x / cnv.width,
    y: e.y / cnv.height,
  };

  is_drawing = true;
};

cnv.onpointerup = (e) => {
  is_drawing = false;
};

cnv.onpointermove = (e) => {
  if (is_drawing) {
    endPoint = {
      x: e.x / cnv.width,
      y: e.y / cnv.height,
    };

    const msg = {
      method: `draw_line`,
      content: {
        start: startPoint,
        end: endPoint,
        color: selectedColor,
      },
    };

    socket.send(JSON.stringify(msg));

    // Update the start point for the next line segment
    startPoint = endPoint;

    shapes.push(msg.content); // Add the current line segment to the array for immediate drawing
  }
};

const ctx = cnv.getContext(`2d`);

draw_frame();

function draw_frame() {
  ctx.clearRect(0, 0, cnv.width, cnv.height); // Clear the canvas before redrawing

  ctx.fillStyle = `turquoise`;
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  shapes.forEach((s) => {
    ctx.strokeStyle = s.color;
    ctx.beginPath();
    ctx.moveTo(s.start.x * cnv.width, s.start.y * cnv.height);
    ctx.lineTo(s.end.x * cnv.width, s.end.y * cnv.height);
    ctx.stroke();
  });

  requestAnimationFrame(draw_frame);
}
