Yourhome.View = (function () {
    var that = {},
        username,
        left,
        middle,
        right,
        checkboxTemplate,
        templates = {},
        renderdata,
        calendar,

        init = function (user) {
            username = user;
            _initElements();
            _initEvents();
            return that;
        },
        
        _initElements = function(){
            templates.infoboardTemplate = document.getElementById('infoboardTemplate');
            checkboxTemplate = document.getElementById('checkboxTemplate');
            templates.newinfoboardTemplate = document.getElementById('newInfoboardEntryTemplate');
            templates.newstockTemplate = document.getElementById('newStockEntryTemplate');
            templates.stockTemplate = document.getElementById('stockTemplate');
            templates.newtasksTemplate = document.getElementById('newStockEntryTemplate');
            templates.tasksTemplate = document.getElementById('stockTemplate');
            templates.newaccountTemplate = document.getElementById('newAccountEntryTemplate');
            templates.accountTemplate = document.getElementById('stockTemplate');
            left = $('#steuerunglinks');
            middle = $('#steuerungmitte');
            right = $('#steuerungrechts');
            _createCalendar();
           
        },
                    
        _initEvents = function(){
            $(Yourhome).on('submitEntry',_submitEntry);
            $(Yourhome).on('render', function(event,data){
                renderdata = data;
                _render();
            });
            $(Yourhome).on('rightUpdated', function(event, data){
                renderdata.right = data[renderdata.feature].right;
                _renderRightBar();
            });
        },
        
        _render = function(){
            _renderLeftBar();
            _renderMiddleBar();
            _renderRightBar();
        },
        
        _renderMiddleBar = function(){
            middle.empty();
            if(renderdata.feature=="calendar"){
                middle.append(calendar);
                calendar.innerHTML = "";
                _getCalendar();
            }else{
                _.each(renderdata.middle, function(element){
                    middle.append(_getContainer(element));
            });
            }
        },
        
        _getCalendar = function(){
            $(calendar).fullCalendar({
                eventClick: function(calEvent, jsEvent, view) {
                    _showEventData(calEvent);
                }
            });
            
            _.each(renderdata.middle, function(element){             
                if(element.private){
                    element.backgroundColor = "red";
                }else element.backgroundColor = "default";
                
                $(calendar).fullCalendar('renderEvent', {id:element.id, title:element.title, start: element.start, end: element.end, allDay:element.allDay, info:element.info, private:element.private, backgroundColor: element.backgroundColor}, true);
            });
        },
        
        _createCalendar = function(){
            calendar = document.createElement("div");
            calendar.id = "calendarMiddle";
            calendar.eventid = 0;
        },
        
        _renderRightBar = function(){
            right.empty();
            var entry = "<p><b>" + _.first(renderdata.right) + "</b></p>";
            _.each(_.last(renderdata.right, _.size(renderdata.right)-1), function(element){
                entry += "<p>"+element+"<p>";
            });
            right.html(entry);
        },
        
        _renderLeftBar = function(){
            _createAddButton();
            var sort = left.find("#sort-options");
            sort.empty();
            _.each(renderdata.left, function(element){
                var el = {"lable":element.title,
                         "option":element.option},
                    container,
                    compiled = _.template($(checkboxTemplate).html());
                container = $(compiled(el));
                var checkbox = container.find('input')[0];
                checkbox.checked = element.checked;
                container.on('change',function(){
                    $(Yourhome).trigger('sortBoxChange',{"feature":renderdata.feature, 
                                                         "option":container.attr('option'), 
                                                         "checked":checkbox.checked
                                                        }
                                       );
                    _render();
                });
                sort.append(container);
            });
        },
        
        _createAddButton = function(){ 
            var old = left.find("button");
            if(old!=undefined){
                old.remove();
            }
            var but = document.createElement("button");
            but.innerHTML = "Neuer Eintrag";
            but.className = "button-newentry";
            if(renderdata.feature === "calendar"){
                but.setAttribute("href", "#newCalendar");
                $(but).leanModal(); 
                document.getElementById("newCalendarButton").onclick = _newCalendarEntry;
            }
            but.onclick = function(){
                if(renderdata.feature!="calendar"){
                    _newEntry();
                }
            };
            left.prepend(but);
        },
            
        _newEntry = function(){ 
            if(document.getElementById("submitForm")===null){
                var newEntry = {"onclickFunction":"$(Yourhome).trigger('submitEntry')",
                           "placeholder":"Eingabe"},
                    container,
                    compiled = _.template($(templates["new" + renderdata.feature + "Template"]).html());
                container = $(compiled(newEntry));
                middle.prepend(container);
            }
            middle.find(".message")[0].focus();
        },
        
        _newCalendarEntry = function(){
            var data = document.getElementById("newCalendar"),
                calendarEntry = {};
            var inputs = $(data).find("input");
            var submitbutton = document.getElementById('newCalendarButton');
            submitbutton.type = "button";
            if(document.getElementById('calendarform').checkValidity()){
                calendarEntry.feature = "calendar";
                calendarEntry.id = calendar.eventid;
                calendar.eventid += 1;
                calendarEntry.title = inputs[0].value;
                calendarEntry.info = inputs[1].value;
                calendarEntry.allDay = inputs[2].checked;                
                calendarEntry.private = inputs[3].checked;
                calendarEntry.notPrivate = !inputs[3].checked;
                calendarEntry.start = inputs[4].value + " " + inputs[5].value;
                calendarEntry.end = inputs[6].value + " " + inputs[7].value;
                calendarEntry.user = username;
                calendarEntry["user-img"] = "calendar";
                calendarEntry["input-text"] = calendarEntry.title + " am " +  Helper.getCalendarFormat(calendarEntry.start);
                calendarEntry["user-name"] = "Kalender Eintrag";
                calendarEntry.date = Helper.today();
                $(calendar).fullCalendar('renderEvent', calendarEntry, true);
                renderdata.middle.push(calendarEntry);
                $(Yourhome).trigger('middleContentAdded',{"feature":renderdata.feature,"entry":calendarEntry});
                $("#lean_overlay").fadeOut(200);
                $("#newCalendar").css({"display":"none"});
            }else{
                submitbutton.type = "submit";
            }
        },
        
        _showEventData = function(event){
            var eventdata = _.findWhere(renderdata.middle, {id: event.id});
            var display = document.getElementById("calendarInfoForm");
            var labels = $(display).find("label");
            document.getElementById("deleteCalendar").onclick = function(){
                $("#lean_overlay").fadeOut(200);
                $("#calendarInfo").css({"display":"none"});
                $(Yourhome).trigger('calendarEntryRemoved',{id:event.id});
            }
            labels[0].innerHTML = event.title;
            labels[1].innerHTML = event.info;
            if(event.allDay){
                labels[2].innerHTML = "ja!";
            }else{
                labels[2].innerHTML = "nein!";
            }
            if(event.private){
                labels[3].innerHTML = "ja!";
            }else{
                labels[3].innerHTML = "nein!";
            }
            if(event.end!=null){
                labels[4].innerHTML = eventdata.start + " - " + eventdata.end;
            }else{
                labels[4].innerHTML = eventdata.start;
            }
            
        },
            
        _submitEntry = function(){
            document.getElementById('submitButton').type = "button";
            var input = middle.find(".message")[0];
            input.setCustomValidity('');
            if(document.getElementById('submitForm').checkValidity()){
                var today = Helper.today();
                if(renderdata.feature === "account"){
                    var text;
                    if(document.getElementById('an').value!=""){
                        text =  document.getElementById('rechnung').value + ": " + document.getElementById('von').value + " an " + document.getElementById('an').value + " " + document.getElementById('betrag').value + "€";
                    }else{
                        text =  document.getElementById('rechnung').value + ": " + document.getElementById('von').value + " " + document.getElementById('betrag').value + "€";
                    }
                    var entry = {"feature":renderdata.feature,
                            "user-img":renderdata.feature,
                            "input-text":text,
                            "user-name":username,
                            "date": today,
                            "done":false,
                            "notDone":true
                            };
                }else{
                var entry = {"feature":renderdata.feature,
                            "user-img":renderdata.feature,
                            "input-text":input.value,
                            "user-name":username,
                            "date": today,
                            "done":true,
                            "notDone":false
                            };
                }
                if(_.findWhere(renderdata.middle,{"input-text":entry["input-text"]})===undefined || renderdata.feature === "infoboard"){
                    $(Yourhome).trigger('middleContentAdded',{"feature":renderdata.feature,"entry":entry});
                }else{
                    input.setCustomValidity('Eintrag bereits vorhanden');
                    document.getElementById('submitButton').type = "submit";
                    setTimeout(function(){
                        input.blur();
                        input.focus();
                    }, 2000);
                }
            }else{
                document.getElementById('submitButton').type = "submit";
            }
        },
        
        _getContainer = function(element){
            var el = {"inputText":element["input-text"],
                      "inputUser":element["user-name"],
                      "inputDate":element["date"],
                      "imgSrc":element["user-img"],
                     },
                container,
                compiled = _.template($(templates[renderdata.feature + "Template"]).html());
            container = $(compiled(el));
            if(renderdata.feature == "stock" || renderdata.feature == "tasks" || renderdata.feature == "account"){
                var triang = container.find(".dreieck")[0];
                if(element.done){
                    triang.className = "dreieck";
                }else{
                    triang.className = "dreieck rot";
                }
                triang.addEventListener('click', function(){
                    $(triang).toggleClass('rot');
                    element.done = Helper.toggleTrue(element.done);
                    element.notDone = Helper.toggleTrue(element.notDone);
                    setTimeout(function(){
                        $(Yourhome).trigger('elementStateChange', element);
                    }, 200);
                });
            }
            return container;
        };

    that.init = init;


    return that;
})();