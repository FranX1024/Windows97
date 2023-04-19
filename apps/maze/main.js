/* WARNING: This code is
 * OLD & UNMAINTAINABLE
 */

/*  SHELL SORT FUNCTION, O(n (log n) ^ 2),
    made because different browsers have different
    sort functions (e.g. Chormium sort doesn't accept
    a function as comparator tool)
*/

Array.prototype.sort = function(f) {
  var arr = this;
  var increment = Math.floor(arr.length / 2);
    while (increment > 0) {
        for (i = increment; i < arr.length; i++) {
            var j = i;
            var temp = arr[i];

            while (j >= increment && f(arr[j-increment], temp)) {
                arr[j] = arr[j-increment];
                j = j - increment;
            }

            arr[j] = temp;
        }

        if (increment == 2) {
            increment = 1;
        } else {
            increment = Math.floor(increment*5 / 11);
        }
    }
}

/*
  Canvas initialization
  - canvas = html element
  - ctx = object through which I draw
  - width and height = dimensions of the canvas
*/

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.font = '12px Mono';
var width = 480;
var height = 480;

/*
  Function for drawing
  lines (accepts 2 2d point objects, {x: Number, y: Number})
*/

function line({x:x, y:y}, {x:x1, y:y1}) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

/*
  Function for loading images by url
*/

function imageof(s) {
  var im = new Image();
  im.src = s;
  return im;
}

/*
  All images used in the game
  (currently only background)
*/

var img = {
  background: imageof('./bg.png'),
  ball: imageof('./end.png')
}

/*
  Function for drawing irregular
  tetragons (rotated rects look differently when
  projected to screen)
*/

function drawrect(p1, p2, p3, p4, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.fill();
  //ctx.strokeStyle = 'black';
  //line(p1, p2); line(p3, p4); line(p1, p3); line(p2, p4);
}

/*
  Unnamed value that can influence on
  how distorted projection can be
  (smaller = looks further away,
  greater = looks closer)
  I called it toogle cause why not.
*/

var toogle = 200;

/*
  object representing 3d points
*/

function p3d(x, y, z) {
  return {
    x: x,
    y: y,
    z: z,
    to2d() {
      var cz = this.z;
      if(cz <= 0) cz = 0.1;
      var d = 1 / cz;
      if(d < 0) d = -cz;
      return {x: (this.x * d + 1) * width / 2, y: (this.y * d + 1) * height / 2};
    }
  }
}

/*
  rotation function
  (accepts angle in radiants and 3d plane object)
*/

function rotate(rad, obj) {
  for(var i = 0; i < obj.vert.length; i++) {
    var xc = Math.cos(rad) * obj.vert[i].x + Math.sin(rad) * obj.vert[i].z;
    var yc = Math.cos(rad) * obj.vert[i].z - Math.sin(rad) * obj.vert[i].x;
    obj.vert[i].x = xc;
    obj.vert[i].z = yc;
  }
}

/*
  function for checking if
  a 3d plane is visible
*/

function visible(obj) {
  return  obj.vert[0].z > 0 ||//&& obj.vert[0].to2d().x >= 0 && obj.vert[0].to2d().x <= width && obj.vert[0].to2d().y >= 0 && obj.vert[0].to2d().y <= height ||
          obj.vert[1].z > 0 ||//&& obj.vert[1].to2d().x >= 0 && obj.vert[1].to2d().x <= width && obj.vert[1].to2d().y >= 0 && obj.vert[1].to2d().y <= height ||
          obj.vert[2].z > 0 ||//&& obj.vert[2].to2d().x >= 0 && obj.vert[2].to2d().x <= width && obj.vert[2].to2d().y >= 0 && obj.vert[2].to2d().y <= height ||
          obj.vert[3].z > 0 ;//&& obj.vert[3].to2d().x >= 0 && obj.vert[3].to2d().x <= width && obj.vert[3].to2d().y >= 0 && obj.vert[3].to2d().y <= height;
}

/********************************************/
/************** MAP GENERATION **************/

function maze(x,y) {
    var n=x*y-1;
    var horiz=[]; for (var j= 0; j<x+1; j++) horiz[j]= [];
    var verti=[]; for (var j= 0; j<y+1; j++) verti[j]= [];
    var here= [Math.floor(Math.random()*x), Math.floor(Math.random()*y)];
    var path= [here];
    var unvisited= [];
    for (var j= 0; j<x+2; j++) {
        unvisited[j]= [];
        for (var k= 0; k<y+1; k++)
            unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
    }
    while (0<n) {
        var potential= [[here[0]+1, here[1]], [here[0],here[1]+1],
            [here[0]-1, here[1]], [here[0],here[1]-1]];
        var neighbors= [];
        for (var j= 0; j < 4; j++)
            if (unvisited[potential[j][0]+1][potential[j][1]+1])
                neighbors.push(potential[j]);
        if (neighbors.length) {
            n= n-1;
            next= neighbors[Math.floor(Math.random()*neighbors.length)];
            unvisited[next[0]+1][next[1]+1]= false;
            if (next[0] == here[0])
                horiz[next[0]][(next[1]+here[1]-1)/2]= true;
            else
                verti[(next[0]+here[0]-1)/2][next[1]]= true;
            path.push(here= next);
        } else
            here= path.pop();
    }
    return ({x: x, y: y, horiz: horiz, verti: verti});
}

function display(m) {
    var text= [];
    for (var j= 0; j<m.x*2+1; j++) {
        var line= [];
        if (0 == j%2)
            for (var k=0; k<m.y*4+1; k++)
                if (0 == k%4)
                    line[k]= '#';
                else
                    if (j>0 && m.verti[j/2-1][Math.floor(k/4)])
                        line[k]= ' ';
                    else
                        line[k]= '#';
        else
            for (var k=0; k<m.y*4+1; k++)
                if (0 == k%4)
                    if (k>0 && m.horiz[(j-1)/2][k/4-1])
                        line[k]= ' ';
                    else
                        line[k]= '#';
                else
                    line[k]= ' ';
        if (0 == j) line[1]= line[2]= line[3]= ' ';
        if (m.x*2-1 == j) line[4*m.y]= ' ';
        text.push(line.join(''));
    }
    return text;
}

var map = [];

function remaze() {
  map = [];
  var map_ = display(maze(10, 10));

  for(var i = 0; i < map_.length; i++) {
    var s = "";
    for(var j = 0; j < map_[i].length; j += 2) {
      s += map_[i][j] + map_[i][j];
    }
    map_[i] = s;
  }

  for(var i = 0; i < map_.length; i++) {
    map.push(map_[i]);
    map.push(map_[i]);
  }

  map[0] = "####" + map[0].slice(4);
  map[1] = "####" + map[1].slice(4);
  map[map.length - 4] = map[map.length - 4].slice(0, map[map.length - 4].length - 2) + "##";
  map[map.length - 3] = map[map.length - 3].slice(0, map[map.length - 3].length - 3) + "p##";

}

remaze();
/********************************************/

/*
  Defines tile colors
  (shadow = gradient from gray to black
    depending on distance from observer)
*/

var tilec = {
  '#': 'shadow',
  'p': 'yellow',
}

/*
  observer is an object representing
  an eyeball seeing all these 3d stuff
*/

var observer = {
  x: 3,
  y: 3,
  rot: 0
}

/*
  Contains all planes that are
  possibly visible to the observer
*/

var walls = [];

/*
  Checks if a slot in the matix is empty
*/

function emptyf(i, j) {
  return i < 0 || j < 0 || i >= map.length || j >= map[0].length || map[i][j] != '#';
}

/*
  Calculates distance if a plane from
  the observer
*/

function dist(vert) {
  return Math.pow(Math.max(vert[0].z, vert[1].z, vert[2].z, vert[3].z), 2) + Math.pow(Math.max(vert[0].x, vert[1].x, vert[2].x, vert[3].x), 2);
}

/*
  Yet another rotation function
  (this one applies the first rotation function
  on all visible planes)
*/

function rotation(x) {
  for(var i in walls) rotate(x, walls[i]);
  walls.sort((a, b) => dist(a.vert) > dist(b.vert));
}

/*
  How big rectangle is loaded from the
  map into potentially visible planes
*/

var chunkW = 20;
var chunkH = 20;

/*
  Function to generate 3d planes from the matrix
*/

function generate() {
  walls = [];
  var x = Math.max(Math.floor(observer.x - chunkW / 2), 0)
  var y = Math.max(Math.floor(observer.y - chunkH / 2), 0)
  for(var i = x; i < chunkW + x && i < map.length; i++) {
    for(var j = y; j < chunkH + y && j < map[i].length; j++) {
      if(map[i][j] == '#') {
        if(emptyf(i - 1, j)) walls.push({
          vert: [
            p3d(i * 2, -1, j * 2),
            p3d(i * 2, -1, j * 2 + 2),
            p3d(i * 2, 1, j * 2),
            p3d(i * 2, 1, j * 2 + 2)
          ],
          col: tilec[map[i][j]]
        });
        if(emptyf(i, j - 1)) walls.push({
          vert: [
            p3d(i * 2, -1, j * 2),
            p3d(i * 2 + 2, -1, j * 2),
            p3d(i * 2, 1, j * 2),
            p3d(i * 2 + 2, 1, j * 2)
          ],
          col: tilec[map[i][j]]
        });
        if(emptyf(i + 1, j)) walls.push({
          vert: [
            p3d(i * 2 + 2, -1, j * 2),
            p3d(i * 2 + 2, -1, j * 2 + 2),
            p3d(i * 2 + 2, 1, j * 2),
            p3d(i * 2 + 2, 1, j * 2 + 2)
          ],
          col: tilec[map[i][j]]
        });
        if(emptyf(i, j + 1)) walls.push({
          vert: [
            p3d(i * 2, -1, j * 2 + 2),
            p3d(i * 2 + 2, -1, j * 2 + 2),
            p3d(i * 2, 1, j * 2 + 2),
            p3d(i * 2 + 2, 1, j * 2 + 2)
          ],
          col: tilec[map[i][j]]
        });
      }
      if(map[i][j] == 'p') {
        walls.push({
          vert: [
            p3d(i * 2 + 1, 1, j * 2 + 1),
            p3d(i * 2 + 1, 1, j * 2 + 1),
            p3d(i * 2 + 1, 1, j * 2 + 1),
            p3d(i * 2 + 1, 1, j * 2 + 1)
          ],
          col: 'yellow',
          isEnd: true
        });
      }
    }
  }
  for(var i in walls) for(j in walls[i].vert) walls[i].vert[j].z -= observer.y * 2;
  for(var i in walls) for(j in walls[i].vert) walls[i].vert[j].x -= observer.x * 2;
  rotation(observer.rot);
}

/*
  Function for moving the observer forward and backward
*/

function endgame() {
  key = {};
  if(parent.$alert) {
    parent.$alert('Maze', 'Congratulations! The password is HIST.');
  } else {
    alert('Congratulations! The password is HIST.');
  }
  observer.x = 3;
  observer.y = 3;
  remaze();
}

function forward(x) {
  observer.x += Math.sin(observer.rot) * x / 2;
  if(
    !emptyf(Math.floor(observer.x), Math.floor(observer.y)) ||
    !emptyf(Math.floor(observer.x + 0.6), Math.floor(observer.y + 0.6)) || !emptyf(Math.floor(observer.x + 0.6), Math.floor(observer.y - 0.6)) ||
    !emptyf(Math.floor(observer.x - 0.6), Math.floor(observer.y + 0.6)) || !emptyf(Math.floor(observer.x - 0.6), Math.floor(observer.y - 0.6))
  ) {
    observer.x -= Math.sin(observer.rot) * x / 2;
  }
  observer.y += Math.cos(observer.rot) * x * (-1) / 2;
  if(
    !emptyf(Math.floor(observer.x), Math.floor(observer.y)) ||
    !emptyf(Math.floor(observer.x + 0.6), Math.floor(observer.y + 0.6)) || !emptyf(Math.floor(observer.x + 0.6), Math.floor(observer.y - 0.6)) ||
    !emptyf(Math.floor(observer.x - 0.6), Math.floor(observer.y + 0.6)) || !emptyf(Math.floor(observer.x - 0.6), Math.floor(observer.y - 0.6))
  ) {
    observer.y -= Math.cos(observer.rot) * x * (-1) / 2;
  }
  if(map[Math.floor(observer.x)][Math.floor(observer.y)] == 'p') endgame();
}

/*
  Contains all key codes that are pressed at a specific moment
*/

var key = {};

generate();

/*
  Get color of a shadowed object based on its distance
*/

function col(vert) {
  var x = vert.x;
  var z = vert.z;
  var col = Math.max(128 - Math.abs(Math.floor(Math.sqrt(x * x + z * z)) * 8), 0);
  var s = '';
  s += Math.floor(col).toString(16);
  if(s.length == 1) s = '0' + s;
  return '#00' + s + '00';
}

function getcol(vert) {
  var grd = ctx.createLinearGradient(0,0,200,0);
  grd.addColorStop(0, col(vert[0]));
  grd.addColorStop(1, col(vert[1]));
  return grd;
}


/*
  Key listeners
*/

document.addEventListener('keydown', function(e) {
  key[e.keyCode] = true;
});

document.addEventListener('keyup', function(e) {
  key[e.keyCode] = false;
});

/*
  Main thread
  (here things are rendered and
  key listeners determine what player is doing)
*/

var ftime = 15; // frame time in ms (1000 / fps)
var count = 0;
var rnd = 0;

function update_game() {
  let tbefore = new Date().getTime();
  rotation(0);
  ctx.drawImage(img.background, 0, 0, 480, 480);
  // A
  if(key[65] || key[37]) {
    observer.rot += Math.PI * 0.0008 * ftime;
    if(observer.rot >= Math.PI / 2) observer.rot -= Math.PI * 2;
  }
  // D
  if(key[68] || key[39]) {
    observer.rot -= Math.PI * 0.0008 * ftime;
    if(observer.rot < 0) observer.rot += Math.PI * 2;
  }
  // W
  if(key[87] || key[38]) {
    forward(-0.006 * ftime);
  }
  // S
  if(key[83] || key[40]) {
    forward(0.006 * ftime);
  }
  generate();
  for(var i = walls.length - 1; i >= 0; i--) if(visible(walls[i])) {
    if(walls[i].isEnd) {
      var p = count % 2;
      obj = walls[i].vert[0].to2d();
      var wh = toogle / walls[i].vert[0].z * 1.5;
      ctx.drawImage(img.ball, obj.x - wh / 2, obj.y - wh, wh, wh);

    } else drawrect(walls[i].vert[0].to2d(), walls[i].vert[1].to2d(), walls[i].vert[2].to2d(), walls[i].vert[3].to2d(),
    walls[i].col == 'shadow' ? getcol(walls[i].vert) : walls[i].col);
  }
  
  rnd = (rnd + 1) % 10;
  ctx.fillStyle = '#000';
  for(let y = rnd >> 1; y < 480; y += 5) {
      ctx.fillRect(0, y, 480, 1);
  }
  
  let dir = 'EAST';
  if(observer.rot < 0) observer.rot += 2 * Math.PI;
  if(observer.rot > Math.PI * 0.25) dir = 'NORTH';
  if(observer.rot > Math.PI * 0.75) dir = 'WEST';
  if(observer.rot > Math.PI * 1.25) dir = 'SOUTH';
  if(observer.rot > Math.PI * 1.75) dir = 'EAST';
  
  ctx.fillStyle = '#FFF';
  ctx.fillText('Objective: 40 SOUTH 40 EAST', 20, 20);
  ctx.fillText(`Position: ${Math.floor(observer.x)} SOUTH ${Math.floor(observer.y)} EAST`, 20, 40);
  ctx.fillText(`Facing: ${dir}`, 20, 60);
    
  count = (count + 1) % 10;

  let tafter = new Date().getTime();
  setTimeout(update_game, Math.max(ftime - tafter + tbefore, 0));
}

update_game();
