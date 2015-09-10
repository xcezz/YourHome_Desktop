const Helper = (function () {
    var that = {},
        
        _today = function(){
            var today = new Date(),
                dd = today.getDate(),
                mm = today.getMonth()+1,
                yyyy = today.getFullYear();

            if(dd<10) {
                dd='0'+dd;
            } 

            if(mm<10) {
                mm='0'+mm;
            } 

            today = dd+'.'+mm+'.'+yyyy;
            return today;
        },
        
        _getTodaysEvents = function(events){
            var array = [];
            var today = new Date();
            _.each(events, function(element){
                var year = _year(element.start),
                month = _month(element.start),
                day = _day(element.start);
                if(year === parseInt(today.getFullYear())){
                    if(month === parseInt(today.getMonth()+1)){
                        if(day === parseInt(today.getDate())){
                            array.unshift(element);
                        }
                    }
                }
            });
            return array;
        },
        
        _year = function(string){
            var result = "";
            for(var i=0; i<4; i++){
                result += string.charAt(i);
            }
            return parseInt(result);
        },
        
        _month = function(string){
            var result = "";
            for(var i=5; i<7; i++){
                result += string.charAt(i);
            }
            return parseInt(result);
        },
        
        _day = function(string){
            var result = "";
            for(var i=8; i<10; i++){
                result += string.charAt(i);
            }
            return parseInt(result);
        },
        
        _getCalendarFormat = function(data){
            var date = new Date(data),
                dd = date.getDate(),
                mm = date.getMonth()+1,
                yyyy = date.getFullYear();

            if(dd<10) {
                dd='0'+dd;
            } 

            if(mm<10) {
                mm='0'+mm;
            } 

            date = dd+'.'+mm+'.'+yyyy;
            return date;
        },
        
        _clone = function(homedata){
            var dataString,
                data;
            dataString = JSON.stringify(homedata);
            return JSON.parse(dataString);
        },
        
        _getShortInfo = function(feature){
            var shortInfo = {
                "infoboard":["Mitbewohner:"],
                "calendar":["Heute:"],
                "account":["Mein Konto:"],
                "stock":["Einkaufsliste:"],
                "tasks":["Nicht erledigt:"]
            };
            return shortInfo[feature];
        },
        
        _getStateMessage = function(feature, done){
            if(feature === "stock"){
                if(!done){
                    return " leer";
                }else return " vorrätig";
            }
            if(feature === "tasks"){
                if(done){
                    return " erledigt";
                }
            }
            if (feature === "account"){
                if(done){
                    return " gezahlt";
                }
            }
            return "";
        },
        
        _toggleTrue = function(boolean){
            if(boolean){
                return false;
            }else return true;
        },
        
        _getSortList = function(feature){
            var sortList = {
                "infoboard":[{title:"Alles anzeigen", option:"all", checked: true},
                             {title:"Nachrichten", option:"infoboard", checked: true},
                             {title:"Aufgaben", option:"tasks", checked: true},
                             {title:"Kalender", option:"calendar", checked: true},
                             {title:"Vorräte", option:"stock", checked: true},
                             {title:"Rechnungen", option:"account", checked: true}],
                "account":[{title:"Alles anzeigen", option:"all", checked: true},
                             {title:"Bezahlt", option:"done", checked: true},
                             {title:"Nicht bezahlt", option:"notDone", checked: true}],
                "stock":[{title:"Alles anzeigen", option:"all", checked: true},
                             {title:"Vorhanden", option:"done", checked: true},
                             {title:"Nicht vorhanden", option:"notDone", checked: true}],
                "tasks":[{title:"Alles anzeigen", option:"all", checked: true},
                             {title:"Erledigte", option:"done", checked: true},
                             {title:"Nicht erledigte", option:"notDone", checked: true}],
                "calendar":[{title:"Alles anzeigen", option:"all", checked: true},
                             {title:"Eigene", option:"private", checked: true},
                             {title:"Nicht eigene", option:"notPrivate", checked: true}]
            };
            return sortList[feature];
        };
     
    that.getTodaysEvents = _getTodaysEvents;
    that.getCalendarFormat =_getCalendarFormat;
    that.getStateMessage = _getStateMessage;
    that.toggleTrue = _toggleTrue;
    that.clone = _clone;
    that.getShortInfo = _getShortInfo;
    that.getSortList = _getSortList;
    that.today = _today;

    return that;

})();