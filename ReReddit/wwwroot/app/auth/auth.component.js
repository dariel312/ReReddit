/*This component is used just to take in the Redirect OAuth from reddit.*/
const AuthComponent = {
    template: "",
    controller: function ($stateParams, $window, $state, api) {
        $ctrl = this;

        function getHashParams() {
            //Since reddit puts the necesary info in th URL as a fragment #
            var hashParams = {};
            var e,
                a = /\+/g,  // Regex for replacing addition symbol with a space
                r = /([^&;=]+)=?([^&;]*)/g,
                d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
                q = $window.location.hash.substring(1);

            while (e = r.exec(q))
                hashParams[d(e[1])] = d(e[2]);

            return hashParams;
        }

        var c = getHashParams();
        if (c.access_token !== undefined)
            api.setAuth(c);

        $state.go('home');
    }
};