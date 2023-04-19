requestAnimationFrame(update3DB);
loadMap(map);

document.getElementById('fov').oninput = function(e) {

  camera.setFov(Number(e.target.value));
}
document.getElementById('dist').oninput = function(e) {

  camera.dist = Number(e.target.value*.1);
}
document.getElementById('ypos').oninput = function(e) {

  camera.top = Number(e.target.value);
}
document.getElementById('mouse').oninput = function(e) {

  conf.MOUSE_SENSITIVITY = Number(e.target.value);
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function model_clear() {
  for(var i = 0; i < 32768; i++) map[i] = EMPTY;
  for(var i = 0; i < (1 << EDGE_L2); i++) for(var j = 0; j < (1 << EDGE_L2); j++) map[getPos(i, 0, j)] = 255 << 8;
  loadMap(map);
}

function export_model() {
  /* format model data into a bitstring */
  var raw_data = '';
  for(var i = 0; i < 1 << (EDGE_L2 * 3); i++) {
    raw_data += String.fromCharCode((map[i] >> 24) & 255) + String.fromCharCode((map[i] >> 16) & 255) + String.fromCharCode((map[i] >> 8) & 255) + String.fromCharCode(map[i] & 255);
  }
  /* if inside Windows 97, store to virtual filesystem */
  if(parent.$fs) {
    parent.$prompt('Export model', 'Enter filename (*.vmd) ...', function(success, input) {
        if(!success) return;
        if(!input.endsWith('.vmd')) input += '.vmd';
        parent.$fs.write('C:/appdata/3d_models/' + input, raw_data);
        parent.$alert('Export model', 'Model saved to C:/appdata/3d_models/' + input);
    });
  } else {
    /* otherwise download model */
    download('model.vmd', raw_data);
  }
}

function import_model() {
  if(parent.$fs) {
    parent.$exe('fileman', {
        'select_file': 'yes',
        'path': 'C:/appdata/3d_models',
        'onselect': function(path) {
            let raw_data = parent.$fs.read(path);
            for(var i = 0; i < 1 << (EDGE_L2 * 3); i++) {
                map[i] = (raw_data.charCodeAt(i * 4) << 24) + (raw_data.charCodeAt(i * 4 + 1) << 16) + (raw_data.charCodeAt(i * 4 + 2) << 8) + raw_data.charCodeAt(i * 4 + 3);
            }
            loadMap(map);
        }
    })
  } else {
    document.getElementById('file_input').click()
  }
}

function onFileLoad(elementId, event) {
    var raw_data = event.target.result;
    for(var i = 0; i < 1 << (EDGE_L2 * 3); i++) {
      map[i] = (raw_data.charCodeAt(i * 4) << 24) + (raw_data.charCodeAt(i * 4 + 1) << 16) + (raw_data.charCodeAt(i * 4 + 2) << 8) + raw_data.charCodeAt(i * 4 + 3);
    }
    loadMap(map);
    document.getElementById('file_input').parentElement.reset();
}

function onChooseFile(event, onLoadFileHandler) {
    if (typeof window.FileReader !== 'function')
        throw ("The file API isn't supported on this browser.");
    let input = event.target;
    if (!input)
        throw ("The browser does not properly implement the event object");
    if (!input.files)
        throw ("This browser does not support the `files` property of the file input.");
    if (!input.files[0])
        return undefined;
    let file = input.files[0];
    let fr = new FileReader();
    fr.onload = onLoadFileHandler;
    fr.readAsText(file);
}
