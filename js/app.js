var $app = {
    'terminal': {
	icon: './icons/apps/terminal.png',
	title: 'Terminal',
	exec: function(arg) {
	    var win = $window({
		title: 'Terminal',
		width: 640,
		height: 400
	    });
	    var output = $new('div');
	    var input = $new('input').class('terminal-input');
	    var prompt = $new('span').class('terminal-prompt').text('C:/>' + String.fromCharCode(160));
	    var body = $(win.body).class('terminal').child(output).child(
		$new('table').style({'width': '100%', 'border-spacing': '0'})
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
	    if(arg && arg.constructor == Array && arg.length != 0) env['cd'] = arg.join(' ');
	    prompt.text($fs.join(env['cd'], '>' + String.fromCharCode(160)));
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
	exec: function(arg) {

	    var path = null;
	    if(arg && arg.constructor == Array && arg.length >= 1) path = arg.join(' ');

	    var win = $window({
		title: path ? 'Notepad - ' + path : 'Notepad - new file',
		width: 640,
		height: 480,
		resize: true
	    });

	    function save() {
		if(path == null) saveAs();
		else $fs.write(path, input.attr('value'));
	    }

	    function saveAs() {
		$exe('fileman', {
		    'select_file': 'yes',
		    'onselect': function(npath) {
			path = npath;
			$fs.write(path, input.attr('value'));
			$(win.titlebar).find('.title-bar-text').text('Notepad - ' + path);
		    }
		});
	    }

	    function open() {
		$exe('fileman', {
		    'select_file': 'yes',
		    'onselect': function(npath) {
			path = npath;
			input.attr('value', $fs.read(path));
			$(win.titlebar).find('.title-bar-text').text('Notepad - ' + path);
		    }
		});
	    }

	    var file_menu = $new('div').class('window')
		.child(
		    $new('div').class('menu-button').text('Save').on('click', save)
		)
		.child(
		    $new('div').class('menu-button').text('Save As').on('click', saveAs)
		)
		.child(
		    $new('div').class('menu-button').text('Open file').on('click', open)
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
		'font-family': 'monospace',
		'resize': 'none'
	    });

	    if(path != null) input.attr('value', $fs.read(path));

	    $(win.body).style({'margin': '2px'}).child(options).child(input);
	}
    },
    'fileman': {
	icon: './icons/apps/storage.png',
	title: 'Storage',
	exec: function(arg, env) {
	    if(typeof env == 'undefined') env = {};
	    var win = $window({
		title: (env['select_file'] == 'yes') ? 'Select a file' : 'File Explorer',
		width: 400,
		height: 400
	    });
	    if(env['select_file'] == 'yes') {
		$(win.titlebar).find('.title-bar-controls').rmchild($(win.titlebar).find('[aria-label="Minimize"]'))
	    }
	    var path = env.path || 'C:';
	    if(arg && arg.constructor == Array && arg.length >= 1) path = arg.join(' ');
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

	    container.contextmenu(
		$new('div')
		    .class('window')
		    .child(
			$new('div').class('menu-button').text('Create new file').on('click', newfile)
		    )
		    .child(
			$new('div').class('menu-button').text('Create new directory').on('click', newdirectory)
		    )
		    .child(
			$new('div').class('menu-button').text('Open terminal here').on('click', () => $exe('terminal ' + path))
		    )
	    );
	    function newfile() {
		$prompt('New file', 'Enter the name of the new file...', function(entered, name) {
		    if(entered) {
			try {
			    $fs.write($fs.join(path, name), '');
			    refreshContainer();
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
			    $fs.mkdir($fs.join(path, name));
			    refreshContainer();
			} catch(er) {
			    $alert('Error', er.message);
			}
		    }
		});
	    }

	    var refreshContainer = function() {
		path = pinput.attr('value');
		var data;
		try {
		    data = $fs.list(path);
		} catch(er) {
		    $alert('ERROR', er.message);
		    return;
		}
		container.empty();
		data.sort((a, b) => $fs.isDir($fs.join(path, a)) > $fs.isDir($fs.join(path, b)) ? -1 : 1);
		for(var i = 0; i < data.length; i++) {
		    var title = data[i];
		    var isdir = $fs.isDir($fs.join(path, data[i]));
		    var iconsrc = (isdir ? './icons/system/directory.png' : './icons/system/file.png');
		    var icon = $new('div')
			.attr('name', data[i])
			.class('icon')
			.style({'display': 'inline-block', 'margin-top': '10px'})
			.attr('tabIndex', '1')
			.child(
			    $new('img')
				.class('icon-icon')
				.attr('src', iconsrc)
			)
			.child(
			    $new('div')
				.class('icon-title-on-white')
				.text(title)
			);
		    if(isdir) icon.on('click', function(e) {
			if(e.detail == 2) {
			    pinput.attr('value', $fs.join(path, $(e.currentTarget).attr('name')));
			    refreshContainer();
			}
		    });
		    else {
			if(env['select_file'] == 'yes') icon.on('click', function(e) {
			    if(e.detail == 2) {
				env['onselect']($fs.join(path, $(e.currentTarget).attr('name')));
				$winui.destroy(win.id);
			    }
			});
			else {
			    var appname = $ext['*'];
			    var ext = data[i].split('.'); ext = ext[ext.length - 1];
			    if(ext in $ext) appname = $ext[ext];
			    icon.on('click', eval('e => e.detail == 2 ? $exe("' + appname + ' ' + $fs.join(path, data[i]) + '") : 0'));
			}
		    }
		    icon.contextmenu(
			$new('div')
			    .class('window')
			    .child(
				$new('div').class('menu-button').text('Rename ' + (isdir?'directory':'file')).on('click', $command('rename ' + $fs.join(path, data[i]), {'fileman': refreshContainer}))
			    )
			    .child(
				$new('div').class('menu-button').text('Delete ' + (isdir?'directory':'file')).on('click', $command('del ' + $fs.join(path, data[i]), {}, refreshContainer))
			    )
		    );
		    container.child(icon);
		}
	    }

	    $(win.body)
		.style({'margin': '2px'})
		.child(
		    $new('button')
			.text(String.fromCharCode(9650))
			.style({'width': '32px'})
			.class('small-button')
			.on('click', function() {
			    if($fs.trim(path) == 'C:') return;
			    path = $fs.trim(path).split('/').slice(0, -1).join('/');
			    pinput.attr('value', path);
			    refreshContainer();
			})
		)
		.child(pinput)
		.child(
		    $new('button')
			.text(String.fromCharCode(9658))
			.style({'width': '32px'})
			.class('small-button')
			.on('click', refreshContainer)
		)
		.child(container);
	    pinput.attr('value', path);
	    refreshContainer();
	}
    },
    'danball': {
	title: 'Dan-Ball',
	icon: './apps/danball/icon.ico',
	exec: function() {
	    var win = $window({title: 'Dan-Ball Physics simulator', width: 404, height: 475, resize: false});
	    var body = $(win.body);
	    body.style({'margin': '2px'})
		.child($new('span').class('menu-button').text('About').on('click', () => $alert('About', 'HINT: Select the material and place it inside the frame.\nMade by Dan-Ball, https://dan-ball.jp/en/javagame/dust/')))
		.child($new('iframe').style({'width': '400', 'height': '456'}).attr('src', './apps/danball/index.html'));
	}
    },
    'wolf3d': {
	title: 'Wolfenstein 3D',
	icon: './apps/wolf3d/favicon.png',
	exec: function() {
	    var win = $window({title: 'Wolfenstein 3D - ID software', width: 644, height: 404, resize: false});
	    var body = $(win.body);
	    body.style({'margin': '2px'})
		.child($new('iframe').style({'width': '640', 'height': '400'}).attr('src', './apps/wolf3d/index.html'));
	}
    },
    'build3d': {
	title: 'Builder 3D',
	icon: './apps/Build3d/icon.png',
	exec: function() {
            var win = $window({title: 'Builder 3D - FranX1024', width: 840, height: 530, resize: false});
            var body = $(win.body);
            body.style({'margin': '0'})
		.child($new('iframe').style({'width': '840', 'height': '530', 'border': 'none'}).attr('src', './apps/Build3d/index.html'));
	}
    },
    'maze': {
	title: 'Maze',
	icon: './apps/maze/icon.png',
	exec: function() {
            var win = $window({title: 'Maze - ~;#^$&/~', width: 480, height: 480, resize: false});
            var body = $(win.body);
            body.style({'margin': '2px'})
		.child($new('iframe').style({'width': '100%', 'height': '100%', 'border': 'none'}).attr('src', './apps/maze/index.html'));
	},
    },
    'trollbox3d': {
	title: 'Trollbox 3D',
	icon: './icons/apps/trollbox3d.png',
	exec: function() {
	    let win = $window({
		width: 1000,
		height: 600,
		title: 'Trollbox 3D',
		resize: false
	    });
	    win.body.style.margin = '0';
		win.body.innerHTML = '<iframe src="https://trollbox3d.sen314.repl.co/" style="width:1000px;height:600px;border:none"></iframe>'
	}
    }
};
