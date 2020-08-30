var $app = {
  'terminal': {
    icon: './icons/apps/terminal.png',
    title: 'Terminal',
    exec: function() {
      var win = $window({
        title: 'Terminal',
        width: 640,
        height: 400
      });
      var output = $new('div');
      var input = $new('input').class('terminal-input');
      var prompt = $new('span').class('terminal-prompt').text('C:/>' + String.fromCharCode(160));
      var body = $(win.body).class('terminal').child(output).child(
        $new('table').style({'width': '100%', 'border-spacing': '0', 'margin-top': '3px'})
        .child(
          $new('tbody')
          .child(
            $new('tr')
            .child(
              $new('th').child(prompt)
            )
            .child(
              $new('th').child(input).style({'padding': '0'})
            )
          )
        )
      );
      var env = {'cd': 'C:'};
      prompt.parent().style({'width': prompt.element.offsetWidth + 'px', 'padding': '0'});
      input.on('change', function() {
        var result, error = false;
        try {
          result = $exe(input.attr('value'), env);
        } catch(er) {
          result = er.message, error = true;
        }
        output.child(
          $new('div').style({'color': 'white', 'padding-top': '5px', 'padding-bottom': '5px'}).text(prompt.text() + input.attr('value'))
        ).child(
          $new('code').class('terminal-output').style({'color': (error ? 'red' : 'yellow')}).text(result)
        );
        prompt.text($fs.join(env['cd'], '>' + String.fromCharCode(160))).parent().style({width: prompt.element.offsetWidth + 'px'});
        input.attr('value', '');
        win.body.scrollTop = win.body.scrollHeight;
      });
      setTimeout(function() {
        input.select();
      }, 500);
    }
  },
  'notepad': {
    icon: './icons/apps/notepad.png',
    title: 'Notepad',
    exec: function() {
      var win = $window({
        title: 'Notepad',
        width: 640,
        height: 480
      });

      var file_menu = $new('div').class('window').style({'width': '100px'})
      .child(
        $new('div').class('menu-button').text('Save').on('click', ()=>$alert('Trolled', 'Haha! This is a fake Notepad!'))
      )
      .child(
        $new('div').class('menu-button').text('Save As').on('click', ()=>$alert('Trolled', 'Haha! This is a fake Notepad!'))
      )
      .child(
        $new('div').class('menu-button').text('Open').on('click', ()=>$alert('Trolled', 'Haha! This is a fake Notepad!'))
      );

      var options = $new('div').style({
        'width': 'calc(100% - 4px)',
        'height': '16px',
        'padding-top': '2px',
        'padding-left': '2px'
      })
      .child(
        $new('span').text('File').class('menu-button').menu(file_menu)
      )
      .child(file_menu);

      var input = $new('textarea').style({
        'width': '100%',
        'height': 'calc(100% - 20px)',
        'font-family': 'monospace'
      });

      $(win.body).style({'margin': '2px'}).child(options).child(input);
    }
  },
  'readme': {
    icon: './icons/apps/readme.png',
    title: 'README.txt',
    exec: function() {
      var win = $window({
        title: 'README.txt',
        width: 480,
        height: 640
      });
      $(win.body)
      .style({'margin': '2px'})
      .child(
        $new('iframe')
        .style({'width': 'calc(100% - 4px)', 'height': 'calc(100% - 4px)'})
        .attr('src', './res/readme.html')
      );
    }
  }
};
var $cmd = {
  'ls': function(arg, env) {
    var path = $fs.join(env['cd'], arg.join(' '));
    var list = $fs.list(path);
    if(list.length == 0) return 'Directory is empty.';
    var cols = [[], [], [], []];
    var mlen = [0, 0, 0, 0];
    var files = [], dirs = [];
    for(var i = 0; i < list.length; i++) {
      if($fs.isDir($fs.join(path, list[i]))) dirs.push(list[i]);
      else files.push(list[i]);
    }
    var all = [...dirs, ...files];
    for(var i = 0; i < all.length; i++) {
      var text = i < dirs.length ? '[' + all[i] + ']' : all[i];
      cols[i % 4].push(text);
      if(mlen[i % 4] < text.length) mlen[i % 4] = text.length;
    }
    var out = [];
    for(var i = 0; i < cols[0].length; i++) {
      var cur = [];
      for(var j = 0; j < 4; j++) {
        var s = cols[j][i] || '';
        cur.push(s + String.fromCharCode(160).repeat(Math.max(mlen[j] - s.length, 0)));
      }
      out.push(cur.join(String.fromCharCode(160).repeat(4)));
    }
    return out.join('\n');
  },
  'mkdir': function(arg, env) {
    var path = $fs.join(env['cd'], arg.join(' '));
    $fs.mkdir(path);
    return 'Created directory ' + path;
  },
  'cd': function(arg, env) {
    var path = $fs.join(env['cd'], arg.join(' '));
    if($fs.isDir(path)) {
      env['cd'] = path;
    } else {
      throw Error("Path is not a directory.");
    }
    return 'Current path is ' + path;
  },
  'del': function(arg, env) {
    var path = $fs.join(env['cd'], arg.join(' '));
    $fs.remove(path);
    return path + " deleted.";
  }
};

function $exe(cmd, envin) {
  var env = {'cd': 'C:'};
  Object.assign(env, envin);
  var arg = cmd.split(' ');
  try {
    if(arg[0] in $app) return $app[arg[0]].exec(arg.slice(1), env);
    else if(arg[0] in $cmd) return $cmd[arg[0]](arg.slice(1), env);
    else throw Error('Command not found.');
  } catch(er) {
    throw er;
  }
}
