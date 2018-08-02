/*
 * Small component that handles Upvotes\Downvotes on a thing
 */
const YoutubeEmbedComponent = {
    template: `
            <div class="video-responsive" ng-style="{'height' : $ctrl.media.height}">
                <img ng-src="{{$ctrl.media.thumbnail_url}}" class="img-fluid card-img mx-auto" ng-click="$ctrl.playYoutube($event)" ng-if="!$ctrl.showYoutube" />
                <svg class="yt-button" version="1.1" viewBox="0 0 68 48" ng-if="!$ctrl.showYoutube" ng-click="$ctrl.playYoutube($event)">
                    <path class="ytp-large-play-button-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#212121" fill-opacity="0.8"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path>\
                </svg>
                <div ng-bind-html="$ctrl.video_embed" ng-if="$ctrl.showYoutube"></div>
            </div>
        `,
    bindings: {
        media: "<"
    },
    controller: function ($filter, $sce) {
        var $ctrl = this;
        $ctrl.showYoutube = false;

        $ctrl.playYoutube = function ($event) {
            $event.stopPropagation();

            //append auto play
            var html = $filter('htmldecode')($ctrl.media.html, true)
            var obj = angular.element(html);
            obj.attr('src', obj.attr('src') + "&autoplay=1");
            var newObj = angular.element('<div>').append(obj);

            $ctrl.video_embed = $sce.trustAsHtml(newObj.html());
            $ctrl.showYoutube = true;
        }
    }

}
