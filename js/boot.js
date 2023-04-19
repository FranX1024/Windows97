/* init stoarge */
if(!$fs.initialized()) {
  localStorage.clear();
  $fs.init();
  $fs.mkdir('C:/desktop');
  $fs.mkdir('C:/apps');
  $fs.mkdir('C:/documents');
  $fs.mkdir('C:/appdata');
  $fs.mkdir('C:/appdata/3d_models')
  $fs.mkdir('C:/config');
    $fs.write('C:/config/ext', '{"*":"notepad","txt":"notepad","js":"js"}');
    (async function() {
	let fnames = [
	    'bridge.vmd',
	    'evilredthing.vmd',
	    'greenshore.vmd',
	    'hell.vmd',
	    'winterhouse.vmd'
	];
	console.log('Downloading Build3D models...');
	for(let i = 0; i < fnames.length; i++) {
	    $fs.write(
		'C:/appdata/3d_models/' + fnames[i],
		await $fs.readFromServer('/apps/Build3d/models/' + fnames[i]));
	}
    })();
}
(function() {
  /* load apps */
  var files = $fs.list('C:/apps'), allgood = true;
  for(var i = 0; i < files.length; i++) {
    try {
      var obj = eval($fs.read('C:/apps/' + files[i]));
      if(typeof obj.exec == 'function') $app[files[i]] = obj;
      else throw Error('Cannot find exec in C:/apps/' + files[i]);
    } catch (er) {
      console.log("Application '" + files[i] + "' failed!");
      console.log(er);
      allgood = false;
    }
  }
  if(!allgood) $alert("Warning", "Some applications failed to load, check console logs to see what happened.");
})();

/* load extension settings */
var $ext = {'*': 'notepad'};
try {
  $ext = JSON.parse($fs.read('C:/config/ext'));
} catch(er) {
  $alert('Fatal Error', 'Could not load C:/config/ext due to following error\n' + er.msg + '\nUntil ext file is fixed, default app for opening all files will be Notepad.');
}

/* refresh desktop */
try {
  $desktop.refresh();
} catch(er) {
  $alert('Fatal Error', 'Could not load Desktop due to following error\n' + er.message + '\nTo fix this error reinstall from start menu, or ask for help of a professional.');
}

(function() {
  /* create start menu */
  var menu = $new('div')
  .class('window')
  .style({
    'position': 'absolute',
    'bottom': '31px',
    'left': '0px'
  })
  .child(
    $new('div')
    .text('Open terminal')
    .class('menu-button')
    .on('click', $app['terminal'].exec)
  )
  .child(
    $new('div')
    .text('Open file manager')
    .class('menu-button')
    .on('click', $command('fileman'))
  )
  .child(
    $new('div')
    .text('Reinstall')
    .class('menu-button')
    .on('click', function() {
      localStorage.clear();
      location.reload();
    })
  )
  .child(
    $new('div')
    .text('Fullscreen')
    .class('menu-button')
    .on('click', () => $('body').fullscreen())
  )

  $('body').child(menu);
  $('#start-button').menu(menu, 'active');
})();

$('body').on('contextmenu', function(e) {
  e.preventDefault();
});
