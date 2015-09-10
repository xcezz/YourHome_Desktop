var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
var passportlocal = require('passport-local');
var _ = require('underscore');
var sockets = [];
var users = {"id":0,"users":[]};
var homes = {"id":0,"homes":[]};

var app = express();

var server = app.listen(80);

var io = require('socket.io').listen(server);

app.set('view engine', 'ejs');

app.use(express.static(__dirname));

app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(expressSession({
    secret: process.env.SESSION_SECRET ||'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportlocal.Strategy(function(username, password, done) {
    var found = false;
    _.each(users.users, function(user){
        if(username === user.username){
            if(password === user.password){
                done(null, {
                    name: user.username,
                    id: user.userId,
                    hasHome: user.hasHome,
                    home: user.home
                });
                found = true;
            }
        }
    });
    if(!found){
        done(null,null);
    }
}));

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    var user = _.findWhere(users.users, {userId:id});
    done(null, {id: id, name: user.username, hasHome: user.hasHome, home: user.home});
});

app.get('/', function(req, res){
    if(req.isAuthenticated()){
        res.redirect('/yourhome');
    }else{
        res.redirect('/login');
    }
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/login', function(req, res){
    res.render('login',{fail:false});
});

app.post('/login', passport.authenticate('local', {successRedirect: '/choose',
                                 failureRedirect: '/login_failed'}));

app.get('/login_failed', function(req, res){
    res.render('login', {fail:true});
});

app.post('/login_failed', passport.authenticate('local', {successRedirect: '/choose',
                                 failureRedirect: '/login_failed'}));

app.get('/register', function(req, res){
    res.render('register', {fail:false});
});

app.get('/yourhome', function(req, res){
    if(req.isAuthenticated()){
         if(req.user.hasHome){
            res.render('yourhome',{
                username:req.user.name,
                user:req.user.id,
                option:"%= option %",
                lable:"%= lable %",
                imgSrc:"%= imgSrc %",
                inputText:"%= inputText %",
                inputUser:"%= inputUser %",
                inputDate:"%= inputDate %",
                placeholder:"%= placeholder %",
                onclickFunction:"%= onclickFunction %"
            });
        }else{
            res.redirect('/choose');
        }
    }else{
        res.redirect('/');
    }
});

app.get('/register_failed', function(req, res){
    res.render('register', {fail:true});
});

app.post('/register', function(req, res){
    if(_.size(users.users)===0 || (_.findWhere(users.users, {username:req.body.username})===undefined)){
        if(req.body.password === req.body.passwordcheck){
            users.users.unshift({
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                userId: users.id,
                hasHome: false,
                home:"",
                homedata: {infoboard:{feature:'infoboard',middle:[]},calendar:{feature:'calendar',middle:[]},tasks:{feature:'tasks',middle:[]},account:{feature:'account',middle:[]},stock:{feature:'stock',middle:[]}},
                });
            users.id +=1;
            res.redirect('/login');
        }
    }else{
        res.redirect('/register_failed');
    }
});

app.post('/register_failed', function(req, res){
    if(_.size(users.users)===0 || (_.findWhere(users.users, {name:req.body.username})===undefined)){
        if(req.body.password === req.body.passwordcheck){
            users.users.unshift({
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                userId: users.id,
                hasHome: false,
                home:"",
                homedata: {infoboard:{feature:'infoboard',middle:[]},calendar:{feature:'calendar',middle:[]},tasks:{feature:'tasks',middle:[]},account:{feature:'account',middle:[]},stock:{feature:'stock',middle:[]}},
                });
            users.id +=1;
            res.redirect('/login');
        }
    }else{
        res.redirect('/register_failed');
    }
});
    
app.get('/choose', function(req, res){
    if(req.isAuthenticated()){
        if(req.user.hasHome){
            res.redirect('/yourhome');
        }else{
            res.render('choose');
        }
    }else{
        res.redirect('/');
    }
});

app.get('/join', function(req, res){
    if(req.isAuthenticated()){
        if(req.user.hasHome){
            res.redirect('/yourhome');
        }else{
            res.render('join', {fail:false});
        }
    }else{
        res.redirect('/');
    }
});

app.post('/join', function(req, res){
    if(_.findWhere(homes.homes, {name:req.body.homename})!=undefined){
        if(req.body.password === _.findWhere(homes.homes, {name:req.body.homename}).password){
            var user = _.findWhere(users.users, {userId:req.user.id});
            user.hasHome = true;
            _.findWhere(homes.homes, {name:req.body.homename}).members.unshift(req.user.id);
            user.home = _.findWhere(homes.homes, {name:req.body.homename}).id;
            res.redirect('/yourhome');
        }else res.redirect('/join_failed');
    }else res.redirect('/join_failed');
});

app.get('/join_failed', function(req, res){
    if(req.isAuthenticated()){
        if(req.user.hasHome){
            res.redirect('/yourhome');
        }else{
            res.render('join', {fail:true});
        }
    }else{
        res.redirect('/');
    }
});

app.post('/join_failed', function(req, res){
    if(_.findWhere(homes.homes, {name:req.body.homename})!=undefined){
        if(req.body.password === _.findWhere(homes.homes, {name:req.body.homename}).password){
            var user = _.findWhere(users.users, {userId:req.user.id});
            user.hasHome = true;
            _.findWhere(homes.homes, {name:req.body.homename}).members.unshift(req.user.id);
            user.home = _.findWhere(homes.homes, {name:req.body.homename}).id;
            res.redirect('/yourhome');
        }else res.redirect('/join_failed');
    }else res.redirect('/join_failed');
});

app.post('/create', function(req, res){
    var user = _.findWhere(users.users, {userId:req.user.id});
    if(_.size(homes.homes)===0 || (_.findWhere(homes.homes, {name:req.body.homename})===undefined)){
        user.hasHome = true;
        var home = {
            id:homes.id,
            name:req.body.homename,
            members:[],
            password:req.body.password
        }
        home.members.unshift(req.user.id);
        homes.homes.unshift(home);
        user.home = home.id;
        homes.id+=1;
        res.redirect('/yourhome');
    }else{
        res.redirect('/create_failure');
    }
});

app.post('/create_failure', function(req, res){
    var user = _.findWhere(users.users, {userId:req.user.id});
    if(_.size(homes.homes)===0 || (_.findWhere(homes.homes, {name:req.body.homename})===undefined)){
        user.hasHome = true;
        var home = {
            id:homes.id,
            name:req.body.homename,
            members:[],
            password:req.body.password
        }
        home.members.unshift(req.user.id);
        homes.homes.unshift(home);
        user.home = home.id;
        homes.id+=1;
        res.redirect('/yourhome');
    }else{
        res.redirect('/create_failure');
    }
});

app.get('/create', function(req, res){
    if(req.isAuthenticated()){
        if(req.user.hasHome){
            res.redirect('/yourhome');
        }else{
            res.render('create', {fail:false});
        }
    }else{
        res.redirect('/');
    }
});

app.get('/create_failure', function(req, res){
    if(req.isAuthenticated()){
        if(req.user.hasHome){
            res.redirect('/yourhome');
        }else{
            res.render('create', {fail:true});
        }
    }else{
        res.redirect('/');
    }
});

app.get('/account', function(req, res){
    if(req.isAuthenticated()){
        res.render('account', {
            fail: false,
            username: req.user.name,
            homename: _.findWhere(homes.homes, {id:req.user.home}).name
        });
    }else{
        res.redirect('/');
    }
});

app.post('/account', function(req, res){
    _.findWhere(users.users, {userId:req.user.id}).password = req.body.password;
    res.redirect('/yourhome');
});

io.sockets.on('connection', function (socket) {
    socket.emit('connect');
    
    socket.on('connectuser', function(user){
        var sessionuser = _.findWhere(users.users, {userId:user});
        var home = _.findWhere(homes.homes, {id:sessionuser.home});
        var members = [];
        _.each(home.members, function(memberid){
            members.unshift(_.findWhere(users.users, {userId: memberid}).username);
        });
        var data = {
            name:home.name, 
            members:members
        };
        if(sessionuser.sockets===undefined){
            sessionuser.sockets = [];
        }
        sessionuser.sockets.unshift(socket.id);
        sockets.unshift({id:socket.id,socket:socket,user:user});
        socket.emit('start', {homedata:JSON.stringify(sessionuser.homedata), members:data});
    });

    // NEW MESSAGE
    socket.on('newData', function (entry) {
        var sessionuser = _.findWhere(sockets, {id:socket.id}).user;
        var user = _.findWhere(users.users, {userId:sessionuser});
        var homemembers = _.findWhere(homes.homes, {id:user.home}).members;
        _.each(homemembers, function(mateid){
            var mate = _.findWhere(users.users, {userId:mateid})
            mate.homedata[entry.feature].middle.unshift(entry.entry);
            _.each(mate.sockets, function(socketid){
                _.findWhere(sockets, {id:socketid}).socket.emit('update', {homedata:JSON.stringify(user.homedata)});
            });
        });
    });
    
    socket.on('changedData', function (entry) {
        var sessionuser = _.findWhere(sockets, {id:socket.id}).user;
        var user = _.findWhere(users.users, {userId:sessionuser});
        var changed = _.findWhere(user.homedata[entry.entry.feature].middle,{"input-text":entry.entry["input-text"]});
        var index = _.indexOf(user.homedata[entry.entry.feature].middle, changed);
        user.homedata[entry.entry.feature].middle[index] = entry.entry;
        _.each(user.sockets, function(socketid){
            _.findWhere(sockets, {id:socketid}).socket.emit('update', {homedata:JSON.stringify(user.homedata)});
        });
    });
    
    socket.on('removeEntry', function(data){
        var sessionuser = _.findWhere(sockets, {id:socket.id}).user;
        var user = _.findWhere(users.users, {userId:sessionuser});
        var removed = _.findWhere(user.homedata["calendar"].middle,{id:data.id});
        user.homedata["calendar"].middle = _.without(user.homedata["calendar"].middle,removed);
        _.each(user.sockets, function(socketid){
            _.findWhere(sockets, {id:socketid}).socket.emit('update', {homedata:JSON.stringify(user.homedata)});
        });
    });

    socket.on('disconnect', function () {
        var sessionuser = _.findWhere(sockets, {id:socket.id}).user;
        _.findWhere(users.users, {userId:sessionuser}).sockets = _.without(_.findWhere(users.users, {userId:sessionuser}).sockets,socket.id);
        sockets = _.without(sockets, _.findWhere(sockets, {id:socket.id}));
    });
});