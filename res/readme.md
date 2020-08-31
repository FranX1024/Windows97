# === WINDOWS 97 MANUAL ===

Windows 97 is a website that replicates behavior and look of 90s Windows OS-es. It has a working storage system, Windows - like UI with a toolbar and a desktop, file manager and a lot more.

# === BEGINNER'S GUIDE ====

Windows 97 behaves pretty much like any real Windows. Desktop icons are either apps or files. Apps can be opened by clicking on them, and files can be opened in the app specified for that specific extension. Directories can be opened with file manager.

# === PROGRAMMER'S GUIDE ==

Windows 97 apps are saved in directory `C:/apps` and each app is saved in a file without an extension that is named same as the app.
Apps are saved in following format:
```
({ title: "app name", icon: "app icon url", exec: function() { javascript to be ran when app is opened } })
```
All apps (native and installed) will show up on desktop.

Windows 97's API has 3 components that are likely to be used by an app:
* command system (`$exe`)
* storage system (`$fs`)
* User interface (`$window`, `$winui`, `fw.js`)

## COMMAND SYSTEM

`$exe` function runs any command same as it would run in terminal.
Following is the syntax:
`$exe(string : command, object : environment variables)`

## STORAGE SYSTEM

`$fs.write(string : filename, string : content)`
`$fs.read(string : filename)`
`$fs.list(string : dirname)`
`$fs.mkdir(string : dirname)`
`$fs.remove(string : path)`
`$fs.isDir(string : path)`
`$fs.isFile(string : path)`
`$fs.exists(string : path)`
