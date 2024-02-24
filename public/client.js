let id = false;
let is_drawing = false;
let selectedColor = 'red'; // Default color
let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };
let lineThickness = 2; // Default line thickness

const shapes = [];

// const socket = new WebSocket (`ws://localhost/`)
const socket = new WebSocket('wss://draw-with-friends.deno.dev/');

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

const container = document.createElement('div');
container.style.position = 'absolute';
container.style.bottom = '20px'; // Centered at the bottom
container.style.left = '50%';
container.style.transform = 'translateX(-50%)';
document.body.appendChild(container);

// Color options UI
const colorOptions = document.createElement('div');

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

container.appendChild(colorOptions);

// Line thickness fader
const thicknessFader = document.createElement('input');
thicknessFader.type = 'range';
thicknessFader.min = 1;
thicknessFader.max = 10;
thicknessFader.value = lineThickness;
thicknessFader.style.width = '200px';
thicknessFader.addEventListener('input', (e) => {
  lineThickness = e.target.value;
});
container.appendChild(thicknessFader);

const cnv = document.createElement(`canvas`);
cnv.width = innerWidth;
cnv.height = innerHeight;
container.appendChild(cnv);

cnv.onpointerdown = (e) => {
  startPoint = {
    x: e.offsetX / cnv.width,
    y: e.offsetY / cnv.height,
  };

  is_drawing = true;
};

cnv.onpointerup = (e) => {
  is_drawing = false;
};

cnv.onpointermove = (e) => {
  if (is_drawing) {
    endPoint = {
      x: e.offsetX / cnv.width,
      y: e.offsetY / cnv.height,
    };

    const msg = {
      method: `draw_line`,
      content: {
        start: startPoint,
        end: endPoint,
        color: selectedColor,
        thickness: lineThickness,
      },
    };

    socket.send(JSON.stringify(msg));

    // Update the start point for the next line segment
    startPoint = endPoint;

    shapes.push(msg.content); // Add the current line segment to the array for immediate drawing
    draw_frame(); // Draw the line immediately
  }
};

const ctx = cnv.getContext(`2d`);

function draw_frame() {
  ctx.clearRect(0, 0, cnv.width, cnv.height); // Clear the canvas before redrawing

  ctx.fillStyle = `turquoise`;
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  shapes.forEach((s) => {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.thickness;
    ctx.beginPath();
    ctx.moveTo(s.start.x * cnv.width, s.start.y * cnv.height);
    ctx.lineTo(s.end.x * cnv.width, s.end.y * cnv.height);
    ctx.stroke();
  });
}

// Initial drawing of existing shapes
draw_frame();
