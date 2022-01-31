
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
  },
  'help': function(arg, env) {
    return "Available commands:\n" + Object.keys(this).map(item => '> ' + item).join('\n');
  },
  'js': function(arg, env) {
    var path = $fs.join(env['cd'], arg.join(' '));
    try {
      eval($fs.read(path));
    } catch(er) {
      console.log(er.stack);
      $alert('Error', er.message);
    }
  },
  'rename': function(arg, env) {
    $prompt('Rename file', 'Enter the new name...', function(entered, newname) {
      if(entered) {
        var path = $fs.trim(arg.join(' ')).split('/');
        var parent = path.slice(0, -1).join('/');
        var curname = path[path.length - 1];
        if($fs.exists(parent + '/' + newname)) {
          $alert('Error', 'Path already exists.');
          return;
        }
        /* do the work */
        var place = $fs.getLocation(parent);
        var rawdata = localStorage.getItem(place);
        var newdata = rawdata.replace('<' + encodeURIComponent(curname), '<' + encodeURIComponent(newname));
        localStorage.setItem(place, newdata);
        if(parent == 'C:/desktop') $desktop.refresh();
        if(env.fileman) env.fileman();
      }
    });
  },
  'delete': function(arg, env) {
    $fs.remove(arg.join(' '));
    var path = $fs.trim(arg.join(' ')).split('/');
    var parent = path.slice(0, -1).join('/');
    if(parent == 'C:/desktop') $desktop.refresh();
  }
};

function $exe(cmd, env) {
  if(typeof env == 'undefined') env = {};
  if(typeof env['cd'] != 'string') env['cd'] = 'C:';
  var arg = cmd.split(' ');
  try {
    if(arg[0] in $app) return $app[arg[0]].exec(arg.slice(1), env) || "";
    else if(arg[0] in $cmd) return $cmd[arg[0]](arg.slice(1), env) || "";
    else throw Error('Command not found.');
  } catch(er) {
    throw er;
  }
}

function $command(s, env, callback) {
  var d = s;
  return function() {
    $exe(d, env);
    if(callback) callback();
  }
}
