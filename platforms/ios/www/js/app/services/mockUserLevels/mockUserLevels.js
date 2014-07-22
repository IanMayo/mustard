/**
 * @module mockUserLevels service
 */

angular.module('mustard.app.mockUserLevels', [
    'mustard.app.missionsIndex'
])

.factory('mockUserLevels', function ($q, missionsIndex) {

    /**
     * This weird method returns mission status based on username and mission index
     * FIXME: Please remove me when it will be possible
     *
     * @param useranme
     * @param key
     * @param length
     * @returns {string}
     */
    var getMockStatus = function (useranme, key, length) {
        if (useranme === 'Sailor') {
            return key <= length/2 ? 'UNLOCKED' : 'LOCKED';
        } else if (useranme === 'Commander') {
            return 'UNLOCKED';
        } else {
            return !key ? 'UNLOCKED' : 'LOCKED';
        }
    };

    /**
     * It formats the user data and adds mock statuses there
     *
     * @param user
     * @param levels
     * @returns {Object}
     */
    var processLevels = function (user, levels) {
        user.levels = levels;

        _.each(user.levels, function (level, key) {
            level.missions = _.map(level.missions, function (mission) {
                mission.status = getMockStatus(user.name, key, level.missions.length);

                return _.pick(mission, 'id', 'name', 'status', 'url');
            });
        });

        return user;
    };

    return {
        /**
         * It gets levels collection from the missions index and post-process this data
         *
         * @param userData
         * @returns {promise}
         */
        process: function (userData) {
            var deferred = $q.defer();

            missionsIndex.getLevels().then(function (levels) {
                deferred.resolve(processLevels(userData, levels));
            });

            return deferred.promise;
        }
    }
});
