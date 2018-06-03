const SubredditCardviewComponent = {
    templateUrl: "/app/subreddit/subreddit-cardview.component.html",
    bindings: {
        post: '<'
    },
    controller: function () {
        $ctrl = this;

        this.$onInit = function () {
            $ctrl.post.liked = 0;
        };

        this.onLike = function (post) {
            if (post.liked === 0) {
                post.ups++;
                post.liked = 1;
            } else if (post.liked === 1) {
                post.ups--;
                post.liked = 0;
            }
        }
        this.onDisLike = function (post) {
            if (post.liked === 0) {
                post.ups--;
                post.liked = -1;
            } else if (post.liked === -1) {
                post.ups++;
                post.liked = 0;
            }
          
        }
    }
};