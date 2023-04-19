/*

localStorage :

file:

[id] => F[content]
[id] => D<[name]=[id]><[name]=[id]>[...]


Source dir: id = '0'
*/

var $fs = {
  getLocation(path) {
    var dirs = this.trim(path).split('/');
    if(dirs.length ==  1 && dirs[0] == '') return '0';
    if(dirs[0] != 'C:' && dirs[0] != 'c:') throw Error("Only C: drive available!");
    var curid = '0';
    for(var i = 1; i < dirs.length; i++) {
      var dir = encodeURIComponent(dirs[i]);
      var content = localStorage.getItem(curid);
      if(content[0] != 'D') throw Error(dir + ' is not a directory.');
      var i1 = content.indexOf('<' + dir + '=');
      var i2 = content.indexOf('>', i1);
      if(i1 == -1) return false;
      curid = content.substring(i1 + dir.length + 2, i2);
    }
    return curid;
  },
  read(path) {
    var data = localStorage.getItem(this.getLocation(path));
    if(!data) return data;
    if(data[0] == 'D') throw Error(path + ' is a directory.');
    return data.slice(1);
  },
  list(path) {
    var data = localStorage.getItem(this.getLocation(path));
    if(!data) throw Error(path + ' does not exist.');
    if(data[0] != 'D') throw Error(path + ' is not a directory.');
    var dlist = [];
    var begin = 1, ending = 0;
    while(true) {
      begin = data.indexOf('<', ending);
      ending = data.indexOf('=', begin);
      if(begin == -1 || ending == -1) break;
      dlist.push(decodeURIComponent(data.substring(begin + 1, ending)));
    }
    return dlist;
  },
  write(path, content) {
    var pathl = this.trim(path).split('/');
    var dir = pathl.slice(0, -1).join('/');
    var name = pathl[pathl.length - 1];
    if(this.isDir(path)) throw Error(path + ' is a directory.');
    if(!this.isFile(path)) {
      var id = randID();
      var data = localStorage.getItem(this.getLocation(dir));
      if(!data || data[0] != 'D') throw Error(dir + ' is not a directory.');
      data += '<' + encodeURIComponent(name) + '=' + id + '>';
      localStorage.setItem(this.getLocation(dir), data);
    }
    localStorage.setItem(this.getLocation(path), 'F' + content);
  },
  mkdir(path) {
    var pathl = this.trim(path).split('/');
    var dir = pathl.slice(0, -1).join('/');
    var name = pathl[pathl.length - 1];
    if(this.exists(path)) throw Error(path + ' already exists.');
    var id = randID();
    var data = localStorage.getItem(this.getLocation(dir));
    if(!data || data[0] != 'D') throw Error(dir + ' is not a directory.');
    data += '<' + encodeURIComponent(name) + '=' + id + '>';
    localStorage.setItem(this.getLocation(dir), data);
    localStorage.setItem(this.getLocation(path), 'D');
  },
  remove(path) {
    path = this.trim(path);
    if(path == '') throw Error("Cannot delete root");
    if(!this.exists(path)) throw Error("Path does not exist");
    if(path == '')
  	if(this.isDir(path)) {
      this.list(path).forEach(item => this.remove(this.join(path, item)));
    }
    localStorage.removeItem(this.getLocation(path));
    var dirs = path.split('/');
    var name = dirs[dirs.length - 1];
    var parent = dirs.slice(0, -1).join('/');
    var data = localStorage.getItem(this.getLocation(parent));
    var begin = data.indexOf('<' + encodeURIComponent(name) + '=');
    var end = data.indexOf('>', begin);
    localStorage.setItem(this.getLocation(parent), data.substring(0, begin) + data.substring(end + 1, data.length));
  },
  isFile(path) {
    var data = localStorage.getItem(this.getLocation(path));
    if(data && data[0] == 'F') return true;
    return false;
  },
  isDir(path) {
    var data = localStorage.getItem(this.getLocation(path));
    if(data && data[0] == 'D') return true;
    return false;
  },
  exists(path) {
    return this.getLocation(path) ? true : false;
  },
  join(...paths) {
    var inp = [];
    for(var i = 0; i < paths.length; i++) {
      var path = $fs.trim(paths[i]).split('/');
      for(var j = 0; j < path.length; j++) inp.push(path[j]);
    }
    var out = [];
    for(var i = 0; i < inp.length; i++) {
      if(inp[i] == 'C:') out = [];
      if(inp[i] == '..') out.pop();
      else out.push(inp[i]);
    }
    return this.trim(out.join('/'));
  },
  trim(path) {
    if(path[0] == '/') path = path.slice(1);
    if(path[path.length - 1] == '/') path = path.slice(0, -1);
    return path;
  },
  init() {
    localStorage.clear();
    localStorage.setItem('0', 'D');
  },
  initialized() {
    return localStorage.getItem('0') ? true : false;
  },
    readFromServer(url) {
	return new Promise((resolve, reject) => {
	    const xhr = new XMLHttpRequest();
	    xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
		    if (xhr.status === 200) {
			resolve(xhr.responseText);
		    } else {
			reject(xhr.statusText);
		    }
		}
	    };

	    xhr.open('GET', url);
	    xhr.send();
	});
    }
}
