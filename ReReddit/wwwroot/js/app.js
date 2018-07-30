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
const ApiService = function ($http, $window, $rootScope, $httpParamSerializer, $state) {
    const self = this;
    const host = "https://www.reddit.com";
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

        if (this.isLoggedIn()) {
            if (subreddit == null)
                return _get("api/hot");
            else
                return _get("api/r/" + subreddit);
        }
        else {
            if (subreddit == null)
                return _get(host + "/.json");
            else
                return _get(host + "/r/" + subreddit + ".json");
        }
    };

    this.vote = function (id, dir) {
        return _post("/api/api/vote", $httpParamSerializer({ 'id': id, 'dir': dir }));
    };

    this.getSubredditAbout = function (subreddit) {
        if (this.isLoggedIn()) {
            return _get("api/r/" + subreddit + "/about");
        }
        else {
            return _get(host + "/r/" + subreddit + "/about.json");
        }
    }

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
            $state.go("home");
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
const BigNumberFilter = function () {
    return function (number) {

        //if (number != undefined)
        //    console.log(number);

        abs = Math.abs(number)

        if (abs >= Math.pow(10, 12))// trillion
            number = (number / Math.pow(10, 12)).toFixed(1) + "t";
        else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) // billion
            number = (number / Math.pow(10, 9)).toFixed(1) + "b";
        else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) // million
            number = (number / Math.pow(10, 6)).toFixed(1) + "m";
        else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3))// thousand
            number = (number / Math.pow(10, 3)).toFixed(1) + "k";
        return number;
    };
};
const HtmlDecodeFilter = function () {
    return function (html) {

        var decoded = angular.element('<textarea />').html(html).text();

        return decoded;
    };
};
/*
 * Small component that handles Upvotes\Downvotes on a thing
 */
const PostLikeComponent = {
    template: `
           <div class="d-flex flex-column justify-content-center">
                <button class="btn btn-icon btn-link" ng-click="$ctrl.onLike(1, $event)"><i class="material-icons">keyboard_arrow_up</i></button>
                <span class="text-center" ng-class="{'text-danger': $ctrl.liked === -1, 'text-primary': $ctrl.liked === 1}">{{$ctrl.ups | bignumber }}</span>
                <button class="btn btn-icon btn-link" ng-click="$ctrl.onLike(-1, $event)"><i class="material-icons">keyboard_arrow_down</i></button>
            </div>
        `,
    bindings: {
        ups: '<',
        name: '<'
    },
    controller: function (api) {
        var $ctrl = this;
        $ctrl.liked = 0;

        $ctrl.onLike = function (dir, $event) {
            $event.stopPropagation();

            if (dir === 1) {
                if ($ctrl.liked === 1) { //unlike
                    dir = 0;
                    $ctrl.ups--;
                }
                else if ($ctrl.liked === -1) { //dislike to like
                    $ctrl.ups += 2;
                } else { //neutral to like
                    $ctrl.ups += 1;
                }
            }
            else if (dir === -1) {
                if ($ctrl.liked === -1) { //undislike
                    dir = 0;
                    $ctrl.ups++;
                }
                else if ($ctrl.liked === 1) { //like to dislike
                    $ctrl.ups -= 2;
                } else { //neutral to dislike
                    $ctrl.ups -= 1;
                }
            }

            $ctrl.liked = dir;
            api.vote($ctrl.name, dir).then(
                function (response) {

                }, function (response) {
                    alert("You're doing that too much.");
                }
            );
        }

    }
}
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

        $ctrl.onLike = function (dir, $event) {
            $event.stopPropagation();
            var post = $ctrl.post;

            if (dir === 1) {
                if (post.liked === 1) { //unlike
                    dir = 0;
                    post.ups--;
                }
                else if (post.liked === -1) { //dislike to like
                    post.ups += 2;
                } else { //neutral to like
                    post.ups += 1;
                }
            }
            else if (dir === -1) {
                if (post.liked === -1) { //undislike
                    dir = 0;
                    post.ups++;
                }
                else if (post.liked === 1) { //like to dislike
                    post.ups -= 2;
                } else { //neutral to dislike
                    post.ups -= 1;
                }
            }

            post.liked = dir;
            api.vote(post.name, dir).then(
                function (response) {

                }, function (response) {
                    alert("You're doing that too much.");
                }
            );
        }

    }
};
const SubredditCommentComponent = {
    templateUrl: "/app/subreddit/subreddit-comment.component.html",
    bindings: {
        comment: '<',
        depth: '<'
    },
    controller: function  () {
        var $ctrl = this;

    }
};
const SubredditPostComponent = {
    templateUrl: "/app/subreddit/subreddit-post.component.html",
    controller: function ($stateParams, $state, api) {
        var $ctrl = this;
        $ctrl.name = $stateParams.subreddit;
        $ctrl.comments = [];
        $ctrl.post = $stateParams.post;

        let html = angular.element('html');

        this.$onInit = function () {
            html.addClass('freeze-scroll');

            if ($stateParams.subreddit == null)
                $ctrl.name = $stateParams.name;

            if ($ctrl.name == null)
                $state.go('^');


            api.getPost($ctrl.name, $stateParams.id).then(function (result) {

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

        };
        this.$onDestroy = function () {
            html.removeClass('freeze-scroll');
        };



    }
};
const SubredditSidebarComponent = {
    templateUrl: "/app/subreddit/subreddit-sidebar.component.html",
    bindings: {
        about: '<'
    },
    controller: function () {
        var $ctrl = this;
         
    }
};
const SubredditComponent = {
    templateUrl: "/app/subreddit/subreddit.component.html",
    controller: function ($stateParams, api) {
        var $ctrl = this;
        $ctrl.name = $stateParams.name;
        $ctrl.listing = [];
        $ctrl.posts = [];
        $ctrl.about = null;

        $ctrl.$onInit = function () {

            api.getSubreddit($stateParams.name).then(function (result) {
                $ctrl.listing = result.data.data;
                $ctrl.posts = result.data.data.children;
            });

            api.getSubredditAbout($stateParams.name).then(function (result) {
                $ctrl.about = result.data.data;
            });


        };
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
    app.component('appSubredditSidebar', SubredditSidebarComponent);
    app.component('appAuth', AuthComponent);
    app.component('postLike', PostLikeComponent);
    app.filter('bignumber', BigNumberFilter);
    app.filter('htmldecode', HtmlDecodeFilter);

    //Configure angular here
    app.config(function ($locationProvider, $urlRouterProvider, $stateProvider, $httpProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state("subreddit", {
                url: "/r/{name}",
                component: "appSubreddit",
                params: {
                    name: null
                }
            })
            .state("subreddit.post", {
                url: "/{id}",
                component: "appSubredditPost",
                params: {
                    post: null,
                    id: null,
                    subreddit: null
                }
            })
            .state("home", {
                url: "/",
                component: 'appSubreddit',
                params: {
                    name: null
                }
            })
            .state("home.post", {
                url: "r/{subreddit}/{id}",
                component: 'appSubredditPost',
                params: {
                    post: null,
                    id: null,
                    subreddit: null
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