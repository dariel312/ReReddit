var ApiInterceptor = function ($q, $window, $injector) {
    return {
        /*Must use $injector otherwise you'll get cirucular dependency*/
        'request': function (config) {
            var api = $injector.get('api');
            var url = config.url.split('/');

            if (api.isLoggedIn() && (url[1] == 'api' || url[0] == 'api')) {
                config.headers.Authorization = "Bearer " + api.getAuthToken();
            }
            return config;
        },

        //Returns to login if unathorized
        'responseError': function (rejection) {
            if (rejection.status === 401) {
                var api = $injector.get('api');
                api.logOff();
            }
            else return $q.reject(rejection);
        }
    };
}