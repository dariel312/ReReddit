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