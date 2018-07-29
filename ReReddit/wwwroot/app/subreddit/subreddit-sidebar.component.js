const SubredditSidebarComponent = {
    templateUrl: "/app/subreddit/subreddit-sidebar.component.html",
    bindings: {
        subreddit: '<'
    },
    controller: function ($state, api) {
        var $ctrl = this;
        $ctrl.s = null;

        this.$onInit = function () {
            api.getSidebar($ctrl.subreddit).then(function (response) {
                $ctrl.s = response.data.data;

                var decoded = angular.element('<textarea />').html($ctrl.s.description_html).text();
                $ctrl.s.description_html = decoded;

            });
        };
        this.$onDestroy = function () {

        };


    }
};