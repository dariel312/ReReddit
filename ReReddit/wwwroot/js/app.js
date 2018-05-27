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