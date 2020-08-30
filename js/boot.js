/* init stoarge */
if(!$fs.initialized()) {
  localStorage.clear();
  $fs.init();
  $fs.mkdir('C:/desktop');
  $fs.mkdir('C:/apps');
  $fs.mkdir('C:/documents');
  $fs.mkdir('C:/appdata');
}
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

/* refresh desktop */
$desktop.refresh();

/* create start menu */
var menu = $new('div')
.class('window')
.style({
  'position': 'absolute',
  'bottom': '31px',
  'left': '0px',
  'width': '100px'
})
.child(
  $new('div')
  .text('Open terminal')
  .class('menu-button')
  .on('click', $app['terminal'].exec)
)
.child(
  $new('div')
  .text('Fullscreen')
  .class('menu-button')
  .on('click', () => $('body').fullscreen())
)
.child(
  $new('div')
  .text('Reinstall')
  .class('menu-button')
  .on('click', function() {
    localStorage.clear();
    location.reload();
  })
);

$('body').child(menu);
$('#start-button').menu(menu, 'active');
