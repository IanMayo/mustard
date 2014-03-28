/**
 * @module missionsIndex service
 */

angular.module('mustard.app.missionsIndex', [])

.factory('missionsIndex', function ($http, $q) {

    return {
        get: function () {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                cache: true,
                url: 'js/app/missionsIndex/missionsIndex.json'
            }).success(function (response) {
                deferred.resolve(response);
            });

            return deferred.promise;
        }
    }
});
