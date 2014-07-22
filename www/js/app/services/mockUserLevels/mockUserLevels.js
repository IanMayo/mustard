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
     * @param isFirst - whether this is the very first mission
     * @returns {string}
     */
    var getMockStatus = function (username, key, length, isFirst) {
        if (username === 'Sailor') {
            // unlock the first 1/2 of the missions
            return key <= length/2 ? 'UNLOCKED' : 'LOCKED';
        } else if (username === 'Commander') {
            // unlock all missions
            return 'UNLOCKED';
        } else {
            // just onlock the very first mission
            return isFirst ? 'UNLOCKED' : 'LOCKED';
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

        // keep track of if this is the first mission
        var isFirst = true;

        _.each(user.levels, function (level, key) {
            level.missions = _.map(level.missions, function (mission) {
                mission.status = getMockStatus(user.name, key, level.missions.length, isFirst);

                if(isFirst)
                {
                    // ok, we've processed the first one, clear the flag
                    isFirst = false;
                }

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
