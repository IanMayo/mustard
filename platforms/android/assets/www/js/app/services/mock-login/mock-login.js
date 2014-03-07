/**
 * @module Mck login service
 */

angular.module('mustard.app.mockLogin', [])

.factory('mockLogin', function ($http, $q) {

    return {
        login: function (username) {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: 'js/app/mock-users/' + username + '.json'
            }).success(function (response) {
                deferred.resolve(response);
            });

            return deferred.promise;
        }
    }
});
