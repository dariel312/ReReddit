const HtmlDecodeFilter = function () {
    return function (html, isRaw) {
        if (html == undefined)
            return "";

        if (isRaw == false) {
            var decoded = SnuOwnd.getParser().render(html);
            return decoded;
        }
        else {
            var decoded = angular.element('<textarea />').html(html).text();
            return decoded;
        }
    };
};