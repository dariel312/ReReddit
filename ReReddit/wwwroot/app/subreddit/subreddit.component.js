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