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
