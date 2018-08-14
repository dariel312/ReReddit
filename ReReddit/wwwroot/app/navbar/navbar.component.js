const NavbarComponent = {
    templateUrl: "/app/navbar/navbar.component.html",
    controller: function ($rootScope, $state, $transitions, api) {
        var $ctrl = this;
        $ctrl.logged_in = api.isLoggedIn();
        $ctrl.subreddits = [];
        $ctrl.subredditName = null;
        $ctrl.user = null;
        $ctrl.current = "FrontPage";

        $ctrl.$onInit = function () {
            $rootScope.$on('auth-changed', function (event, args) {
                $ctrl.logged_in = api.isLoggedIn();
            });

            $transitions.onSuccess({}, function (transition) {
                var to = transition.to();
                var params = transition.params();

                if (to.name == 'subreddit') {
                    $ctrl.current = params.name;
                }
                else if (to.name == 'home') {
                    $ctrl.current = "Home";
                }
            });

            api.getSubreddits().then(function (response) {
                $ctrl.subreddits = response.data.data.children;
            });

            api.getMe().then(function (user) {
                $ctrl.user = user;
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

       
    }
};