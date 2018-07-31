const HtmlDecodeFilter = function () {
    return function (html) {

        //var decoded = angular.element('<textarea />').html(html).text();

        var decoded = SnuOwnd.getParser().render(html);


        return decoded;
    };
};