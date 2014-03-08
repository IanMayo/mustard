/**
 * @module mockUserBackend service
 */

angular.module('mustard.app.mockUserBackend', [])

.factory('mockUserBackend', function ($http, $q) {

    return {
        login: function (username) {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: 'js/app/mockUsers/' + username + '.json'
            }).success(function (response) {
                deferred.resolve(response);
            });

            return deferred.promise;
        },
        
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
