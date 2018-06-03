/*
    Service that will be a wrapper for all api calls
*/
const ApiService = function($http){

    const host = "https://www.reddit.com";

    //Helper function for get api requests
    function _get (url, parameters) {
        if (parameters === null || parameters === undefined)
            parameters = {};

        return $http.get(url, { params: parameters });
            // .finally(finFunc)
            // .catch(errorFunc);
    };

    this.getPost = function (subreddit, id) {
        return _get(host + "/r/" + subreddit + "/comments/" + id + ".json");
    };

    this.getSubreddit = function(subreddit){
        return _get(host + "/r/" + subreddit + ".json");
    };
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
    controller: function () {

    }
};
const SubredditCardviewComponent = {
    templateUrl: "/app/subreddit/subreddit-cardview.component.html",
    bindings: {
        post: '<'
    },
    controller: function () {
        $ctrl = this;

        this.$onInit = function () {
            $ctrl.post.liked = 0;
        };

        this.onLike = function (post) {
            if (post.liked === 0) {
                post.ups++;
                post.liked = 1;
            } else if (post.liked === 1) {
                post.ups--;
                post.liked = 0;
            }
        }
        this.onDisLike = function (post) {
            if (post.liked === 0) {
                post.ups--;
                post.liked = -1;
            } else if (post.liked === -1) {
                post.ups++;
                post.liked = 0;
            }
          
        }
    }
};
const SubredditPostComponent = {
    templateUrl: "/app/subreddit/subreddit-post.component.html",
    controller: function ($stateParams, api) {
        $ctrl = this;
        $ctrl.name = $stateParams.name;
        $ctrl.comments = [];
        let html = angular.element('html');

        this.$onInit = function () {
            html.addClass('freeze-scroll');
        };
        this.$onDestroy = function () {
            html.removeClass('freeze-scroll');
        };

        api.getPost($stateParams.name, $stateParams.id).then(function (result) {
            $ctrl.post = result.data[0].data.children[0].data;
            var cmts = [];

            result.data.splice(0, 1);
            angular.forEach(result.data, list => angular.forEach(list.data.children, comment => cmts.push(comment.data)));
            $ctrl.comments = cmts;
            console.log($ctrl.post);
        });
    }
};
const SubredditComponent = {
    templateUrl: "/app/subreddit/subreddit.component.html",
    controller: function ($stateParams, api) {
        $ctrl = this;
        $ctrl.name = $stateParams.name;
        $ctrl.listing = null;
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

    //Configure angular here
    app.config(function ($locationProvider, $urlRouterProvider, $stateProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state("subreddit", {
                url: "/r/{name}",
                component: "appSubreddit"
            })
            .state("subreddit.post", {
                url: "/{id}",
                component: "appSubredditPost"
            })
            //.state("comments", {
            //    url: "/r/{name}/comments/{id}",
            //    component: "appSubreddit"
            //})
            .state("home", {
                url: "/",
                component: 'appHome'
            })
            .state("about", {
                url: "/about",
                component: "appAbout"
            })

    });

})();