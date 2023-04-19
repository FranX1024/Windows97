function randID() {
  return (x=>'0'.repeat(9).split('').map((y,i)=>('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_')[(x>>(i*6))&63]).join(''))(Math.random()*18014398509481984);
}

/* windows (movable container elements) */

function $window(cparam) {
  var param = {
    x: 25 + Math.floor(document.body.offsetWidth * 0.5) - (cparam.width || 400) * 0.5,
    y: 25 + Math.floor(document.body.offsetHeight * 0.5) - (cparam.height || 100) * 0.5,
    title: 'Unnamed',
    width: 400,
    height: 100,
    resize: true
  };
  Object.assign(param, cparam);

  var winid = randID();

  var container = document.createElement('div');
  container.classList.add('window');
  Object.assign(container.style, {'position': 'absolute', 'top': param.y + 'px', 'left': param.x + 'px'});

  var title_bar = document.createElement('div');
  title_bar.classList.add('title-bar');
  title_bar.style.userSelect = 'none';

  var title_bar_text = document.createElement('div');
  title_bar_text.classList.add('title-bar-text');
  title_bar_text.innerText = param.title;
  title_bar_text.style.maxWidth = param.width + 'px';

  var title_bar_buttons = document.createElement('div');
  title_bar_buttons.classList.add('title-bar-controls');
  title_bar_buttons.innerHTML = `
    <button aria-label="Minimize" onclick="$winui.minimize('` + winid + `')"></button>
    <button aria-label="Maximize" onclick="$winui.maximize('` + winid + `')"></button>
    <button aria-label="Close" onclick="$winui.destroy('` + winid + `')"></button>
  `;
  if(param.resize == false) {
      title_bar_buttons.innerHTML = `
        <button aria-label="Minimize" onclick="$winui.minimize('` + winid + `')"></button>
        <button disabled>` + String.fromCharCode(9723) + `</button>
        <button aria-label="Close" onclick="$winui.destroy('` + winid + `')"></button>
      `;
  }

  var body = document.createElement('div');
  body.style.width = param.width ? param.width + 'px' : '';
  body.style.height = param.height ? param.height + 'px' : '';
  if(param.width) body.style.overflowX = 'auto';
  if(param.height) body.style.overflowY = 'auto';
  body.classList.add('window-body');
  if(param.resize) body.style.resize = 'both';

  var tbutton = document.createElement('button');
  tbutton.innerText = param.title;
  tbutton.style.textOverflow = 'ellipsis';
  tbutton.style.overflow = 'hidden';
  tbutton.style.whiteSpace = 'nowrap';
  tbutton.style.width = '100px';
  tbutton.style.userSelect = 'none';
  tbutton.style.marginLeft = '2px';
  tbutton.style.marginRight = '2px';
  tbutton.onclick = Function('$winui.minimize("' + winid + '")');

  container.appendChild(title_bar);
  title_bar.appendChild(title_bar_text);
  title_bar.appendChild(title_bar_buttons);
  container.appendChild(body);
  document.body.appendChild(container);


  /* create win object */

  var win = {
    'container': container,
    'titlebar': title_bar,
    'tbutton': tbutton,
    'body': body,
    'id': winid,
    'state': 0, // 0 = normal, 1 = maximized
    'memo': {},
    'resize': param.resize,
    'width': param.width,
    'height': param.height
  };

  $winui.add(win);

  return win;
}

var $winui = {
  movable: null,
  toolbar: document.querySelector('#toolbar'),
  winlist: {},
  zindex: 4,
  focused: null,
  add: function(win) {
    this.winlist[win.id] = win;
    this.focus(win);
    this.toolbar.appendChild(win.tbutton);
  },
  focus: function(win) {
    this.focused = win;
    if(win.titlebar.classList.contains('active')) return;
    this.zindex += 2;
    this.winlist[win.id].container.style.zIndex = this.zindex;
    this.toolbar.style.zIndex = this.zindex + 1;
    win.body.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = 'auto');
    if(win.titlebar.classList.contains('inactive')) win.titlebar.classList.remove('inactive');
    if(!win.tbutton.classList.contains('active')) win.tbutton.classList.add('active');
    for(var id in this.winlist) {
      if(id != win.id) {
        if(!this.winlist[id].titlebar.classList.contains('inactive')) this.winlist[id].titlebar.classList.add('inactive');
        if(this.winlist[id].tbutton.classList.contains('active')) this.winlist[id].tbutton.classList.remove('active');
        this.winlist[id].body.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = 'none');
      }
    }
  },
  destroy: function(id) {
    $winui.movable = null;
    document.body.removeChild(this.winlist[id].container);
    this.toolbar.removeChild(this.winlist[id].tbutton);
    delete this.winlist[id];
  },
  minimize: function(id) {
    this.winlist[id].container.style.display = 'none';
    if(this.winlist[id].tbutton.classList.contains('active')) this.winlist[id].tbutton.classList.remove('active');
    this.winlist[id].tbutton.onclick = Function('$winui.reopen("' + id + '")');
  },
  reopen: function(id) {
    this.winlist[id].container.style.display = 'block';
    this.winlist[id].tbutton.onclick = Function('$winui.minimize("' + id + '")');
    this.focus(this.winlist[id]);
  },
  maximize: function(id) {
    let el = this.winlist[id].container;
    this.winlist[id].state = 1;
    this.winlist[id].memo = {
      'top': el.style.top,
      'left': el.style.left
    };
    $(el).style({
        'width': 'calc(100% - 6px)',
        'height': 'calc(100% - 37px)',
        'top': '0px',
        'left': '0px'
    });
    $(this.winlist[id].body).style({
        'width': 'calc(100% - 4px)',
        'height': 'calc(100% - 24px)',
        'resize': 'none'
    });
    let maxbtn = this.winlist[id].container.querySelector('button[aria-label="Maximize"]');
    maxbtn.setAttribute('aria-label', 'Restore');
    maxbtn.onclick = Function("$winui.restore('" + id + "')");
  },
  restore: function(id) {
    this.winlist[id].state = 0;
    $(this.winlist[id].container).style({
          'top': this.winlist[id].memo.top,
          'left': this.winlist[id].memo.left,
          'width': '',
          'height': ''
    });
    $(this.winlist[id].body).style({
        'width': this.winlist[id].width + 'px',
        'height': this.winlist[id].height + 'px',
        'resize': (this.winlist[id].resize ? 'both' : 'none')
    });
    let maxbtn = this.winlist[id].container.querySelector('button[aria-label="Restore"]');
    maxbtn.setAttribute('aria-label', 'Maximize');
    maxbtn.onclick = Function("$winui.maximize('" + id + "')");
  },
  mouseMove: function(e) {
    if(e.buttons == 1) {
      var ox = e.clientX - e.movementX, oy = e.clientY - e.movementY;
      var winid = $winui.movable;

      if(winid == null) return;
      if($winui.winlist[winid].state == 1) return;
      var br = $winui.winlist[winid].titlebar.getBoundingClientRect();
      if(br.top > oy || br.left > ox || br.bottom < oy || br.right < ox) return;

      var el = $winui.winlist[winid].container;
      var posy = Number(el.style.top.slice(0, -2)) + e.movementY, posx = Number(el.style.left.slice(0, -2)) + e.movementX;
      el.style.top = posy + 'px';
      el.style.left = posx + 'px';
    }
  },
  mouseDown: function(e) {
    if(e.buttons == 1) {
      var ox = e.clientX, oy = e.clientY;
      var winid = null, zindex = 0;
      for(var id in $winui.winlist) {
        var br = $winui.winlist[id].container.getBoundingClientRect();
        if(br.top <= oy && br.left <= ox && br.bottom >= oy && br.right >= ox && $winui.winlist[id].container.style.zIndex > zindex) {
          zindex = $winui.winlist[id].container.style.zIndex;
          winid = id;
        }
      }
      if(winid == null) return;
      var br = $winui.winlist[winid].titlebar.getBoundingClientRect();
      if(br.top <= oy && br.left <= ox && br.bottom >= oy && br.right >= ox) {
        $winui.movable = winid;
      } else {
        $winui.movable = null;
      }
      if($winui.winlist[winid].container.style.zIndex != $winui.zindex) $winui.focus($winui.winlist[winid]);
      $$('iframe').forEach(fw => fw.style({'pointer-events': 'none'})); // <---
    }
  },
  mouseUp: function() {
    $$('iframe').forEach(fw => (fw.parents().includes($winui.focused.body) ? fw.style({'pointer-events': 'auto'}) : null)); // <---
  }
}

document.addEventListener('mousemove', $winui.mouseMove);
document.addEventListener('mousedown', $winui.mouseDown);
document.addEventListener('mouseup', $winui.mouseUp);

function $alert(title, text, callback) {
  var win = $window({title: title, width: 320, height: false, resize: false});
  var content = document.createElement('div');
  content.innerText = text;
  win.body.appendChild(content);
  win.content = content;

  var buttons = document.createElement('div');
  Object.assign(buttons.style, {'textAlign': 'right', 'width': '100%', 'marginTop': '10px'});
  var buttonok = document.createElement('button');
  var buttoncancel = document.createElement('button');
  var space = document.createElement('span');

  buttonok.onclick = function() {
    $winui.destroy(win.id);
    if(callback) callback(true);
  }

  win.titlebar.querySelector('button[aria-label="Close"]').onclick = buttoncancel.onclick = function() {
    $winui.destroy(win.id);
    if(callback) callback(false);
  }

  win.titlebar.querySelector('.title-bar-controls').removeChild(win.titlebar.querySelector('button[aria-label="Minimize"]'));

  space.innerText = ' ';
  buttonok.innerText = 'OK';
  buttoncancel.innerText = 'Cancel';
  buttons.appendChild(buttonok);
  buttons.appendChild(space);
  buttons.appendChild(buttoncancel);
  win.body.appendChild(buttons);

  return win;
}

function $prompt(title, text, callback) {
  var win = $window({title: title, width: 320, height: false, resize: false});
  var content = document.createElement('div');
  content.innerText = text;
  win.body.appendChild(content);
  win.content = content;

  var input = document.createElement('input');
  input.type = 'text';
  input.style.width = '100%';
  input.style.marginTop = '15px';
  win.body.appendChild(input);
  input.onchange = function() {
    $winui.destroy(win.id);
    if(callback) callback(true, input.value);
  }
  win.titlebar.querySelector('button[aria-label="Close"]').onclick = function() {
    $winui.destroy(win.id);
    if(callback) callback(false, null);
  }
  $(input).select();
  win.titlebar.querySelector('.title-bar-controls').removeChild(win.titlebar.querySelector('button[aria-label="Minimize"]'));
  return win;
}

/* toolbar time display */

function updateTimeDisplay() {
  var date = new Date();
  var hour = date.getHours();
  var min = date.getMinutes();
  if(hour < 10) hour = '0' + hour;
  if(min < 10) min = '0' + min;
  document.querySelector('#time-display').innerHTML = hour + ':' + min;
  setTimeout(updateTimeDisplay, (60 - date.getSeconds()) * 1000);
}
updateTimeDisplay();
