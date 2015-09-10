Yourhome.Controller = (function () {
    var that = {},
        SERVER = "192.168.1.6:80",
        server,
        infoboard,
        calendar,
        account,
        stock,
        tasks,
        user,

        init = function (data) {
            _initServerConnection();
            user = data;
            infoboard = document.getElementById("infoboard");
            calendar = document.getElementById("calendar");
            account = document.getElementById("account");
            stock = document.getElementById("stock");
            tasks = document.getElementById("tasks");
            _initEvents();
            return that;
        },
        
        _initServerConnection = function () {
            server = io.connect(SERVER);
            server.on('update', _updateData);
            server.on('connect', _connect);
            server.on('start', _start);
        },
        
        _updateData = function(data){
            $(Yourhome).trigger('homedataUpdated', data);
        },
        
        _start = function(data){
            $(Yourhome).trigger('homedataStart', data);
        },
        
        _connect = function(data){
            server.emit('connectuser', user);
        },
        
        _initEvents = function(){
            $(Yourhome).on('serverupdate', function(event, data){
                server.emit('newData', data);
            });
            
            $(Yourhome).on('datachange', function(event, data){
                server.emit('changedData', data);
            });
            
            $(Yourhome).on('serverremove', function(event,data){
                server.emit('removeEntry', data);
            });
            
            infoboard.onclick = function(){
                $(Yourhome).trigger('featureClicked',{"feature":"infoboard"});
            };
            calendar.onclick = function(){
                $(Yourhome).trigger('featureClicked',{"feature":"calendar"});
            };
            account.onclick = function(){
                $(Yourhome).trigger('featureClicked',{"feature":"account"});
            };
            stock.onclick = function(){
                $(Yourhome).trigger('featureClicked',{"feature":"stock"});
            };
            tasks.onclick = function(){
                $(Yourhome).trigger('featureClicked',{"feature":"tasks"});
            };
        };

    that.init = init;


    return that;
})();