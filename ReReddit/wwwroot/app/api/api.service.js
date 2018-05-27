/*
    Service that will be a wrapper for all api calls
*/
const ApiService = function($http){

    const host = "https://www.reddit.com";

    //Helper function for get api requests
    function _get (url, parameters) {
        if (parameters === null || parameters === undefined)
            parameters = {};

        return $http.get(url, { params: parameters });
            // .finally(finFunc)
            // .catch(errorFunc);
    };


    this.getSubreddit = function(subreddit){
        return _get(host + "/r/" + subreddit + ".json");
    };
};