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
