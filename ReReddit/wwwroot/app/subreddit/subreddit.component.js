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