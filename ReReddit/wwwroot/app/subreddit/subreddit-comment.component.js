const SubredditCommentComponent = {
    templateUrl: "/app/subreddit/subreddit-comment.component.html",
    bindings: {
        comment: '<',
        depth: '<',
        link: '<'
    },
    controller: function (reddit) {
        var $ctrl = this;
        $ctrl.isCollapsed = false;

        $ctrl.clickMore = function (c) {
            console.log(c);

            reddit.Api.getMoreChildren($ctrl.link, c.data.children).then(
                function (response) {
                    console.log(response);
                });
        }

        $ctrl.collapse = function ($event) {
            if ($event.offsetX < 4) {
                $event.stopPropagation();
                $ctrl.isCollapsed = !$ctrl.isCollapsed;
            }
        }
    }
};