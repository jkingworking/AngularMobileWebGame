# README #

##Getting Setup##
To build and use this you'll need NPM, and bower already installed globally. 

1. In the terminal run.
```
npm install; bower install; 
```
2. Create a userData.json file at the root of the project. Use the following template to populate the file
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
###The gulp commands you'll need to know###

``gulp serve`` Starts up a server on 8080 and listen for js and css changes to livereload

``gulp build`` Cleans out the /build folder minify, concatenate, and inject all the scripts, create the new app manifest, and increment the version number

``gulp stage`` Builds the project creates a git commit with an optional user message, creates a git tag, SSHs into the staging server and pulls the latest build.

``gulp dist`` Builds the project creates a git commit with an optional user message, creates a git tag, SSHs into the production server and pulls the latest build.

### What is this repository for? ###

This repo is the mobile web application SalesDawg. It's a game-ified sales training tool for car dealers. It's powered by a private API so I won't publish any active user credentials here. But if you want to play with it send me an email and I'll be happy to give you a test account to play with.

### Who do I talk to? ###

Jonathan King jonathan@jkingworking.com