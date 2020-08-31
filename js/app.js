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
    title: 'README',
    exec: function() {
      var win = $window({
        title: 'README',
        width: 480,
        height: 640
      });
      $(win.body)
      .style({'margin': '2px'})
      .child(
        $new('iframe')
        .style({'width': 'calc(100% - 4px)', 'height': 'calc(100% - 4px)'})
        .attr('src', './res/readme.md')
      );
    }
  },
  'fileman': {
    icon: './icons/apps/storage.png',
    title: 'Storage',
    exec: function(arg) {
      var win = $window({
        title: 'File Explorer',
        width: 480,
        height: 480
      });
      var path = 'C:';
      if(typeof arg != 'undefined') path = arg.join(' ');
      var pinput = $new('input').style({
        'width': 'calc(100% - 70px)',
        'height': '20px',
        'outline': 'none',
        'margin-bottom': '4px',
        'font-family': 'monospace',
        'margin-left': '2px',
        'margin-right': '2px'
      }).text(path);

      var container = $new('div').style({
        'width': 'calc(100% - 4px)',
        'height': 'calc(100% - 28px)',
        'background-color': 'white',
        'border': '2px inset',
        'overflow-y': 'auto',
        'overflow-x': 'none'
      });

      var refreshContainer = function() {
        path = pinput.attr('value');
        var data;
        try {
          data = $fs.list(path);
        } catch(er) {
          $alert('ERROR', er.stack);
          return;
        }
        container.empty();
        for(var i = 0; i < data.length; i++) {
          var title = data[i];
          var isdir = $fs.isDir($fs.join(path, data[i]));
          var iconsrc = (isdir ? './icons/system/directory.png' : './icons/system/file.png');
          var icon = $new('table')
          .attr('name', data[i])
          .class('icon')
          .style({'display': 'inline'})
          .attr('tabIndex', '1')
          .child(
            $new('tbody')
            .child(
              $new('tr')
              .child(
                $new('img')
                .attr('draggable', 'false')
                .attr('src', iconsrc)
              )
            )
            .child(
              $new('tr')
              .class('icon-title-on-white')
              .text(title)
            )
          );
          if(isdir) icon.on('click', function(e) {
            if(e.detail == 2) {
              pinput.attr('value', $fs.join(path, $(e.currentTarget).attr('name')));
              refreshContainer();
            }
          });
          container.child(icon);
        }
      }

      $(win.body)
      .style({'margin': '2px'})
      .child(
        $new('button')
        .text(String.fromCharCode(11172))
        .class('small-button')
        .on('click', function() {
          path = $fs.trim(path).split('/').slice(0, -1).join('/');
          pinput.attr('value', path);
          refreshContainer();
        })
      )
      .child(pinput)
      .child(
        $new('button')
        .text(String.fromCharCode(11171))
        .class('small-button')
        .on('click', refreshContainer)
      )
      .child(container);
      pinput.attr('value', path);
      refreshContainer();
    }
  }
};
