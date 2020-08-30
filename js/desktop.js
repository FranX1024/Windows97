const $desktop = {
  refresh: function() {
    var data = $fs.list('C:/desktop'), icons = [], files = [], dirs = [];
    for(var app in $app) {
      icons.push($app[app]);
    }
    for(var i = 0; i < data.length; i++) {
      if($fs.isDir('C:/desktop/' + data[i])) {
        dirs.push({
          title: data[i],
          icon: './icons/system/directory.png',
          exec: function() {

          }
        });
      } else {
        files.push({
          title: data[i],
          icon: './icons/system/file.png',
          exec: function() {

          }
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
      }, icons[i].exec);
    }
  },
  addIcon: function({x: x, y: y, icon: icon, title: title}, exec) {
    var icon = $new('table')
      .class('icon')
      .style({'position': 'absolute', 'top': y + 'px', 'left': x + 'px'})
      .attr('tabIndex', '1')
      .child(
        $new('tbody')
        .child(
          $new('tr')
          .child(
            $new('img')
            .attr('draggable', 'false')
            .attr('src', icon)
          )
        )
        .child(
          $new('tr')
          .class('icon-title')
          .text(title)
        )
      )
      .on('click', function(e) {
        if(e.detail == 2) exec();
      });
    $('#desktop').child(icon.drag(icon));
  }
}
