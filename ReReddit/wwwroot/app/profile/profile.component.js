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