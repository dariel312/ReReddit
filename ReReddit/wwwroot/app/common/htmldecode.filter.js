const HtmlDecodeFilter = function () {
    return function (html) {

        var decoded = angular.element('<textarea />').html(html).text();

        return decoded;
    };
};