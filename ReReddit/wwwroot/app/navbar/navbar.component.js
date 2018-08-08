const NavbarComponent = {
    templateUrl: "/app/navbar/navbar.component.html",
    controller: function ($rootScope, $state, api) {
        var $ctrl = this;
        $ctrl.logged_in = api.isLoggedIn();
        $ctrl.subreddits = [];
        $ctrl.subredditName = null;

        $ctrl.$onInit = function () {
            api.getSubreddits().then(function (response) {
                $ctrl.subreddits = response.data.data.children;
            });
        }

        $ctrl.onLogin = function () {
            api.redirectAuthUrl();
        };

        $ctrl.onLogout = function () {
            api.logOff();
        };

        $ctrl.submit = function () {
            $state.go("subreddit", { name: $ctrl.subredditName })
            $ctrl.subredditName = null;
        }

        $rootScope.$on('auth-changed', function (event, args) {
            $ctrl.logged_in = api.isLoggedIn();
            alert.log("auth changed from nav");
        });
    }
};