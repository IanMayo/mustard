/**
 * @module User service
 */

angular.module('mustard.app.user', [
    'mustard.app.mockUserBackend',
    'LocalStorageModule'
])

.factory('user', function ($q, localStorageService, mockUserBackend) {

    /**
     * It saves user to the local storage
     *
     * @private
     * @param user
     * @returns {boolean}
     */
    var saveUserToLocal = function (user) {
        return localStorageService.add('user', user);
    };

    /**
     * It changes status of the particular mission
     *
     * @private
     * @param user
     * @param missionId
     * @param missionStatus
     * @returns {boolean}
     */
    var changeMissionStatus = function (user, missionId, missionStatus) {
        var mission = _.findWhere(user.missions, {id: missionId});

        if (mission) {
            mission.status = missionStatus;
            saveUserToLocal(user);
        }

        return !!mission;
    };


    /** if the mission after the one specified is locked, then unlock it
     *
     * @param user the user we're referring to
     * @param missionId the previous mission
     */
    var unlockNextMission = function (user, missionId) {
        var foundIt = null;

        // note: we're using every instead of each so that
        // we can drop out of the loop early (when we find a match)
        _.every(user.missions, function (mission) {

            // is this the mission in question?
            if (mission.id == missionId) {
                foundIt = true;
            }
            else if (foundIt) {
                // ok - the previous one was the completed mission, what's the
                // status of this one?
                if (mission.status == 'LOCKED') {
                    // ok, unlock it
                    mission.status = 'UNLOCKED';

                    // and drop out of the every loop
                    return false;
                }
            }

            // ok, allow move on to next loop iteration
            return true;
        })
    };


    /**
     * It's IMPORTANT variable which indicates if user is authorized in app
     *
     * @private
     * @type {boolean}
     */
    var authorized = false;

    /**
     * User singleton object
     *
     * Note: this is what a user object looks like:
     * {
     *    "name": "Sailor",
     *    "achievements": [
     *        {"name": "Newbie"},
     *        {"name": "Speed Demon"}
     *    ],
     *    "missions": [
     *        {"id": "1a", "status": "SUCCESS"},
     *        {"id": "1b", "status": "UNLOCKED"},
     *        {"id": "1c", "status": "LOCKED"}
     *    ]
     *    "options": {
     *        "audio": 0,
     *        "sfx": 0,
     *        "language": ""
     *    }
     * }
     *
     */
    var user = {
        name: "",
        missions: [],
        achievements: [],
        options: {},

        /**
         * It restores user from web API
         * FIXME: for now it uses mockUserBackend service to emulate user API
         *
         * @param username
         * @returns {promise}
         */
        restoreFromWeb: function (username) {
            var deferred = $q.defer();

            mockUserBackend.login(username).then(function (restoredUser) {
                if (restoredUser) {
                    angular.extend(user, restoredUser);
                    saveUserToLocal(user);
                    authorized = true;
                }

                deferred.resolve(authorized);
            });

            return deferred.promise;
        },

        /**
         * It saves user on the server
         * FIXME: for now it uses mockUserBackend service to emulate user API
         *
         * @returns {promise}
         */
        syncWithWeb: function () {
            var deferred = $q.defer();

            mockUserBackend.saveUser(user).then(function (responce) {
                deferred.resolve(responce && responce.status === "success");
            });

            return deferred.promise;
        },

        /**
         * Restore user from local storage
         *
         * @returns {boolean}
         */
        restoreFromLocal: function () {
            var restoredUser = localStorageService.get('user');

            if (restoredUser) {
                angular.extend(user, restoredUser);
                authorized = true;
            }

            return !!restoredUser;
        },

        /**
         * It adds "new" achievement to the user data
         *
         * @param achievementName
         * @returns {boolean}
         */
        addAchievement: function (achievementName) {
            if (!this.isAchievementPresent(achievementName)) {
                this.achievements.push({name: achievementName});
                saveUserToLocal(user);
            }

            return this.isAchievementPresent(achievementName);
        },

        /**
         * It checks if user has achievement with specified name
         *
         * @param achievementName
         * @returns {boolean}
         */
        isAchievementPresent: function (achievementName) {
            return !!_.findWhere(this.achievements, {name: achievementName});
        },

        /**
         * It sets options and save the user in local storage
         *
         * @param options
         * @returns {boolean}
         */
        setOptions: function (options) {
            if (!options) return false;

            angular.extend(user.options, options);
            return saveUserToLocal(user);
        },

        /**
         * Search mission by its id and set it as COMPLETED
         *
         * @param missionId
         * @returns {boolean}
         */
        missionCompleted: function (missionId) {
            var res = changeMissionStatus(user, missionId, 'SUCCESS');

            /** TODO: on mission completed, we need to UNLOCK the next mission, if it's locked
             * this looks like some fancy underscore processing.
             */
            unlockNextMission(user, missionId);

            return res;

        },

        /**
         * Search mission by its id and set it as FAILED
         *
         * @param missionId
         * @returns {boolean}
         */
        missionFailed: function (missionId) {
            return changeMissionStatus(user, missionId, 'FAILURE');
        },

        /**
         * Check if current user is authorized
         *
         * @returns {boolean}
         */
        isAuthorized: function () {
            return authorized;
        },

        /**
         * Deauthorize current user and remove it from local storage
         *
         * @returns {boolean}
         */
        deauthorizeUser: function () {
            authorized = false;
            return localStorageService.remove('user');
        }
    };

    return user;
});
