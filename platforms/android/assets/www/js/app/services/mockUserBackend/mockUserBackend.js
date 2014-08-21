/**
 * @module mockUserBackend service
 */

angular.module('subtrack90.app.mockUserBackend', [
    'subtrack90.app.mockUserLevels'
])

.factory('mockUserBackend', function ($http, $q, mockUserLevels) {

    return {
        /**
         * It returns the mock user data based on username
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
                mockUserLevels.process(response).then(function (user) {
                    deferred.resolve(user);
                });
            });

            return deferred.promise;
        },

        /**
         * It emulates saving of user on the server
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
