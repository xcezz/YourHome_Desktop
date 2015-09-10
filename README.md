yourHome
=============

This is the project we got to develop in the course MME WS14/15.

By [Markus Bosek](https://github.com/wulz0r) and [Christian Winkler](https://github.com/xcezz).


Installation
-------
- Enter your local IP-Adress in *src/yourhome/Controller.js*, for example:
```sh
3   SERVER = "192.168.0.6";
```

- Open your command-line (Windows) or Terminal (Mac).
- Change to the directory where the **app.js** is located with:
```sh
cd /path_to_dir/
```
- Start the server with:
```sh
node app.js
```

- Go to your browser and enter [localhost](localhost:80).

Dependencies
-------
Install via command-line like this, for example:
```sh
npm install express
```
- express
- express-session
- body-parser
- cookie-parser
- passport
- passport-local
- underscore
- socket.io
- ejs

### Tech

* [node.js](https://nodejs.org/) - evented I/O for the backend
* [Express](http://expressjs.com/) - fast node.js network app framework
* [Socket.io](http://socket.io/) - simple real-time event-based communication
* [Fullcalendar.io](http://fullcalendar.io/) - javaScript event calendar
* [Passport](http://passportjs.org/) - simple authentification for node.js
* [underscore.js](http://underscorejs.org/) - useful programming helpers
* [jQuery](https://jquery.com/) - DOM-manipulation and -navigation made easy

### Version
1.0


