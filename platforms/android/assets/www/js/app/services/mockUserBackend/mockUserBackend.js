/**
 * @module mockUserBackend service
 */

angular.module('mustard.app.mockUserBackend', [
    'mustard.app.mockUserMissions'
])

.factory('mockUserBackend', function ($http, $q, mockUserMissions) {

    return {
        /**
         * It returns the mock user data by its username
         *
         * @param username
         * @returns {promise}
         */
        login: function (username) {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: 'js/app/mockUsers/' + username + '.json'
            }).success(function (response) {
                mockUserMissions.process(response).then(function (user) {
                    deferred.resolve(user);
                });
            });

            return deferred.promise;
        },

        /**
         * It emulates possible API call for the user saving on the remote server
         *
         * @param user
         * @returns {promise}
         */
        saveUser: function (user) {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: 'js/app/mockUsers/saveUser.json',
                data: user
            }).success(function (response) {
                deferred.resolve(response);
            });

            return deferred.promise;
        }
    }
});
