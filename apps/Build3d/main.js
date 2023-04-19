/* constants */

const EMPTY = (1 << 15);
const EDGE_L2 = 4;
const EDGE_M1 = (1 << EDGE_L2) - 1;

/* get position number in map */

function getPos(x, y, z) {

  return (x << (2 * EDGE_L2)) | (y << EDGE_L2) | z;
}

/* get color number */

function getColor(s) {

  return (Number('0x' + s.substr(1, 2)) << 16) | (Number('0x' + s.substr(3, 2)) << 8) | Number('0x' + s.substr(5, 2));
}

/* get square of distance of a side of square from camera */

function dist(cam, pli) {

  var ma = 0;

  for(var i in pli.p) {

    ma = Math.max(ma, camera.getDist(pli.p[i]));
  }

  return ma;
}

/* check if point is inside a polygon */

function inside(point, poly) {

    var x = point.x, y = point.y;

    var vs = poly.p;

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i].y;
        var xj = vs[j].x, yj = vs[j].y;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

var camera = new Camera(90, 2); // Camera object

camera.rotate(-Math.PI * 0.25, -Math.PI * 0.25);

/* map for testing, this part of code will later be replaced */

var map = new Uint32Array(1 << (3 * EDGE_L2));

for(var i = 0; i < 32768; i++) map[i] = EMPTY;

for(var i = 0; i < (1 << EDGE_L2); i++) for(var j = 0; j < (1 << EDGE_L2); j++) map[getPos(i, 0, j)] = 255 << 8;

/* render */

var plains3D = [], projections = [];

/* check if place in the map is empty */

function isEmpty(x, y, z) {

  return x < 0 || y < 0 || z < 0 || x > EDGE_M1 || y > EDGE_M1 || z > EDGE_M1 || map[getPos(x, y, z)] == EMPTY;
}

/* left pad */

String.prototype.lpad = function(n, c) {

  s = '';

  for(var i = 0; i < Math.max(n - this.length, 0); i++) {

    s += '0';
  }

  return s + this;
}

function color2hex(val, aa) {
    return '#' + Math.floor(((val >> 16) & 255)*aa).toString(16).lpad(2, '0') +
        Math.floor(((val >> 8) & 255)*aa).toString(16).lpad(2, '0') +
        Math.floor((val & 255)*aa).toString(16).lpad(2, '0');
}

/* function for loading a 3bm (bitmap format for 93D ) */

function loadMap(map) {

  plains3D = [];

  for(var x = 0; x < (1 << EDGE_L2); x++) {
    for(var y = 0; y < (1 << EDGE_L2); y++) {
      for(var z = 0; z < (1 << EDGE_L2); z++) {
        if(map[getPos(x, y, z)] != EMPTY) {

	    var xx = map[getPos(x, y, z)];
            var color1 = color2hex(xx, 1);
	    var color2 = color2hex(xx, .9);
	    var color3 = color2hex(xx, .8);
	    var color4 = color2hex(xx, .7);

          if(isEmpty(x + 1, y, z)) plains3D.push(new Plain(
	      // right
            new Point3D(x + 1, y + 1, z + 1),
            new Point3D(x + 1, y + 1, z),
            new Point3D(x + 1, y, z),
            new Point3D(x + 1, y, z + 1),

            color2, new Point3D(x, y, z), new Point3D(x + 1, y, z)
          ));
          if(isEmpty(x, y - 1, z)) plains3D.push(new Plain(
	      // down
            new Point3D(x, y, z),
            new Point3D(x, y, z + 1),
            new Point3D(x + 1, y, z + 1),
            new Point3D(x + 1, y, z),

            color4, new Point3D(x, y, z), new Point3D(x, y - 1, z)
          ));
          if(isEmpty(x, y, z + 1)) plains3D.push(new Plain(
	      // back
            new Point3D(x, y + 1, z + 1),
            new Point3D(x + 1, y + 1, z + 1),
            new Point3D(x + 1, y, z + 1),
            new Point3D(x, y, z + 1),

              color3, new Point3D(x, y, z), new Point3D(x, y, z + 1)
          ));
          if(isEmpty(x - 1, y, z)) plains3D.push(new Plain(
	      // left
            new Point3D(x, y, z),
            new Point3D(x, y, z + 1),
            new Point3D(x, y + 1, z + 1),
            new Point3D(x, y + 1, z),

            color2, new Point3D(x, y, z), new Point3D(x - 1, y, z)
          ));
          if(isEmpty(x, y + 1, z)) plains3D.push(new Plain(
	      // up
            new Point3D(x, y + 1, z),
            new Point3D(x + 1, y + 1, z),
            new Point3D(x + 1, y + 1, z + 1),
            new Point3D(x, y + 1, z + 1),

            color1, new Point3D(x, y, z), new Point3D(x, y + 1, z)
          ));
          if(isEmpty(x, y, z - 1)) plains3D.push(new Plain(
	      // front
            new Point3D(x, y, z),
            new Point3D(x + 1, y, z),
            new Point3D(x + 1, y + 1, z),
            new Point3D(x, y + 1, z),

            color3, new Point3D(x, y, z), new Point3D(x, y, z - 1)
          ));
        }
      }
    }
  }
}

ofc.lineWidth = 1;
ofc.strokeStyle = 'black';

ctx.font = '12px Monospace';

/* function for rendering screen */

function render() {

  projections = [];

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ofc.clearRect(0, 0, WIDTH, HEIGHT);

  plains3D.sort((a, b) => dist(camera, b) - dist(camera, a));

    // selected square
    var selectedi;

    for(var i = 0; i < plains3D.length; i++) {

	if(inside(mouse, {p:plains3D[i].p.map(x => camera.project(x))})) selectedi = i;
  }
    
  for(var i = 0; i < plains3D.length; i++) {

      drawpoly(...plains3D[i].p.map(x => camera.project(x)), plains3D[i].color, i == selectedi);

    projections.push(new Plain(...plains3D[i].p.map(x => camera.project(x)), dist(camera, plains3D[i]), plains3D[i].pos1, plains3D[i].pos2));
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.drawImage(ofscr, 0, 0);

  ctx.fillStyle = '#FFFFFF';
}

var conf = {
	TILE_COLOR : 0xFFFFFF, // color of tiles to be placed
	MOUSE_SENSITIVITY: 15,
}

var key = {};
var mouse = {left: false, right: false, x: 0, y: 0, count: 0};

var oldtime = null;

var update3DB = function() {
    let curtime = new Date().getTime();
    let tspan = oldtime ? curtime - oldtime : 100;
    oldtime = curtime;
    
  /* rotation stuff */

  if(key[87]) camera.rotate(0, -Math.PI * .001*tspan);
    if(key[83]) camera.rotate(0, Math.PI * .001*tspan);
  if(key[68]) camera.rotate(Math.PI * .001*tspan, 0);
  if(key[65]) camera.rotate(-Math.PI * .001*tspan, 0);

  /* mouse stuff */

  if((mouse.left || mouse.right) && !mouse.count) {

    var pos1 = -1, pos2 = -1, di = 1e9; // pos1 = position of current block, pos2 = position of block this side is facing towards

    for(var i = 0; i < projections.length; i++) {

      if(inside(mouse, projections[i]) && projections[i].color < di) {

        di = projections[i].color; // color acts as distance here (don't ask why, there's no good answer)

        pos1 = projections[i].pos1;
        pos2 = projections[i].pos2;
      }
    }

    if(pos1 != -1) {

	if(mouse.left && pos2.x >= 0 && pos2.y >= 0 && pos2.z >= 0 && pos2.x < (1<<EDGE_L2) && pos2.y < (1<<EDGE_L2) && pos2.z < (1<<EDGE_L2)) map[getPos(pos2.x, pos2.y, pos2.z)] = conf.TILE_COLOR;
      if(mouse.right) map[getPos(pos1.x, pos1.y, pos1.z)] = EMPTY;

      mouse.count = conf.MOUSE_SENSITIVITY;

      loadMap(map);
    }
  }

  if(mouse.count) mouse.count--;

    render();

    requestAnimationFrame(update3DB);
}

var cbr;

/* event listeners */
document.addEventListener('keydown', e => key[e.keyCode] = true);
document.addEventListener('keyup',  e => key[e.keyCode] = false);
document.addEventListener('mouseup', e => {
  if(!e.button) mouse.left = false;
  else mouse.right = false;
  return false;
});
document.addEventListener('mousedown', e => {
  if(mouse.x < cbr.left || mouse.x > cbr.right || mouse.y < cbr.top || mouse.y > cbr.bottom) return;
  if(!e.button) mouse.left = true;
  else mouse.right = true;
});
document.addEventListener('mousemove', e => {

  cbr = canvas.getBoundingClientRect(); // for mouse location
  mouse.x = e.pageX - cbr.left - 4;
  mouse.y = e.pageY - cbr.top - 4;
});
canvas.oncontextmenu = e => false; // cause right click is used for destroying blocks


/*

EXPORTS:

- update3DB(), use it in setInterval
- camera.setFov(angle)
- camera.dist = distance from model
- camera.top = y-position of the lowest layer of map
- loadMap(Uint32Array) = load a map into the editor
- conf.TILE_COLOR - a number representing current fill color
- getColor(html color code) - returns a number presenting given color

IMPORTANT:

- when program loads, it finds a canvas element with id = "voxelscreen",
  make sure to have that element somewhere before running program

*/
