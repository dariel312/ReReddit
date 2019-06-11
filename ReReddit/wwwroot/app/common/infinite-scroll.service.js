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