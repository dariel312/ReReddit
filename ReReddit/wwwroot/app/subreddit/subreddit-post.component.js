const SubredditPostComponent = {
    templateUrl: "/app/subreddit/subreddit-post.component.html",
    controller: function ($stateParams, $state, $sce, api) {
        var $ctrl = this;
        $ctrl.name = $stateParams.name;
        $ctrl.comments = [];
        $ctrl.post = $stateParams.post;

        let html = angular.element('html');

        this.$onInit = function () {
            html.addClass('freeze-scroll');
        };
        this.$onDestroy = function () {
            html.removeClass('freeze-scroll');
        };

        if ($stateParams.name == null)
            $state.go('^');

        api.getPost($stateParams.name, $stateParams.id).then(function (result) {

            if ($ctrl.post == null)
                $ctrl.post = result.data[0].data.children[0].data;

            var cmts = [];
            result.data.splice(0, 1);

            angular.forEach(result.data, list =>
                angular.forEach(list.data.children, comment =>
                    cmts.push(comment.data)));

            $ctrl.comments = cmts;
        }, function (result) {
            $state.go('^')
        });
    }
};