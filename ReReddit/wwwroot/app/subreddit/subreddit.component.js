const SubredditComponent = {
    templateUrl: "/app/subreddit/subreddit.component.html",
    controller: function ($stateParams, $window, api) {
        var $ctrl = this;
        $ctrl.name = $stateParams.name;
        $ctrl.listing = [];
        $ctrl.posts = [];
        $ctrl.placeholders = [{}, {}, {}, {}, {}];
        $ctrl.about = null;
        $ctrl.rules = null;


        $ctrl.next = function () {
            console.log($ctrl.listing);
            api.getSubredditPosts($stateParams.name, { before: $ctrl.listing.after, count: $ctrl.posts.length })
                .then(function (result)  {
                    $ctrl.listing = result.data.data;
                    result.data.data.children.forEach(function (item) {
                        $ctrl.posts.push(item);
                    });
                });
        }

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

                $window.document.title = "Re: " + $ctrl.about.title;
            });

            api.getSubredditRules($stateParams.name).then(function (result) {
                $ctrl.rules = result.data.rules;
            });

        };
    }
};