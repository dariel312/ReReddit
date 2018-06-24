const SubredditCardviewComponent = {
    templateUrl: "/app/subreddit/subreddit-cardview.component.html",
    bindings: {
        post: '<'
    },
    controller: function (api) {
        var $ctrl = this;

        $ctrl.$onInit = function () {
            $ctrl.post.liked = 0;
        };

        $ctrl.onLike = function (post, $event) {
            $event.stopPropagation();
            if (post.liked === 0) {
                post.ups++;
                post.liked = 1;
                api.vote(post.name, 1);
            } else if (post.liked === 1) {
                post.ups--;
                post.liked = 0;
            }
        }

        $ctrl.onDisLike = function (post, $event) {
            $event.stopPropagation();

            if (post.liked === 0) {
                post.ups--;
                post.liked = -1;
                api.vote(post.name, -1);
            } else if (post.liked === -1) {
                post.ups++;
                post.liked = 0;
            }
          
        }

        $ctrl.click = function (post) {
            alert("clicked");
        };
    }
};