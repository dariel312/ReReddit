var ApiInterceptor = function ($q, $window, $injector) {
    return {
        /*Must use $injector otherwise you'll get cirucular dependency*/
        'request': function (config) {
            var api = $injector.get('api');
            var url = config.url.split('/');

            if (api.isLoggedIn() && (url[1] == 'api' || url[0] == 'api')) {
                config.headers.Authorization = "Bearer " + api.getAuthToken();
            }
            return config;
        },

        //Returns to login if unathorized
        'responseError': function (rejection) {
            if (rejection.status === 401) {
                var api = $injector.get('api');
                api.logOff();
            }
            else return $q.reject(rejection);
        }
    };
}
/*
    Service that will be a wrapper for all api calls
*/
const ApiService = function ($http, $window, $rootScope, $httpParamSerializer) {
    const self = this;
    const host = "https://www.reddit.com";
    const oAuth = "https://oauth.reddit.com";
    const client_id = "TDmT_7LQ_5LkmQ";
    const client_secret = "";
    const redirect_uri = "http://localhost:55840/auth";
    const api_scope = "identity, edit, flair, history, modconfig, modflair, modlog, modposts, modwiki, mysubreddits, privatemessages, read, report, save, submit, subscribe, vote, wikiedit, wikiread";
    const token_key = "auth_token";
    var auth_info = null;

    //load stored data
    auth_info = JSON.parse($window.localStorage.getItem(token_key));

    //Helper function for get api requests
    function _get(url, parameters) {
        if (parameters === null || parameters === undefined)
            parameters = {};

        return $http.get(url, { params: parameters });
        // .finally(finFunc)
        // .catch(errorFunc);
    };

    function _post(url, data) {
        if (data === null || data === undefined)
            data = {};

        return $http.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    };

    function onAuthChanged() {
        $rootScope.$broadcast('auth-changed');
    }

    //Subreddit
    this.getPost = function (subreddit, id) {
        return _get(host + "/r/" + subreddit + "/comments/" + id + ".json");
    };

    this.getSubreddit = function (subreddit) {
        if (subreddit == null)
            return _get(host + "/.json");
        else
            return _get(host + "/r/" + subreddit + ".json");
    };

    this.vote = function (id, dir) {
        return _post("/api/vote", $httpParamSerializer({ 'id': '"' + id + '"', 'dir': '"' + dir + '"' }));
    };



    //Auth
    this.redirectAuthUrl = function () {
        $window.location.href = 'https://www.reddit.com/api/v1/authorize?client_id=' + client_id + '&response_type=token&state=12345&redirect_uri=' + redirect_uri + '&scope=' + api_scope;
    };

    this.setAuth = function (response) {
        response.expires_at = moment().add(response.expires_in, "seconds");
        $window.localStorage.setItem(token_key, JSON.stringify(response));
        onAuthChanged();
    };

    this.logOff = function () {
        if (self.isLoggedIn) {
            $window.localStorage.removeItem(token_key);
            onAuthChanged();
        }
    };

    this.getAuthToken = function () {
        if (auth_info == null)
            return null;

        return auth_info.access_token;
    }
    this.isLoggedIn = function (response) {
        if (auth_info == null) {
            return false;
        }

        if (!moment(auth_info.expires_at).isAfter(moment()))
            return false;

        return true;
    };

};
/*This component is used just to take in the Redirect OAuth from reddit.*/
const AuthComponent = {
    template: "",
    controller: function ($stateParams, $window, $state, api) {
        $ctrl = this;

        function getHashParams() {
            //Since reddit puts the necesary info in th URL as a fragment #
            var hashParams = {};
            var e,
                a = /\+/g,  // Regex for replacing addition symbol with a space
                r = /([^&;=]+)=?([^&;]*)/g,
                d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                q = $window.location.hash.substring(1);

            while (e = r.exec(q))
                hashParams[d(e[1])] = d(e[2]);

            return hashParams;
        }
        var c = getHashParams();

        if (c.access_token !== undefined)
            api.setAuth(c);

        $state.go('home');
    }
};
const FooterComponent = {
    templateUrl: "/app/footer/footer.component.html",
    controller: function () {

    }
};
const HomeComponent = {
    templateUrl: "/app/home/home.component.html",
    controller: function () {

    }
};
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
const SubredditCardviewComponent = {
    templateUrl: "/app/subreddit/subreddit-cardview.component.html",
    bindings: {
        post: '<'
    },
    controller: function (api) {
        var $ctrl = this;

        $ctrl.$onInit = function () {
            $ctrl.post.liked = 0;
        };

        $ctrl.onLike = function (post, $event) {
            $event.stopPropagation();
            if (post.liked === 0) {
                post.ups++;
                post.liked = 1;
                api.vote(post.name, 1);
            } else if (post.liked === 1) {
                post.ups--;
                post.liked = 0;
            }
        }

        $ctrl.onDisLike = function (post, $event) {
            $event.stopPropagation();

            if (post.liked === 0) {
                post.ups--;
                post.liked = -1;
                api.vote(post.name, -1);
            } else if (post.liked === -1) {
                post.ups++;
                post.liked = 0;
            }
          
        }

        $ctrl.click = function (post) {
            alert("clicked");
        };
    }
};
const SubredditCommentComponent = {
    templateUrl: "/app/subreddit/subreddit-comment.component.html",
    bindings: {
        comment: '='
    },
    controller: function  (api) {
        var $ctrl = this;


    }
};
const SubredditPostComponent = {
    templateUrl: "/app/subreddit/subreddit-post.component.html",
    controller: function ($stateParams, $state, $sce, api) {
        var $ctrl = this;
        $ctrl.name = $stateParams.name;
        $ctrl.comments = [];
        $ctrl.post = $stateParams.post;

        let html = angular.element('html');

        this.$onInit = function () {
            html.addClass('freeze-scroll');
        };
        this.$onDestroy = function () {
            html.removeClass('freeze-scroll');
        };

        if ($stateParams.name == null)
            $state.go('^');

        api.getPost($stateParams.name, $stateParams.id).then(function (result) {

            if ($ctrl.post == null)
                $ctrl.post = result.data[0].data.children[0].data;

            var cmts = [];
            result.data.splice(0, 1);

            angular.forEach(result.data, list =>
                angular.forEach(list.data.children, comment =>
                    cmts.push(comment.data)));

            $ctrl.comments = cmts;
        }, function (result) {
            $state.go('^')
        });
    }
};
const SubredditComponent = {
    templateUrl: "/app/subreddit/subreddit.component.html",
    controller: function ($stateParams, api) {
        var $ctrl = this;
        $ctrl.name = $stateParams.name;
        $ctrl.listing = [];
        $ctrl.posts = [];

        api.getSubreddit($stateParams.name).then(function (result) {
            $ctrl.listing = result.data.data;
            $ctrl.posts = result.data.data.children;
        });
    }
};
(function () {
    'use strict';
    var app = angular.module('app', ['ngAnimate', 'ngSanitize', 'ui.router', 'angularMoment']);

    //Declare all angular components/services/factories/filters here
    app.service('api', ApiService);
    app.component('appNavbar', NavbarComponent);
    app.component('appFooter', FooterComponent);
    app.component('appHome', HomeComponent);
    app.component('appSubreddit', SubredditComponent);
    app.component('appSubredditPost', SubredditPostComponent);
    app.component('appSubredditCardview', SubredditCardviewComponent);
    app.component('appSubredditComment', SubredditCommentComponent);
    app.component('appAuth', AuthComponent);


    //Configure angular here
    app.config(function ($locationProvider, $urlRouterProvider, $stateProvider, $httpProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state("subreddit", {
                url: "/r/{name}",
                component: "appSubreddit"
            })
            .state("subreddit.post", {
                url: "/{id}",
                component: "appSubredditPost",
                params: {
                    post: null,
                    id: null
                }
            })
            .state("home", {
                url: "/",
                component: 'appSubreddit',
                params: {
                    name: null
                }
            })
            .state("auth", {
                url: "/auth",
                component: 'appAuth'
            })


        //For api auth
        $httpProvider.interceptors.push(ApiInterceptor);
    });

})();