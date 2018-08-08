/*
    Service that will be a wrapper for all api calls
*/
const ApiService = function ($http, $window, $rootScope, $httpParamSerializer, $state) {
    const self = this;
    const host = "https://www.reddit.com";
    const client_id = "TDmT_7LQ_5LkmQ";
    const client_secret = "";
    const redirect_uri = "http://localhost:55840/auth";
    const api_scope = "identity, edit, flair, history, modconfig, modflair, modlog, modposts, modwiki, mysubreddits, privatemessages, read, report, save, submit, subscribe, vote, wikiedit, wikiread";
    const token_key = "auth_token";
    var auth_info = null;

    //load stored data
    auth_info = JSON.parse($window.localStorage.getItem(token_key));

    //Helper function for get api requests
    function _get(url, parameters) {
        if (parameters === null || parameters === undefined)
            parameters = {};

        return $http.get(url, { params: parameters });
        // .finally(finFunc)
        // .catch(errorFunc);
    };

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
        $rootScope.$broadcast('auth-changed');
    }

    //Subreddit
    this.getPost = function (subreddit, id) {
        return _get(host + "/r/" + subreddit + "/comments/" + id + ".json");
    };

    this.getSubredditPosts = function (subreddit, params) {

        if (this.isLoggedIn()) {
            if (subreddit == null)
                return _get("api/hot", params);
            else
                return _get("api/r/" + subreddit, params);
        }
        else {
            if (subreddit == null)
                return _get(host + "/.json", params);
            else
                return _get(host + "/r/" + subreddit + ".json", params);
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
    }

    this.getSubreddits = function () {
        if (this.isLoggedIn()) {
            return _get("api/subreddits/mine/subscriber");
        }
        else {
            return _get(host + "/subreddits/popular.json");
        }
    };

    //Auth
    this.redirectAuthUrl = function () {
        $window.location.href = 'https://www.reddit.com/api/v1/authorize?client_id=' + client_id + '&response_type=token&state=12345&redirect_uri=' + redirect_uri + '&scope=' + api_scope;
    };

    this.setAuth = function (response) {
        response.expires_at = moment().add(response.expires_in, "seconds");
        $window.localStorage.setItem(token_key, JSON.stringify(response));
        onAuthChanged();
    };

    this.logOff = function () {
        if (self.isLoggedIn) {
            $window.localStorage.removeItem(token_key);
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

};