const NavbarComponent = {
    templateUrl: "/app/navbar/navbar.component.html",
    controller: function ($rootScope, api) {
        var $ctrl = this;
        $ctrl.logged_in = api.isLoggedIn();

        $ctrl.onLogin = function () {
            console.log("poop");
            api.redirectAuthUrl();
        };

        $rootScope.$on('auth-changed', function (event, args) {
            alert("OMG AUTH CHANGED FROM NAVBAR");
        });
    }
};