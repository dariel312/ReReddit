const NavbarComponent = {
    templateUrl: "/app/navbar/navbar.component.html",
    controller: function ($rootScope, api) {
        var $ctrl = this;
        $ctrl.logged_in = api.isLoggedIn();

        $ctrl.onLogin = function () {
            api.redirectAuthUrl();
        };
        $ctrl.onLogout = function () {
            api.logOff();
        };
        $rootScope.$on('auth-changed', function (event, args) {
            $ctrl.logged_in = api.isLoggedIn();
            alert.log("auth changed from nav");
        });
    }
};