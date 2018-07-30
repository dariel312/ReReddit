const SubredditCommentComponent = {
    templateUrl: "/app/subreddit/subreddit-comment.component.html",
    bindings: {
        comment: '<',
        depth: '<'
    },
    controller: function  (api) {
        var $ctrl = this;

        $ctrl.$onInit = function () {
        }
        var decoded = angular.element('<textarea />').html($ctrl.comment).text();
        $ctrl.comment = decoded;


    }
};