Yourhome.Model = (function () {
    var that = {},
        activeFeature = "infoboard",
        infoboard,
        members = {members:[]},
        calendar,
        account,
        stock,
        tasks,
        homedata = {
            "infoboard": infoboard,
            "calendar": calendar,
            "tasks": tasks,
            "account": account,
            "stock": stock
        },
        renderdata,

        init = function () {
            _.each(_.keys(homedata), function(element){
                homedata[element] = {
                    "feature": element, 
                    "right": Helper.getShortInfo(element), 
                    "middle":[],
                    "left": Helper.getSortList(element)
                };
            });
            _initEvents();
            _getRight();
            renderdata = _updateRenderdata();
            $(Yourhome).trigger('render', renderdata.infoboard);
            return that;
        },
        
        _getRight = function(){
            _getInfoboardInfo();
            _getStockInfo();
            _getTasksInfo();
            _getAccountInfo();
            _getCalendarInfo();
        },
        
        _initEvents = function(){
            $(Yourhome).on('homedataStart', function(event, data){
                if(data.homedata!=undefined){
                    var json = JSON.parse(data.homedata);
                    _.each(_.keys(homedata), function(element){
                        homedata[element].middle = json[element].middle;
                    });
                    members = data.members;
                    _getRight();
                    $(Yourhome).trigger('render', _updateRenderdata()[activeFeature]);
                }
            });
            
            $(Yourhome).on('homedataUpdated', function(event, data){
                if(data.homedata!=undefined){
                    var json = JSON.parse(data.homedata);
                    _.each(_.keys(homedata), function(element){
                        homedata[element].middle = json[element].middle;
                    });
                    _getRight();
                    $(Yourhome).trigger('render', _updateRenderdata()[activeFeature]);
                }
            });
            
            $(Yourhome).on('featureClicked', function(event, data){
                renderdata = _updateRenderdata();
                $(Yourhome).trigger('render', renderdata[data.feature]);
                activeFeature = data.feature;
            });
            
            $(Yourhome).on('calendarEntryRemoved', function(event, data){
                $(Yourhome).trigger('serverremove', data);
            });
            
            $(Yourhome).on('elementStateChange', function(event, data){
                var entry = data;
                var changed = _.findWhere(homedata[entry.feature].middle,{"input-text":entry["input-text"]});
                changed.done = data.done;
                changed.notDone = data.notDone;
                entry["input-text"] += Helper.getStateMessage(entry.feature, entry.done);
                entry["user-name"] = document.getElementById(data.feature).innerHTML;
                $(Yourhome).trigger('datachange', {entry:changed});
                $(Yourhome).trigger('serverupdate', {entry:entry, feature:"infoboard"});
                _getRight();
                $(Yourhome).trigger('rightUpdated', _updateRenderdata());
            });
            
            $(Yourhome).on('middleContentAdded',function(event, data){
                homedata[data.feature].middle.unshift(data.entry);
                $(Yourhome).trigger('serverupdate', {entry:data.entry, feature:data.entry.feature});
                if(data.feature!="infoboard"){
                    var entry = Helper.clone(data.entry);
                    var feature = "infoboard";
                    entry["user-name"] = document.getElementById(data.feature).innerHTML;
                    homedata.infoboard.middle.unshift(entry);
                    $(Yourhome).trigger('serverupdate', {entry:entry, feature:feature});
                }
                renderdata = _updateRenderdata();
                $(Yourhome).trigger('render', renderdata[data.feature]);
            });
            
            $(Yourhome).on('sortBoxChange',function(event, element){
                _.each(homedata[element.feature].left,function(el){
                    if(el.option===element.option){
                        el.checked = element.checked;
                        if(el.option!="all"){
                            _uncheckAllOption(homedata[element.feature], element.checked);
                        }else{
                            _checkAll(homedata[element.feature], element.checked);
                        }
                    }
                });
                renderdata = _updateRenderdata();
                $(Yourhome).trigger('render', renderdata[element.feature]);
            });
        },
        
        _updateRenderdata = function(){
            var data = Helper.clone(homedata);
            _.each(data, function(element){
                _.each(element.left, function(sortOption){
                    if(!sortOption.checked){
                        if(data[element.feature].feature==="infoboard"){
                            data[element.feature].middle = _.difference(element.middle,_.where(element.middle, {"feature":sortOption.option}));
                        }else{
                            var op = sortOption.option,
                                properties = {};
                            properties[op] = true;
                            data[element.feature].middle = _.difference(element.middle,_.where(element.middle, properties));
                        }
                    }
                });
            });
            return data;
        },
        
        _checkAll = function(feature, checked){
            if(checked){
                _.each(feature.left,function(element){
                    element.checked = true;
                });
            }
        },
        
        _uncheckAllOption = function(feature, checked){
            if(!checked){
                _.findWhere(feature.left, {option:"all"}).checked = false;
            }
        },
        
        _getInfoboardInfo = function(){
            var info = Helper.getShortInfo("infoboard");
            _.each(members.members, function(member){
                info.push(member);
            });
            homedata["infoboard"].right = info;
        },
        
        _getStockInfo = function(){
            var info = Helper.getShortInfo("stock");
            _.each(homedata.stock.middle, function(entry){
                if(!entry.done){
                    info.push(entry["input-text"]);
                }
            });
            homedata["stock"].right = info;
        },
        
        _getTasksInfo = function(){
            var info = Helper.getShortInfo("tasks");
            _.each(homedata.tasks.middle, function(entry){
                if(!entry.done){
                    info.push(entry["input-text"]);
                }
            });
            homedata["tasks"].right = info;
        },
        
        _getAccountInfo = function(){
            var info = Helper.getShortInfo("account");
            _.each(homedata.account.middle, function(entry){
                if(!entry.done){
                    info.push(entry["input-text"]);
                }
            });
            homedata["account"].right = info;
        },
        
        _getCalendarInfo = function(){
            var info = Helper.getShortInfo("calendar");
            var today = Helper.getTodaysEvents(homedata.calendar.middle);
            homedata["calendar"].right = info;
            _.each(today, function(event){
                info.push(event.title);
            });
            homedata["calendar"].right = info;
        };

    that.init = init;


    return that;
})();