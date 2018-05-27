(function () {
    'use strict';
    var app = angular.module('app', ['ngAnimate', 'ngSanitize', 'ui.router']);

    //Declare all angular components/services/factories/filters here
    app.service('api', ApiService);
    app.component('appNavbar', NavbarComponent);
    app.component('appFooter', FooterComponent);
    app.component('appHome', HomeComponent);
    app.component('appSubreddit', SubredditComponent);
    
    //Configure angular here
    app.config(function ($locationProvider, $urlRouterProvider, $stateProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');

        $stateProvider
        .state("subreddit", {
            url: "/r/{name}",
            component: "appSubreddit"
        })
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
