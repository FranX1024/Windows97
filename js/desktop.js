const $desktop = {
  refresh: function() {
    $('#desktop').html('');
    var data = $fs.list('C:/desktop'), icons = [], files = [], dirs = [];
    for(var app in $app) {
      var icon = {};
      Object.assign(icon, $app[app]);
      icon.type = 'application';
      icons.push(icon);
    }
    for(var i = 0; i < data.length; i++) {
      if($fs.isDir('C:/desktop/' + data[i])) {
        dirs.push({
          title: data[i],
          icon: './icons/system/directory.png',
          exec: $command('fileman C:/desktop/' + data[i]),
          type: 'directory',
          path: 'C:/desktop/' + data[i]
        });
      } else {
        var appname = $ext['*'];
        var ext = data[i].split('.'); ext = ext[ext.length - 1];
        if(ext in $ext) appname = $ext[ext];
        files.push({
          title: data[i],
          icon: './icons/system/file.png',
          exec: $command(appname + ' C:/desktop/' + data[i]),
          type: 'file',
          path: 'C:/desktop/' + data[i]
        });
      }
    }
    icons = [...icons, ...dirs, ...files];
    var column_size = Math.floor($('#desktop').element.offsetHeight / 64);
    for(var i = 0; i < icons.length; i++) {
      var x = Math.floor(i / column_size);
      var y = i % column_size;
      var title = icons[i];
      this.addIcon({
        x: 10 + 64 * x,
        y: 10 + 64 * y,
        icon: icons[i].icon || './icons/system/default_app.png',
        title: icons[i].title || 'Unnamed application'
      }, icons[i].exec, icons[i].type, icons[i].path);
    }
  },
  addIcon: function({x: x, y: y, icon: icon, title: title}, exec, type, path) {
    var cmenu = $new('div').class('window');
    if(type == 'application') { // application
      cmenu.child(
        $new('div').class('menu-button').text('Open app').on('click', exec)
      )
      .child(
        $new('div').class('menu-button').text('Uninstall').on('click', $command('uninst ' + path))
      )
    } else {
      cmenu.child(
        $new('div').class('menu-button').text('Open ' + type).on('click', exec)
      )
      .child(
        $new('div').class('menu-button').text('Rename').on('click', $command('rename ' + path))
      )
      .child(
        $new('div').class('menu-button').text('Delete').on('click', $command('delete ' + path))
      )
    }
    var icon = $new('div')
      .class('icon')
      .style({'position': 'absolute', 'top': y + 'px', 'left': x + 'px'})
      .attr('tabIndex', '1')
      .child(
        $new('img')
        .class('icon-icon')
        .attr('src', icon)
      )
      .child(
        $new('div')
        .class('icon-title')
        .text(title)
      )
      .on('click', function(e) {
        if(e.detail == 2) exec();
      })
      .contextmenu(cmenu);
    $('#desktop').child(icon.drag(icon));
  }
};

(function() {
  $('#desktop').contextmenu(
    $new('div')
    .class('window')
    .child(
      $new('div').class('menu-button').text('Create new file').on('click', newfile)
    )
    .child(
      $new('div').class('menu-button').text('Create new directory').on('click', newdirectory)
    )
    .child(
      $new('div').class('menu-button').text('Open terminal here').on('click', $command('terminal C:/desktop'))
    )
    .child(
      $new('div').class('menu-button').text('Refresh desktop').on('click', () => $desktop.refresh())
    )
  );
  function newfile() {
    $prompt('New file', 'Enter the name of the new file...', function(entered, name) {
      if(entered) {
        try {
          $fs.write('C:/desktop/' + name, '');
          $desktop.refresh();
        } catch(er) {
          $alert('Error', er.message);
        }
      }
    });
  }
  function newdirectory() {
    $prompt('New file', 'Enter the name of the new directory...', function(entered, name) {
      if(entered) {
        try {
          $fs.mkdir('C:/desktop/' + name);
          $desktop.refresh();
        } catch(er) {
          $alert('Error', er.message);
        }
      }
    });
  }
})();
