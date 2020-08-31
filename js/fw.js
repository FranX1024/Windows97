function $j(el) {
  if(el) return {
    element: el,
    on(event, f) {
      this.element.addEventListener(event, f);
      return this;
    },
    style(style) {
      Object.assign(this.element.style, style);
      return this;
    },
    text(text) {
      if(typeof text == 'string') {
        this.element.innerText = text;
        return this;
      } else {
        return this.element.innerText;
      }
    },
    html(html) {
      if(typeof html == 'string') {
        this.element.innerHTML = html;
        return this;
      } else {
        return this.element.innerHTML;
      }
    },
    attr(attr, value) {
      if(typeof value == 'string') {
        if(typeof this.element[attr] != 'string') this.element.setAttribute(attr, value);
        else this.element[attr] = value;
        return this;
      } else {
        return this.element[attr] || this.element.getAttribute(attr);
      }
    },
    parent() {
      return $j(this.element.parentElement);
    },
    select() {
      this.element.select();
      return this;
    },
    focus() {
      focus(this.element);
      return this;
    },
    blur() {
      blur(this.element);
      return this;
    },
    child(jq) {
      if(jq.element.parentElement != this.element) this.element.appendChild(jq.element);
      return this;
    },
    class(name) {
      if(!this.element.classList.contains(name)) this.element.classList.add(name);
      return this;
    },
    rmchild(jq) {
      if(jq.element.parentElement == this.element) this.element.removeChild(jq.element);
      return this;
    },
    rmclass(name) {
      if(this.element.classList.contains(name)) this.element.classList.remove(name);
      return this;
    },
    rmlistener(type, f) {
      this.element.removeEventListener(type, f);
    },
    fullscreen() {
      this.element.requestFullscreen();
      return this;
    },
    hide() {
      this.element.style.display = 'block';
    },
    show() {
      this.element.style.display = 'none';
    },
    empty() {
      this.element.innerHTML = '';
    },
    is(selector) {
      if(typeof(selector) == 'string') return this.element.matches(selector);
      if(typeof(selector) == 'object') {
        if(selector.element == this.element) return true;
        return this.element == selector;
      }
      return false;
    },
    drag(jq) {
      jq = jq || this;
      var me = this;
      jq.element.style['user-select'] = 'none';
      this.element.style['position'] = 'absolute';
      document.addEventListener('mousemove', function(event) {
        if(!me.is(':focus')) return;
        if(event.buttons == 1) {
          var rect = jq.element.getBoundingClientRect(),
              elpos = me.element.getBoundingClientRect(),
              mouseX = event.clientX - event.movementX,
              mouseY = event.clientY - event.movementY;
          if(rect.top <= mouseY && rect.bottom > mouseY && rect.left <= mouseX && rect.right > mouseX) {
            var posX = elpos.left + event.movementX, posY = elpos.top + event.movementY;
            me.style({'position': 'absolute', 'left': posX + 'px', 'top': posY + 'px'});
          }
        }
      });
      return this;
    },
    menu(jq, apclass) {
      var me = this;
      jq.style({'position': 'absolute'});
      var open = function() {
        jq.style({'display': 'block'});
        me.on('click', close);
        if(apclass) me.class(apclass);
        me.rmlistener('click', open);
        jq.on('click', close);
        jq.rmlistener('click', open);
      }
      var close = function() {
        jq.style({'display': 'none'});
        me.on('click', open);
        if(apclass) me.rmclass(apclass);
        me.rmlistener('click', close);
        jq.on('click', open);
        jq.rmlistener('click', close);
      }
      me.on('blur', function() {
        if(!jq.is(':focus')) setTimeout(close, 100);
      });
      close();
      return this;
    }
  }
  else return null;
}

function $(selector, node) {
  if(typeof selector == 'object') return $j(selector);
  var el = node ? node.element.querySelector(selector) : document.querySelector(selector);
  return $j(el);
}

function $$(selector, node) {
  var element_list = node ? node.element.querySelectorAll(selector) : document.querySelectorAll(selector);
  var jlist = [];
  element_list.forEach(el => jlist.push($j(el)));
  return jlist;
}

function $new(el_name) {
  return $j(document.createElement(el_name));
}
