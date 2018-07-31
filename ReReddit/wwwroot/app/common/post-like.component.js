/*
 * Small component that handles Upvotes\Downvotes on a thing
 */
const PostLikeComponent = {
    template: `
           <div class="d-flex flex-column justify-content-center">
                <button class="btn btn-icon btn-link" ng-click="$ctrl.onLike(1, $event)"><i class="material-icons">keyboard_arrow_up</i></button>
                <span class="text-center" ng-class="{'text-danger': $ctrl.liked === -1, 'text-primary': $ctrl.liked === 1}">{{$ctrl.ups | bignumber }}</span>
                <button class="btn btn-icon btn-link" ng-click="$ctrl.onLike(-1, $event)"><i class="material-icons">keyboard_arrow_down</i></button>
            </div>
        `,
    bindings: {
        ups: '<',
        name: '<'
    },
    controller: function (api) {
        var $ctrl = this;
        $ctrl.liked = 0;

        $ctrl.onLike = function (dir, $event) {
            $event.stopPropagation();

            //must be logged in
            if (!api.isLoggedIn()) {
                alert("Must be logged in to do that.");
                return;
            }

            if (dir === 1) {
                if ($ctrl.liked === 1) { //unlike
                    dir = 0;
                    $ctrl.ups--;
                }
                else if ($ctrl.liked === -1) { //dislike to like
                    $ctrl.ups += 2;
                } else { //neutral to like
                    $ctrl.ups += 1;
                }
            }
            else if (dir === -1) {
                if ($ctrl.liked === -1) { //undislike
                    dir = 0;
                    $ctrl.ups++;
                }
                else if ($ctrl.liked === 1) { //like to dislike
                    $ctrl.ups -= 2;
                } else { //neutral to dislike
                    $ctrl.ups -= 1;
                }
            }

            $ctrl.liked = dir;
            api.vote($ctrl.name, dir).then(
                function (response) {

                }, function (response) {
                    alert("You're doing that too much.");
                }
            );
        }

    }
}