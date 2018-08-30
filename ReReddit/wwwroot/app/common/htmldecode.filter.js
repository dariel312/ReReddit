const HtmlDecodeFilter = function () {
    return function (html) {
        if (html == undefined)
            return "";

        var decoded = angular.element('<textarea />').html(html).text();
        return decoded;

    };
};