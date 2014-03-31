/**
 * @module mockUserMissions service
 */

angular.module('mustard.app.mockUserMissions', [
    'mustard.app.missionsIndex'
])

.factory('mockUserMissions', function ($q, missionsIndex) {

    /**
     * This weird method returns mission status based on username and mission index
     * FIXME: Please remove me when it will be possible
     *
     * @param useranme
     * @param key
     * @param length
     * @returns {string}
     */
    var getMockMissionStatus = function (useranme, key, length) {
        if (useranme === 'Sailor') {
            return key <= length/2 ? 'UNLOCKED' : 'LOCKED';
        } else if (useranme === 'Commander') {
            return 'UNLOCKED';
        } else {
            return !key ? 'UNLOCKED' : 'LOCKED';
        }
    };

    /**
     * It adds missions statuses to the user data based on missions which we've got from the missions index
     *
     * @param userData
     * @param missions
     * @returns {Object}
     */
    var addUserMissionStatuses = function (userData, missions) {
        var user = userData;
        var missionsLength = missions.length;

        angular.forEach(missions, function (mission, key) {
            user.missions.push({
                id: mission.id,
                status: getMockMissionStatus(user.name, key, missionsLength)
            });
        });

        return user;
    };

    return {
        /**
         * It gets missions collection from the missions index and post-process user data based on what we've got
         *
         * @param userData
         * @returns {promise}
         */
        process: function (userData) {
            var deferred = $q.defer();

            missionsIndex.getMissions().then(function (missions) {
                deferred.resolve(addUserMissionStatuses(userData, missions));
            });

            return deferred.promise;
        }
    }
});
