const SubredditComponent = {
    templateUrl: "/app/subreddit/subreddit.component.html",
    controller: function ($stateParams, api) {
        var $ctrl = this;
        $ctrl.name = $stateParams.name;
        $ctrl.listing = [];
        $ctrl.posts = [];
        $ctrl.about = null;
        $ctrl.rules = null;

        $ctrl.$onInit = function () {

            api.getSubreddit($stateParams.name).then(function (result) {
                $ctrl.listing = result.data.data;
                $ctrl.posts = result.data.data.children;
            });

            api.getSubredditAbout($stateParams.name).then(function (result) {
                $ctrl.about = result.data.data;
            });

            api.getSubredditRules($stateParams.name).then(function (result) {
                $ctrl.rules = result.data.rules;
            });

        };
    }
};