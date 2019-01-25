(function () {
    'use strict';
    var app = angular.module('app', ['ngAnimate', 'ngSanitize', 'ui.router', 'angularMoment']);

    //Declare all angular components/services/factories/filters here
    app.service('api', ApiService);
    app.service('reddit', RedditService);
    app.component('appNavbar', NavbarComponent);
    app.component('appHome', HomeComponent);
    app.component('appSubreddit', SubredditComponent);
    app.component('appSubredditPost', SubredditPostComponent);
    app.component('appSubredditCardview', SubredditCardviewComponent);
    app.component('appSubredditListview', SubredditListviewComponent);
    app.component('appSubredditComment', SubredditCommentComponent);
    app.component('appSubredditSidebar', SubredditSidebarComponent);
    app.component('appAuth', AuthComponent);
    app.component('postLike', PostLikeComponent);
    app.component('postMedia', PostMediaComponent);
    app.component('postThumbnail', PostThumbnailComponent);
    app.component('defaultIcon', DefaultIconComponent);
    app.component('youtubeEmbed', YoutubeEmbedComponent);
    app.filter('bignumber', BigNumberFilter);
    app.filter('htmldecode', HtmlDecodeFilter);
    app.filter('markdown', MarkDownFilter);

    //Configure angular here
    app.config(function ($locationProvider, $urlRouterProvider, $stateProvider, $httpProvider, $rootScopeProvider) {
        $locationProvider.html5Mode(true);
        $rootScopeProvider.digestTtl(15);
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state("subreddit", {
                url: "/r/{name}",
                component: "appSubreddit",
                params: {
                    name: null
                }
            })
            .state("subreddit.post", {
                url: "/{id}",
                component: "appSubredditPost",
                params: {
                    post: null,
                    id: null,
                    subreddit: null
                }
            })
            .state("home", {
                url: "/",
                component: 'appSubreddit',
                params: {
                    name: null
                }
            })
            .state("home.post", {
                url: "r/{subreddit}/{id}",
                component: 'appSubredditPost',
                params: {
                    post: null,
                    id: null,
                    subreddit: null
                }
            })
            .state("auth", {
                url: "/auth",
                component: 'appAuth'
            })


        //For api auth
        $httpProvider.interceptors.push(ApiInterceptor);
    });

})();
