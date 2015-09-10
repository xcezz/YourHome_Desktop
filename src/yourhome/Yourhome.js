var Yourhome = {
    
    init: function (user, username) {
        console.log(user);
        Yourhome.Controller.init(user);
        Yourhome.View.init(username);
        Yourhome.Model.init();
    }
    
}