String.prototype.replaceAll = function(a,b){return this.split(a).join(b)}
class Enviroment {
constructor() {
this.envs = {}
this.set = function(a,b){this.envs[a] = b}
this.get = function(a) {return this.envs[a]}
this.parse = function(txt) {
var abc = txt
Object.keys(this.envs).forEach((envname) => {
abc = abc.replaceAll('%'+envname+'%',this.envs[envname])
})

return abc

}
}

}
