﻿const SubredditSidebarComponent = {
    templateUrl: "/app/subreddit/subreddit-sidebar.component.html",
    bindings: {
        about: '<',
        rules: '<'
    },
    controller: function () {
        var $ctrl = this;

        $ctrl.toggleRule = function (n) {
            n.show = !n.show;
        }
    }
};