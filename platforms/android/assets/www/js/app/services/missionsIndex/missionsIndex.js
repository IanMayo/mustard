/**
 * @module missionsIndex service
 */

angular.module('mustard.app.missionsIndex', [])

.factory('missionsIndex', function ($http, $q) {

    return {
        /**
         * It returns the levels collection from missions-index
         *
         * @returns {promise}
         */
        getLevels: function () {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                cache: true,
                url: 'js/app/missionsIndex/missionsIndex.json'
            }).success(function (response) {
                deferred.resolve(response);
            });

            return deferred.promise;
        },

        /**
         * It returns collection of missions which is taken from the levels collection
         *
         * @returns {promise}
         */
        getMissions: function () {
            var deferred = $q.defer();

            this.getLevels().then(function (levels) {
                deferred.resolve(_.flatten(_.pluck(levels, 'missions')));
            });

            return deferred.promise;
        },

        /**
         * It returns particular mission from the levels collection based on its id
         *
         * @param id
         * @returns {promise}
         */
        getMission: function (id) {
            var deferred = $q.defer();

            this.getLevels().then(function (levels) {
                var missions = _.flatten(_.pluck(levels, 'missions'));
                var mission = _.findWhere(missions, {id: id}) || {};

                deferred.resolve(mission);
            });

            return deferred.promise;
        }
    }
});
