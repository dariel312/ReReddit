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
                component: "appSubredditPost",
                params: {
                    post: null
                }
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
