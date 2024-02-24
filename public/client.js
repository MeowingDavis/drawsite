let id = false
let is_drawing = false
const squares = []

// const socket = new WebSocket (`ws://localhost/`)
const socket = new WebSocket ('wss://draw-with-friends.deno.dev/')

socket.onopen  = () => console.log (`client: websocket opened!`)
socket.onclose = () => console.log (`client: websocket closed!`)

socket.onerror = e => console.dir (e)

socket.onmessage = e => {
   const msg = JSON.parse (e.data)

   const manage_incoming = {

      id: () => {
         id = msg.content
         console.log (`id is ${ id }`)
      },

      add_square: () => {
         console.log (`adding a square!`)
         squares.push (msg.content)
      }
   }

   manage_incoming[msg.method] ()
}

document.body.style.margin   = 0
document.body.style.overflow = `hidden`

const cnv = document.createElement (`canvas`)
cnv.width  = innerWidth
cnv.height = innerHeight

document.body.appendChild (cnv)

cnv.onpointerdown = e => {

   const msg = {
      method: `click_location`,
      content: { 
         x: e.x / cnv.width,
         y: e.y / cnv.height,
      }
   }

   socket.send (JSON.stringify (msg))   

   is_drawing = true
}

cnv.onpointerup = e => {
   is_drawing = false
}

cnv.onpointermove = e => {
   if (is_drawing) {
      const msg = {
         method: `click_location`,
         content: { 
            x: e.x / cnv.width,
            y: e.y / cnv.height,
         }
      }
      socket.send (JSON.stringify (msg))   
   }
}

const ctx = cnv.getContext (`2d`)

draw_frame ()

function draw_frame() {
  ctx.clearRect(0, 0, cnv.width, cnv.height); // Clear the canvas

  // Draw previously drawn lines
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < squares.length - 1; i++) {
      const startPoint = {
          x: squares[i].x * cnv.width,
          y: squares[i].y * cnv.height
      };
      const endPoint = {
          x: squares[i + 1].x * cnv.width,
          y: squares[i + 1].y * cnv.height
      };
      ctx.moveTo(startPoint.x, startPoint.y);
      // ctx.lineTo(endPoint.x, endPoint.y);
  }
  ctx.stroke();

  requestAnimationFrame(draw_frame);
}
