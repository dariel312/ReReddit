const SubredditCommentComponent = {
    templateUrl: "/app/subreddit/subreddit-comment.component.html",
    bindings: {
        comment: '<',
        depth: '<',
        link: '<'
    },
    controller: function (reddit, $element, $timeout) {
        var $ctrl = this;
        $ctrl.isCollapsed = false;
        $ctrl.showReply = false;
        $ctrl.height = 0;
        let child = null;

        $ctrl.$onInit = function () {

            child = $element.find('div.comment-collapse-fade');
        };


        $ctrl.clickMore = function (c) {
            console.log(c);
           
            reddit.Api.getMoreChildren($ctrl.link, c.data.children).then(
                function (response) {
                    console.log(response);
                });
        };

        $ctrl.collapse = function ($event) {
            if ($event.offsetX < 4) {
                $event.stopPropagation();
                $ctrl.isCollapsed = !$ctrl.isCollapsed;


                if ($ctrl.isCollapsed) {
                    $ctrl.height = child.height() + "px";
                    child.css('height', $ctrl.height);

                    $timeout(function () {
                        child.css('height', '0px');
                    });
                } else {
                    child.css('height', '');
                }

            }

        };

        $ctrl.openReply = function () {
            if (!reddit.Api.isLoggedIn())
                alert("Must be logged in to do that.");

            $ctrl.showReply = true;
        };
    }
};