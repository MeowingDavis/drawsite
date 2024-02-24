let id = false;
let is_drawing = false;
let current_color = 'black'; // Default color
const lines = []; // Array to store line data

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
    add_line: () => {
      console.log(`adding a line!`);
      lines.push(msg.content);
    },
  };

  manage_incoming[msg.method]();
};

document.body.style.margin = 0;
document.body.style.overflow = 'hidden';

const cnv = document.createElement('canvas');
cnv.width = window.innerWidth;
cnv.height = window.innerHeight;

document.body.appendChild(cnv);

// Function to change the drawing color
function changeColor(newColor) {
  current_color = newColor;
}

// Event listeners for changing color
document.querySelectorAll('.color-selector').forEach((btn) => {
  btn.addEventListener('click', () => {
    changeColor(btn.dataset.color);
  });
});

cnv.onpointerdown = (e) => {
  const msg = {
    method: 'start_line',
    content: {
      x: e.x / cnv.width,
      y: e.y / cnv.height,
      color: current_color,
    },
  };
  socket.send(JSON.stringify(msg));

  is_drawing = true;
};

cnv.onpointerup = () => {
  is_drawing = false;
};

cnv.onpointermove = (e) => {
  if (is_drawing) {
    const msg = {
      method: 'draw_line',
      content: {
        x: e.x / cnv.width,
        y: e.y / cnv.height,
        color: current_color,
      },
    };
    socket.send(JSON.stringify(msg));
  }
};

const ctx = cnv.getContext('2d');

draw_frame();

function draw_frame() {
  ctx.clearRect(0, 0, cnv.width, cnv.height);

  lines.forEach((line) => {
    ctx.beginPath();
    ctx.strokeStyle = line.color;
    ctx.moveTo(line.startX * cnv.width, line.startY * cnv.height);
    ctx.lineTo(line.endX * cnv.width, line.endY * cnv.height);
    ctx.stroke();
  });

  requestAnimationFrame(draw_frame);
}
