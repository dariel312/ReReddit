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