const COLOR_SLOT_COUNT = 40;

function toHSV(r, g, b) {
   let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
   rabs = r / 255;
   gabs = g / 255;
   babs = b / 255;
   v = Math.max(rabs, gabs, babs),
   diff = v - Math.min(rabs, gabs, babs);
   diffc = c => (v - c) / 6 / diff + 1 / 2;
   percentRoundFn = num => Math.round(num * 100) / 100;
   if (diff == 0) {
       h = s = 0;
   } else {
       s = diff / v;
       rr = diffc(rabs);
       gg = diffc(gabs);
       bb = diffc(babs);

       if (rabs === v) {
           h = bb - gg;
       } else if (gabs === v) {
           h = (1 / 3) + rr - bb;
       } else if (babs === v) {
           h = (2 / 3) + gg - rr;
       }
       if (h < 0) {
           h += 1;
       }else if (h > 1) {
           h -= 1;
       }
   }
   return {
       h: Math.round(h * 360),
       s: percentRoundFn(s * 100),
       v: percentRoundFn(v * 100)
   };
}

var picker = {

 mouse: {down: false, x: 0, y: 0},

 hue: 0,
 slx: 0,
 sly: 100,

 cpsl: document.querySelector('#cpsl'),
 cphue: document.querySelector('#cphue'),
 slpick: document.querySelector('#slpick'),
 huepick: document.querySelector('#huepick'),

 mousein: '',

 display: function() {
   this.cpsl.style.backgroundColor = 'hsl(' + this.hue + ',100%,50%)';
   this.huepick.style.top = (this.hue * 0.55555 - 2) + 'px';
   this.slpick.style.left = (this.slx * 2 - 4) + 'px';
   this.slpick.style.top = ((100 - this.sly) * 2 - 4) + 'px';

   if(typeof this.onchange == 'function') this.onchange(this.hue, this.slx, this.sly);
 },

 setTo(r, g, b) {
   c = toHSV(r, g, b);
   this.hue = c.h;
   this.slx = c.s;
   this.sly = c.v;
   this.display();
 },

 color() {
   var r, g, b, i, f, p, q, t, h = this.hue * 1/360, s = this.slx * 0.01, v = this.sly * 0.01;
   if (arguments.length === 1) {
       s = h.s, v = h.v, h = h.h;
   }
   i = Math.floor(h * 6);
   f = h * 6 - i;
   p = v * (1 - s);
   q = v * (1 - f * s);
   t = v * (1 - (1 - f) * s);
   switch (i % 6) {
       case 0: r = v, g = t, b = p; break;
       case 1: r = q, g = v, b = p; break;
       case 2: r = p, g = v, b = t; break;
       case 3: r = p, g = q, b = v; break;
       case 4: r = t, g = p, b = v; break;
       case 5: r = v, g = p, b = q; break;
   }
   return "#" + ((1 << 24) + (Math.round(r * 255) << 16) + (Math.round(g * 255) << 8) + Math.round(b * 255)).toString(16).slice(1);
 },

 mousemove() {
   if(!this.mouse.down) return;
   var brsl = picker.cpsl.getBoundingClientRect(), brhue = picker.cphue.getBoundingClientRect();
   if(this.mousein == 'sl') {
     this.slx = Math.min(Math.max(0.5 * (picker.mouse.x - brsl.left), 0), 100);
     this.sly = Math.min(Math.max(0.5 * (200 + brsl.top - picker.mouse.y), 0), 100);
     this.display();
   }
   if(this.mousein == 'hue') {
     this.hue = Math.min(Math.max(1.8 * (picker.mouse.y - brhue.top), 0), 360);
     this.display();
   }
 }
}

picker.display();

document.addEventListener('mouseup', e => {
 picker.mouse.down = false;
});

document.addEventListener('mousedown', e => {
 picker.mouse.down = true;
 var brsl = picker.cpsl.getBoundingClientRect(), brhue = picker.cphue.getBoundingClientRect();
 if(picker.mouse.x > brsl.left && picker.mouse.y > brsl.top && picker.mouse.x < brsl.right && picker.mouse.y < brsl.bottom)
   picker.mousein = 'sl';
 else if(picker.mouse.x > brhue.left && picker.mouse.y > brhue.top && picker.mouse.x < brhue.right && picker.mouse.y < brhue.bottom)
   picker.mousein = 'hue';
 else
   picker.mousein = '';
 picker.mousemove();
});

document.addEventListener('mousemove', e => {
 picker.mouse.x = e.pageX;
 picker.mouse.y = e.pageY;
 picker.mousemove();
});

var selected_slot = 1;

var slot_colors = [];
for(let i = 0; i < 41; i++) slot_colors.push('#FFFFFF')

function select_slot(s) {
 for(var i = 1; i <= COLOR_SLOT_COUNT; i++) {
   document.getElementById('c' + i).style.outline = 'none';
 }
 document.getElementById('c' + s).style.outline = '1px dashed';
 selected_slot = s;
 picker.setTo(Number('0x' + slot_colors[s].substr(1, 2)), Number('0x' + slot_colors[s].substr(3, 2)), Number('0x' + slot_colors[s].substr(5, 2)));
}

picker.onchange = function() {
 conf.TILE_COLOR = getColor(picker.color());
 document.getElementById('c' + selected_slot).style.backgroundColor = picker.color();
 slot_colors[selected_slot] = picker.color();
}

for(var i = 1; i <= COLOR_SLOT_COUNT; i++) {
  var el = document.createElement('div');
  el.innerHTML = '&nbsp;';
  el.onclick = eval('_=> select_slot(' + i + ');');
  el.id = 'c' + i;
  el.classList.add('color');
  document.getElementById('colors').appendChild(el);
}
