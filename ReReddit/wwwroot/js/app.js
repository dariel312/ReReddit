var ApiInterceptor = function ($q, $window, $injector) {
    return {
        /*Must use $injector otherwise you'll get cirucular dependency*/
        'request': function (config) {
            var api = $injector.get('api');
            var url = config.url.split('/');

            if (api.isLoggedIn() && (url[1] == 'api' || url[0] == 'api')) {
                config.headers.Authorization = "Bearer " + api.getAuthToken();
            }

            return config;
        },

        //Returns to login if unathorized
        'responseError': function (rejection) {
            if (rejection.status === 401) {
                var api = $injector.get('api');
                api.logOff();
            }
            else return $q.reject(rejection);
        }
    };
}
/*
 *  Service that will be a wrapper for all api calls
*/
const ApiService = function ($http, $window, $rootScope, $httpParamSerializer, $sce, $state, $q, $timeout) {
    const self = this;
    const host = "https://www.reddit.com";
    let client_id = "t1woxVATacs9Wg";
    let client_secret = "";
    let redirect_uri = "http://localhost:55840/auth";
    const api_scope = "identity, edit, flair, history, modconfig, modflair, modlog, modposts, modwiki, mysubreddits, privatemessages, read, report, save, submit, subscribe, vote, wikiedit, wikiread";
    const token_key = "auth_token";
    var auth_info = null;
    var identity = null;
    

    if (ENVIRONMENT == "PROD") {
        client_id = "TDmT_7LQ_5LkmQ";
        client_secret = "";
        redirect_uri = "http://rereddit.dariel.io/auth";
    }

    //load stored data
    auth_info = JSON.parse($window.localStorage.getItem(token_key));

    //Helper function for get api requests
    function _get(url, parameters) {
        if (parameters === null || parameters === undefined)
            parameters = {};

        return $http.get(url, { params: parameters });
    };

    function _getP(url, parameters) {
        if (parameters === null || parameters === undefined)
            parameters = {};

        parameters.jsonpCallbackParam = 'callback';

        return $http.jsonp(url, parameters);
    }

    function _post(url, data) {
        if (data === null || data === undefined)
            data = {};

        return $http.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    };

    function onAuthChanged() {
        $timeout(function () {
            $rootScope.$broadcast('auth-changed');
            console.log("AUTH CHANGE BOOM");
        });
    }

    //Subreddit
    this.getPost = function (subreddit, id) {
        return _get(host + "/r/" + subreddit + "/comments/" + id + ".json");
    };

    this.getSubredditPosts = function (subreddit, params, sort) {
        if (sort === undefined || sort === null) {
            sort = 'hot'; //default for subreddit
        }
        if (this.isLoggedIn()) {
            if (subreddit === null)
                return _get("api/" + sort, params);
            else
                return _get("api/r/" + subreddit + "/" + sort, params);
        }
        else {
            if (subreddit === null)
                return _get(host + "/" + sort + "/.json", params);
            else
                return _get(host + "/r/" + subreddit + "/" + sort + ".json", params);
        }
    };

    this.vote = function (id, dir) {
        return _post("/api/api/vote", $httpParamSerializer({ 'id': id, 'dir': dir }));
    };

    this.getSubredditAbout = function (subreddit) {
        if (this.isLoggedIn()) {
            return _get("api/r/" + subreddit + "/about");
        }
        else {
            return _get(host + "/r/" + subreddit + "/about.json");
        }
    }

    this.getSubredditRules = function (subreddit) {
        if (this.isLoggedIn()) {
            return _get("api/r/" + subreddit + "/about/rules");
        }
        else {
            return _get(host + "/r/" + subreddit + "/about/rules.json");
        }
    };

    this.getSubreddits = function () {
        if (this.isLoggedIn()) {
            return _get("api/subreddits/mine/subscriber");
        }
        else {
            return _get(host + "/subreddits/popular.json");
        }
    };


    this.getMoreChildren = function (link_name, link_id, children, sort) {
        if (sort === undefined) {
            sort = 'best';
        }

        //authenticated
        if (this.isLoggedIn()) {
            return _get("api/morechildren", {
                link: link_name,
                children: children.join(),
                sort: sort,
                limit_children: false
            });
        }
        else {
            //unauthenticated
            return _get(host + "/comments/" + link_id + "/api/morechildren.json", {
                link: link_name,
                children: children.join(),
                sort: sort,
                limit_children: false
            });
        }
    };

    //users
    this.getUser = function (name) {
        //JSONP req requires this
        var urlPath = host + "/u/" + name + "/about.json?jsonp=callback";
        var tUrl = $sce.trustAsResourceUrl(urlPath);

        return _getP(tUrl);
    }

    //Auth
    this.redirectAuthUrl = function () {
        $window.location.href = 'https://www.reddit.com/api/v1/authorize?client_id=' + client_id + '&response_type=token&state=12345&redirect_uri=' + redirect_uri + '&scope=' + api_scope;
    };

    this.setAuth = function (response) {
        response.expires_at = moment().add(response.expires_in, "seconds");
        $window.localStorage.setItem(token_key, JSON.stringify(response));
        auth_info = response;
        onAuthChanged();
    };

    this.logOff = function () {
        if (self.isLoggedIn) {
            $window.localStorage.removeItem(token_key);
            auth_info = null;
            onAuthChanged();
            $state.go("home");
        }
    };

    this.getAuthToken = function () {
        if (auth_info == null)
            return null;

        return auth_info.access_token;
    }
    this.isLoggedIn = function (response) {
        if (auth_info == null) {
            return false;
        }

        if (!moment(auth_info.expires_at).isAfter(moment()))
            return false;

        return true;
    };
    this.getMe = function () {
        //user data is cached
        var deferred = $q.defer();

        if (identity != null) {

            $timeout(function () {
                deferred.resolve(identity);
            });

        } else {
            _get("/api/api/v1/me").then(function (response) {
                identity = response.data;
                deferred.resolve(identity);
                return response;
            }, function (response) {

                deferred.reject(response);
                return response;
            });
        }

        //RETURNS USER DATA NOT HTTP RESPONSE       
        return deferred.promise;
    }

};
/*
    API For All Reddit, includes config, constants and enumerations
*/
const RedditService = function (api) {
    this.PAGE_TITLE = "Re:Reddit";
    this.Api = api;

    this.SORT_SUBREDDIT = [
        'hot', 'new', 'top', 'controversial', 'rising'
    ];
    this.SORT_FRONTPAGE = [
        'best', 'hot', 'new', 'top', 'controversial', 'rising'
    ];
};
/*This component is used just to take in the Redirect OAuth from reddit.*/
const AuthComponent = {
    template: "",
    controller: function ($stateParams, $window, $state, api) {
        $ctrl = this;

        function getHashParams() {
            //Since reddit puts the necesary info in th URL as a fragment #
            var hashParams = {};
            var e,
                a = /\+/g,  // Regex for replacing addition symbol with a space
                r = /([^&;=]+)=?([^&;]*)/g,
                d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                q = $window.location.hash.substring(1);

            while (e = r.exec(q))
                hashParams[d(e[1])] = d(e[2]);

            return hashParams;
        }

        $ctrl.$onInit = function () {

            var c = getHashParams();
            if (c.access_token !== undefined)
                api.setAuth(c);

            $state.go('home');
        };
    }
};
const BigNumberFilter = function () {
    return function (number) {

        //if (number != undefined)
        //    console.log(number);

        abs = Math.abs(number)

        if (abs >= Math.pow(10, 12))// trillion
            number = (number / Math.pow(10, 12)).toFixed(1) + "t";
        else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) // billion
            number = (number / Math.pow(10, 9)).toFixed(1) + "b";
        else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) // million
            number = (number / Math.pow(10, 6)).toFixed(1) + "m";
        else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3))// thousand
            number = (number / Math.pow(10, 3)).toFixed(1) + "k";
        return number;
    };
};
/*
 * 
 */
const DefaultIconComponent = {
    template: `
          <svg class="s545dfq-6 fvTVVq jqg8ml-1 ghnDxa" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" 
             style="width: 2.34rem;
                    height: 2.34rem;
                    margin: 0 0.5rem;
                    color: rgb(255, 255, 255);
                    fill: rgb(255, 255, 255);
                    background: rgb(0, 121, 211);   
                    border-radius: 50%;
                    padding: 3px;" 
            ng-style="{'background': $ctrl.color }">
            <path d="M15.8286,15.8998 C15.3466,16.3788 12.6326,15.5598 8.5516,11.4798 C4.4706,7.3968 3.6486,4.6858 4.1316,4.2038 C4.3566,3.9788 4.9286,3.9208 5.9126,4.3518 C5.6166,4.5678 5.3306,4.8008 5.0666,5.0658 C5.0536,5.0798 5.0416,5.0948 5.0266,5.1098 C5.5756,6.4268 6.8946,8.4088 9.2596,10.7728 C11.6206,13.1338 13.6046,14.4538 14.9246,15.0028 C14.9376,14.9898 14.9526,14.9778 14.9666,14.9638 C15.2316,14.6988 15.4646,14.4128 15.6786,14.1178 C16.1096,15.1028 16.0526,15.6748 15.8286,15.8998 M16.7526,11.8998 C17.4066,9.5458 16.8136,6.9138 14.9666,5.0658 C13.6436,3.7438 11.8866,3.0148 10.0166,3.0148 C9.3686,3.0148 8.7356,3.1078 8.1286,3.2768 C5.7306,1.7598 3.9176,1.5898 2.7176,2.7898 C1.4036,4.1028 2.0736,6.1918 3.2866,8.1688 C2.6446,10.5128 3.2276,13.1258 5.0666,14.9638 C6.3886,16.2868 8.1456,17.0148 10.0166,17.0148 C10.6536,17.0148 11.2746,16.9178 11.8736,16.7518 C13.0856,17.4938 14.3406,18.0318 15.4316,18.0318 C16.1156,18.0318 16.7366,17.8198 17.2426,17.3138 C18.4416,16.1138 18.2706,14.2988 16.7526,11.8998"></path>
          </svg>
        `,
    bindings: {
        color: '<',
    },
    controller: function () {
        var $ctrl = this;

        $ctrl.$onChanges = function () {

            if ($ctrl.color == "" || $ctrl.color == undefined)
                $ctrl.color = "rgb(0, 121, 211)";
        }

    }
}
const HtmlDecodeFilter = function () {
    return function (html) {
        if (html == undefined)
            return "";

        var decoded = angular.element('<textarea />').html(html).text();
        return decoded;

    };
};
/*
   Scroll Service to register handler for when it the page should load more posts
   */
const InfiniteScrollService = function () {
    let jWindow = angular.element(window);
    let loadHeight = 300;
    let handlers = [];

    //set scroll handler to load more
    scrollHandler = jWindow.scroll(onScroll);

    this.bind = function (callback) {

        handlers.push(callback);
    };

    this.unbind = function (callback) {
        handlers = handlers.filter(m => m !== callback);
    };

    function onScroll() {
        var end = $(document).height();
        var viewEnd = jWindow.scrollTop() + jWindow.height();
        var distance = end - viewEnd;

        //this handler can be called many times in a row - need to be careful not to take an action too many times
        if (distance < loadHeight) // do load
        {
            handlers.forEach(m => m());
        }
    }
};
/* Requires SNUOWND.js
 *
 */
const MarkDownFilter = function () {
    return function (html) {
        if (html == undefined)
            return "";

        var decoded = SnuOwnd.getParser().render(html);
        return decoded;
    };
};
/*
 * Small component that handles Upvotes\Downvotes on a thing
 */
const PostLikeComponent = {
    template: `
           <div class="post-like">
                <button class="btn btn-icon btn-link" ng-click="$ctrl.onLike(1, $event)"><i class="material-icons">keyboard_arrow_up</i></button>
                <span class="text-center" ng-class="{'text-danger': $ctrl.liked === -1, 'text-primary': $ctrl.liked === 1}" style="margin-top: -6px; margin-bottom: -6px;">{{$ctrl.ups | bignumber }}</span>
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
/*
 * Component to handle media posts
 */
const PostMediaComponent = {
    templateUrl: "/app/common/post-media.component.html",
    bindings: {
        post: "<"
    },
    controller: function () {
        var $ctrl = this;
       
    }

}

/*
 * Component to handle media posts
 */
const PostThumbnailComponent = {
    templateUrl: "/app/common/post-thumbnail.component.html",
    bindings: {
        post: "<"
    },
    controller: function () {
        var $ctrl = this;
       
    }

}

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

const HomeComponent = {
    templateUrl: "/app/home/home.component.html",
    controller: function () {

    }
};
const NavbarComponent = {
    templateUrl: "/app/navbar/navbar.component.html",
    controller: function ($rootScope, $window, $state, $transitions, api) {
        var $ctrl = this;
        $ctrl.logged_in = api.isLoggedIn();
        $ctrl.subreddits = [];
        $ctrl.subredditName = null;
        $ctrl.user = null;
        $ctrl.current = "FrontPage";

        $ctrl.$onInit = function () {
            $rootScope.$on('auth-changed', function (event, args) {
                $ctrl.logged_in = api.isLoggedIn();
            });

            $transitions.onSuccess({}, function (transition) {
                var to = transition.to();
                var params = transition.params();

                if (to.name == 'subreddit') {
                    $ctrl.current = params.name;
                }
                else if (to.name == 'home') {
                    $ctrl.current = "Home";
                }
            });

            api.getSubreddits().then(function (response) {
                $ctrl.subreddits = response.data.data.children;
            });

            api.getMe().then(function (user) {
                $ctrl.user = user;
            });

        }

        $ctrl.onLogin = function () {
            api.redirectAuthUrl();
        };

        $ctrl.onLogout = function () {
            api.logOff();
            $window.location.reload();
        };

        $ctrl.submit = function () {
            $state.go("subreddit", { name: $ctrl.subredditName })
            $ctrl.subredditName = null;
        }

       
    }
};
const ProfileComponent = {
    templateUrl: "/app/profile/profile.component.html",
    controller: function ($stateParams, $window, iScroll, reddit) {
        const SAVED_VIEW = 'saved_view';
        let $ctrl = this;
        let isFrontPage = true;
        $ctrl.loadingMore = false;
        $ctrl.name = $stateParams.name;
        $ctrl.listing = [];
        $ctrl.posts = []; //array of post listing 
        $ctrl.placeholders = [{}, {}, {}, {}, {}];
        $ctrl.about = null;
        $ctrl.rules = null;
        $ctrl.view = 'card';
        $ctrl.sort = null;
        $ctrl.sorts = [];
        $ctrl.user = null;

        $ctrl.$onInit = function () {
            reddit.Api.getUser($stateParams.name).then(function (response) {
                $ctrl.user = response.data.data;
            });

            //set scroll handler to load more
            iScroll.bind(loadMore);

            //reset title
            $window.document.title = reddit.PAGE_TITLE;

            //check if front page
            isFrontPage = $stateParams.name !== null;

            //scroll to top
            scrollTop();

            //set sorting
            $ctrl.sorts = isFrontPage ? reddit.SORT_FRONTPAGE : reddit.SORT_SUBREDDIT;
            $ctrl.sort = $ctrl.sorts[0];

            //download data
            loadPosts();

            //get side bar stuff if were not on front page
            //if (isFrontPage) {

            //    reddit.Api.getSubredditAbout($stateParams.name).then(function (result) {
            //        $ctrl.about = result.data.data;
            //        setSubredditStyles();
            //    });

            //    reddit.Api.getSubredditRules($stateParams.name).then(function (result) {
            //        $ctrl.rules = result.data.rules;
            //    });
            //}

            //Check storage for saved view
            var view = $window.localStorage.getItem(SAVED_VIEW);
            if (view !== null && view !== undefined)
                $ctrl.view = view;



           
        };

        $ctrl.$onDestroy = function () {
            jWindow.unbind('scroll', onScroll);
        };

        $ctrl.setView = function (type) {
            //changes view type
            $ctrl.view = type;
            $window.localStorage.setItem(SAVED_VIEW, type);
        };

        $ctrl.setSort = function (sort) {
            $ctrl.sort = sort;

            loadPosts();
        };


        function loadPosts() {
            //reset posts
            $ctrl.posts = [];
            $ctrl.placeholders = [{}, {}, {}, {}, {}];
            $ctrl.loadingMore = true;
            reddit.Api.getSubredditPosts($stateParams.name, {}, $ctrl.sort).then(function (result) {
                $ctrl.listing = result.data.data;
                $ctrl.posts = result.data.data.children;

                $ctrl.placeholders = [];
                $ctrl.loadingMore = false;
                scrollTop();
            });
        }

        function loadMore() {
          

            $ctrl.loadingMore = true;

            //pull next
            reddit.Api.getSubredditPosts($stateParams.name, {
                after: $ctrl.listing.after, count: $ctrl.posts.length
            },
                $ctrl.sort).then(function (result) {
                    $ctrl.listing = result.data.data;
                    result.data.data.children.forEach(function (item) {
                        $ctrl.posts.push(item);
                    });

                    $ctrl.loadingMore = false;
                });
        }

        function setSubredditStyles() {
            //set color styles for subreddit
            var html = document.getElementsByTagName('html')[0];
            html.style.setProperty("--subreddit-primary-color", $ctrl.about.primary_color);
            html.style.setProperty("--subreddit-key-color", $ctrl.about.key_color);

            //set page title - Maybe need a title service?
            $window.document.title = "Re: " + $ctrl.about.title;
        }


        function scrollTop() {
            //scrolls window to the top
            angular.element(window).scrollTop(0);
        }
    }
};
const SubredditCardviewComponent = {
    templateUrl: "/app/subreddit/subreddit-cardview.component.html",
    bindings: {
        post: '<'
    },
    controller: function () {
        var $ctrl = this;
      
    }
};
const SubredditCommentComponent = {
    templateUrl: "/app/subreddit/subreddit-comment.component.html",
    bindings: {
        comment: '<', //me comment
        link: '<', //parent post
        depth: '<' //counter
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
            reddit.Api.getMoreChildren($ctrl.comment.name, $ctrl.comment.id, c.data.children).then(
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
            if (!reddit.Api.isLoggedIn()) {
                alert("Must be logged in to do that.");
                return;
            }

            $ctrl.showReply = true;
        };

        $ctrl.authorClass = function () {
            return {
                'badge badge-primary badge-pill': $ctrl.comment.is_submitter,
                'text-success': $ctrl.comment.distinguished == 'moderator'
            };
        }
    }
};
const SubredditListviewComponent = {
    templateUrl: "/app/subreddit/subreddit-listview.component.html",
    bindings: {
        post: '<'
    },
    controller: function () {
        var $ctrl = this;
      
    }
};
const SubredditPostComponent = {
    templateUrl: "/app/subreddit/subreddit-post.component.html",
    controller: function ($stateParams, $state, api) {
        var $ctrl = this;
        $ctrl.name = $stateParams.subreddit;
        $ctrl.comments = [];
        $ctrl.post = $stateParams.post;

        let html = angular.element('html');
        let onEscHandler = function (e) {
            if (e.keyCode === 27) {
                $state.go('^');
            }
        };

        this.$onInit = function () {
            html.addClass('freeze-scroll');
            angular.element(document).keyup(onEscHandler);


            if ($stateParams.subreddit === null)
                $ctrl.name = $stateParams.name;

            if ($ctrl.name === null)
                $state.go('^');


            api.getPost($ctrl.name, $stateParams.id).then(function (result) {

                $ctrl.post = result.data[0].data.children[0].data;

                var cmts = [];
                result.data.splice(0, 1);

                angular.forEach(result.data, list =>
                    angular.forEach(list.data.children, comment =>
                        cmts.push(comment.data)));

                $ctrl.comments = cmts;
            }, function (result) {
                $state.go('^')
            });

        };

        this.$onDestroy = function () {
            html.removeClass('freeze-scroll');
            angular.element(document).unbind('keyup', onEscHandler);
        };



    }
};
const SubredditSidebarComponent = {
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
const SubredditComponent = {
    templateUrl: "/app/subreddit/subreddit.component.html",
    controller: function ($stateParams, $window, iScroll, reddit) {
        const SAVED_VIEW = 'saved_view';
        let $ctrl = this;
        let isFrontPage = true;
        $ctrl.loadingMore = false;
        $ctrl.name = $stateParams.name;
        $ctrl.listing = [];
        $ctrl.posts = []; //array of post listing 
        $ctrl.placeholders = [{}, {}, {}, {}, {}];
        $ctrl.about = null;
        $ctrl.rules = null;
        $ctrl.view = 'card';
        $ctrl.sort = null;
        $ctrl.sorts = [];


        $ctrl.$onInit = function () {
            //set scroll handler to load more
            iScroll.bind(loadMore); 

            //reset title
            $window.document.title = reddit.PAGE_TITLE;

            //check if front page
            isFrontPage = $stateParams.name !== null;

            //scroll to top
            scrollTop();

            //set sorting
            $ctrl.sorts = isFrontPage ? reddit.SORT_FRONTPAGE : reddit.SORT_SUBREDDIT;
            $ctrl.sort = $ctrl.sorts[0];

            //download data
            loadPosts();

            //get side bar stuff if were not on front page
            if (isFrontPage) {

                reddit.Api.getSubredditAbout($stateParams.name).then(function (result) {
                    $ctrl.about = result.data.data;
                    setSubredditStyles();
                });

                reddit.Api.getSubredditRules($stateParams.name).then(function (result) {
                    $ctrl.rules = result.data.rules;
                });
            }

            //Check storage for saved view
            var view = $window.localStorage.getItem(SAVED_VIEW);
            if (view !== null && view !== undefined)
                $ctrl.view = view;
        };

        $ctrl.$onDestroy = function () {
            iScroll.unbind(loadMore);
        };

        $ctrl.setView = function (type) {
            //changes view type
            $ctrl.view = type;
            $window.localStorage.setItem(SAVED_VIEW, type);
        };

        $ctrl.setSort = function (sort) {
            $ctrl.sort = sort;

            loadPosts();
        };


        function loadPosts() {
            //reset posts
            $ctrl.posts = [];
            $ctrl.placeholders = [{}, {}, {}, {}, {}];
            $ctrl.loadingMore = true;
            reddit.Api.getSubredditPosts($stateParams.name, {}, $ctrl.sort).then(function (result) {
                $ctrl.listing = result.data.data;
                $ctrl.posts = result.data.data.children;

                $ctrl.placeholders = [];
                $ctrl.loadingMore = false;
                scrollTop();
            });
        }

        function loadMore() {
            if ($ctrl.loadingMore) //escape if already loading
                return;

            $ctrl.loadingMore = true;

            //pull next
            reddit.Api.getSubredditPosts($stateParams.name, {
                after: $ctrl.listing.after, count: $ctrl.posts.length
            },
                $ctrl.sort).then(function (result) {
                    $ctrl.listing = result.data.data;
                    result.data.data.children.forEach(function (item) {
                        $ctrl.posts.push(item);
                    });

                    $ctrl.loadingMore = false;
                });
        }

        function setSubredditStyles() {
            //set color styles for subreddit
            var html = document.getElementsByTagName('html')[0];
            html.style.setProperty("--subreddit-primary-color", $ctrl.about.primary_color);
            html.style.setProperty("--subreddit-key-color", $ctrl.about.key_color);

            //set page title - Maybe need a title service?
            $window.document.title = "Re: " + $ctrl.about.title;
        }


        function scrollTop() {
            //scrolls window to the top
            angular.element(window).scrollTop(0);
        }
    }
};
(function () {
    'use strict';
    var app = angular.module('app', ['ngAnimate', 'ngSanitize', 'ui.router', 'angularMoment']);

    //Declare all angular components/services/factories/filters here
    app.service('api', ApiService);
    app.service('reddit', RedditService);
    app.service('iScroll', InfiniteScrollService);
    app.component('appNavbar', NavbarComponent);
    app.component('appHome', HomeComponent);
    app.component('appSubreddit', SubredditComponent);
    app.component('appSubredditPost', SubredditPostComponent);
    app.component('appSubredditCardview', SubredditCardviewComponent);
    app.component('appSubredditListview', SubredditListviewComponent);
    app.component('appSubredditComment', SubredditCommentComponent);
    app.component('appSubredditSidebar', SubredditSidebarComponent);
    app.component('appProfile', ProfileComponent);
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
            .state("profile", {
                url: "/u/{name}",
                component: 'appProfile',
                params: {
                    name: null
                }
            });

        //For api auth
        $httpProvider.interceptors.push(ApiInterceptor);
    });

})();