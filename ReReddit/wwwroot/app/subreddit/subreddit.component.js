﻿const SubredditComponent = {
    templateUrl: "/app/subreddit/subreddit.component.html",
    controller: function ($stateParams, $window, api) {
        var $ctrl = this;
        $ctrl.name = $stateParams.name;
        $ctrl.listing = [];
        $ctrl.posts = [];
        $ctrl.placeholders = [{}, {}, {}, {}, {}];
        $ctrl.about = null;
        $ctrl.rules = null;
        $ctrl.view = 'card';

        $ctrl.next = function () {
            api.getSubredditPosts($stateParams.name, { before: $ctrl.listing.after, count: $ctrl.posts.length })
                .then(function (result) {
                    $ctrl.listing = result.data.data;
                    result.data.data.children.forEach(function (item) {
                        $ctrl.posts.push(item);
                    });
                });
        };

        $ctrl.setView = function (type) {
            $ctrl.view = type;
        };

        $ctrl.$onInit = function () {
            //reset scroll
            angular.element(window).scrollTop(0);

            //download data
            api.getSubredditPosts($stateParams.name).then(function (result) {
                $ctrl.listing = result.data.data;
                $ctrl.posts = result.data.data.children;
                $ctrl.placeholders = [];
            });

            api.getSubredditAbout($stateParams.name).then(function (result) {
                $ctrl.about = result.data.data;

                var html = document.getElementsByTagName('html')[0];
                html.style.setProperty("--subreddit-primary-color", $ctrl.about.primary_color);
                html.style.setProperty("--subreddit-key-color", $ctrl.about.key_color);

                $window.document.title = "Re: " + $ctrl.about.title;
            });

            api.getSubredditRules($stateParams.name).then(function (result) {
                $ctrl.rules = result.data.rules;
            });

        };
    }
};