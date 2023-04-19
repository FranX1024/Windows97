const WIDTH = 500, HEIGHT = 500;

var canvas = document.getElementById('voxelscreen');
var ofscr =  document.createElement('canvas');
var ctx = canvas.getContext('2d');
var ofc = ofscr.getContext('2d');

ctx.imageSmoothingEnabled = false;
ofc.imageSmoothingEnabled = false;
//ctx.scale(2, 2);

ofscr.width = WIDTH;
ofscr.height = HEIGHT;

/* function for drawing 4-sided polygons */

function polyadjpoint(pt, midp) {
    let p2 = {
	x: pt.x + (pt.x - midp.x) * .05,
	y: pt.y + (pt.y - midp.y) * .05
    };
    return p2;
}
function polyudjpoint(pt, midp) {
    let p2 = {
	x: pt.x - (pt.x - midp.x) * .07,
	y: pt.y - (pt.y - midp.y) * .07
    };
    return p2;
}
function drawpoly(p1, p2, p4, p3, color, strokke) {
    let midp = {
	x: (p1.x + p2.x + p3.x + p4.x) * .25,
	y: (p1.y + p2.y + p3.y + p4.y) * .25
    };
    let pp1 = polyadjpoint(p1, midp);
    let pp2 = polyadjpoint(p2, midp);
    let pp3 = polyadjpoint(p3, midp);
    let pp4 = polyadjpoint(p4, midp);
  ofc.fillStyle = color;
  ofc.beginPath();
  ofc.moveTo(pp1.x, pp1.y);
  ofc.lineTo(pp3.x, pp3.y);
  ofc.lineTo(pp4.x, pp4.y);
  ofc.lineTo(pp2.x, pp2.y);
  ofc.closePath();
  ofc.fill();
    if(strokke) {
	let pp1 = polyudjpoint(p1, midp);
	let pp2 = polyudjpoint(p2, midp);
	let pp3 = polyudjpoint(p3, midp);
	let pp4 = polyudjpoint(p4, midp);
  ofc.beginPath();
  ofc.moveTo(pp1.x, pp1.y);
  ofc.lineTo(pp3.x, pp3.y);
  ofc.lineTo(pp4.x, pp4.y);
  ofc.lineTo(pp2.x, pp2.y);
  ofc.closePath();
	ofc.stroke();
    }
}

class Point2D {

  constructor(x, y) {

    this.x = x;
    this.y = y;
  }
}

class Point3D {

  constructor(x, y, z) {

    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Plain {

  constructor(p1, p2, p3, p4, color, pos1, pos2) {

    this.p = [p1, p2, p3, p4];

    this.color = color;

    this.pos1 = pos1;

    this.pos2  = pos2;
  }
}

function rotate(x, y, angle) {

  return [x * angle.cos - y * angle.sin, x * angle.sin + y * angle.cos];
}

function rotate3d(x, y, z, lr, ud) {

  [x, z] = rotate(x, z, lr);

  [y, z] = rotate(y, z, ud);

  return [x, y, z];
}

/*

new Camera( <Number = field of view> ) returns Camera

Camera.rotate( <Number = left-right rotation>, <Number = up-down rotation> ) returns void

Camera.project( <Point3D> ) returns Point2D

Camera.setFov( <Number = field of view> )

*/

class Camera {

  constructor(fov, dist) {

    this.csz = 0.6 / 8;
    this.top = 0;

    this.rotLR = {val: 0, sin: 0, cos: 1};
    this.rotUD = {val: 0, sin: 0, cos: 1};

    this.dist = dist;
    this.fov_ctg = 1 / Math.tan(fov * Math.PI / 360);
  }

  rotate(xz, yz) {

    this.rotLR.val -= xz;
    this.rotUD.val -= yz;

    this.rotLR.sin = Math.sin(this.rotLR.val);
    this.rotLR.cos = Math.cos(this.rotLR.val);
    this.rotUD.sin = Math.sin(this.rotUD.val);
    this.rotUD.cos = Math.cos(this.rotUD.val);
  }

  setFov(fov) {

    this.fov_ctg = 1 / Math.tan(fov * Math.PI / 360);
  }

  project(p3d) {

    var x = (p3d.x - 8) * this.csz;
    var y = (this.top - p3d.y) * this.csz;
    var z = (p3d.z - 8) * this.csz;

    [x, y, z] = rotate3d(x, y, z, this.rotLR, this.rotUD);

    z += this.dist;

    var d = this.fov_ctg / z;

    return new Point2D(WIDTH * (0.5 + x * d), HEIGHT * (0.5 + y * d));
  }

  getDist(p3d) {

    var x = (p3d.x - 8) * this.csz;
    var y = (this.top - p3d.y) * this.csz;
    var z = (p3d.z - 8) * this.csz;

    [x, y, z] = rotate3d(x, y, z, this.rotLR, this.rotUD);

    z += this.dist;

    return x * x + y * y + z * z;
  }
}
