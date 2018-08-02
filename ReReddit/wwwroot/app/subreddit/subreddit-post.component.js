const SubredditPostComponent = {
    templateUrl: "/app/subreddit/subreddit-post.component.html",
    controller: function ($stateParams, $state, api) {
        var $ctrl = this;
        $ctrl.name = $stateParams.subreddit;
        $ctrl.comments = [];
        $ctrl.post = $stateParams.post;

        let html = angular.element('html');
        let onEscHandler = function (e) {
            if (e.keyCode == 27) {
                $state.go('^')
            }
        };

        this.$onInit = function () {
            html.addClass('freeze-scroll');
            angular.element(document).keyup(onEscHandler);


            if ($stateParams.subreddit == null)
                $ctrl.name = $stateParams.name;

            if ($ctrl.name == null)
                $state.go('^');


            api.getPost($ctrl.name, $stateParams.id).then(function (result) {

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

        };

        this.$onDestroy = function () {
            html.removeClass('freeze-scroll');
            angular.element(document).unbind('keyup', onEscHandler);
        };



    }
};