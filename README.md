# README #

### What is this repository for? ###

This repo is the mobile web application SalesDawg. It's a game-ified sales training tool for car salesmen. The game trains salesmen in good selling habbits by rewarding them for repeating good behaviours. It also helps them improve their product knowledge with a competitive quize style game.

__FYI__ This API is powered by a private API so I won't publish any active user credentials here. But if you want to play with it send me an email and I'll be happy to give you a test account.

##Before Starting##

Before starting make sure you have the latest NPM and Bower already installed, I suggest globally. If you have already done this skip down to the __Getting Started__ section.

###Install and Update###
__Note__ If not installing globally, first cd into the root of this project then remove the `-g` flag from all command...

1. Download and install node from https://nodejs.org

2. Install Bower 
  ```
sudo npm install bower -g
```

3. Update Node, NPM, and Bower
  ```
sudo npm update n npm bower -g
```

##Getting Started##

1. cd into the project root.
2. In the terminal run. 
  ```
npm install; bower install;
  ```

3. Create a userData.json file at the root of the project. Use the following template to populate the file
  ```
{
  "templateModule": "salesDawg.templates",

  "sshUser": "remoteUser",
  "privateKey": "/Users/{username}/.ssh/rsa",
  "passphrase": "",

  "remoteHost": "xxx.xxx.xxx.xxx",
  "remotePort": "22",
  "remotePath": "path/to/production/app/",

  "stagingHost": "xxx.xxx.xxx.xxx",
  "stagingPort": "22",
  "stagingPath": "path/to/staging/app/",

  "devHost": "local.app.salesdawg.com",
  "devUrl": "http://local.app.salesdawg.com",
  "devPort": "8080"
}
```
4.  __Optional__
  For the `devHost` and `devUrl` you can use 127.0.0.1 However, if you choose to run it with the domain name provided above you'll need to add this line to your `/etc/hosts` file.
  ```
127.0.0.1       local.app.salesdawg.com
```

###The gulp commands you'll need to know###

1. ``gulp serve`` Starts up a server on 8080 and listen for js and css changes to livereload
2. ``gulp build`` Cleans out the /build folder minify, concatenate, and inject all the scripts, create the new app manifest, and increment the version number
3. ``gulp stage`` Builds the project creates a git commit with an optional user message, creates a git tag, SSHs into the staging server and pulls the latest build.
4. ``gulp dist`` Builds the project creates a git commit with an optional user message, creates a git tag, SSHs into the production server and pulls the latest build.
5. 
### Who do I talk to? ###

Jonathan King jonathan@jkingworking.com
