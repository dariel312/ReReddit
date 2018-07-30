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

        $ctrl.onLike = function (dir, $event) {
            $event.stopPropagation();
            var post = $ctrl.post;

            if (dir === 1) {
                if (post.liked === 1) { //unlike
                    dir = 0;
                    post.ups--;
                }
                else if (post.liked === -1) { //dislike to like
                    post.ups += 2;
                } else { //neutral to like
                    post.ups += 1;
                }
            }
            else if (dir === -1) {
                if (post.liked === -1) { //undislike
                    dir = 0;
                    post.ups++;
                }
                else if (post.liked === 1) { //like to dislike
                    post.ups -= 2;
                } else { //neutral to dislike
                    post.ups -= 1;
                }
            }

            post.liked = dir;
            api.vote(post.name, dir).then(
                function (response) {

                }, function (response) {
                    alert("You're doing that too much.");
                }
            );
        }

    }
};