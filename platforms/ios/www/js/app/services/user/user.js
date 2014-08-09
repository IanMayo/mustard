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
     * It parses levels in user data and returns missions collection
     *
     * @param user
     * @returns {Array}
     */
    var getMissionsCollection = function (user) {
        var missions = [];

        _.each(user.levels, function (level) {
            _.each(level.missions, function (mission) {
                missions.push(mission);
            });
        });

        return missions;
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
        var mission = _.findWhere(getMissionsCollection(user), { id: missionId });

        if (mission) {
            mission.status = missionStatus;
            saveUserToLocal(user);
        }

        return !!mission;
    };


    /**
     * If the mission after the one specified is locked, then unlock it
     *
     * @param user the user we're referring to
     * @param missionId the previous mission
     */
    var unlockNextMission = function (user, missionId) {
        var foundIt = null;

        // note: we're using every instead of each so that
        // we can drop out of the loop early (when we find a match)
        _.every(getMissionsCollection(user), function (mission) {

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
                    saveUserToLocal(user);

                    // and drop out of the every loop
                    return false;
                }
            }

            // ok, allow move on to next loop iteration
            return true;
        })
    };

    /**
     * It returns the next mission from the passed one
     *
     * @param user
     * @param missionId
     * @returns {Object}
     */
    var getNextAvailableMission = function (user, missionId) {
        var nextMission = null;
        var foundId;

        _.every(getMissionsCollection(user), function (mission) {
            if (mission.id === missionId) {
                foundId = true;

            } else if (foundId) {
                switch (mission.status) {
                    case 'UNLOCKED':
                    case 'SUCCESS' :
                    case 'FAILURE' :
                        nextMission = mission;
                        return false;
                }
            }

            return true;
        });

        return nextMission;
    };

    /**
     * Returns the mission by its id
     *
     * @param user
     * @param missionId
     * @returns {Object|Undefined}
     */
    var getMission = function (user, missionId) {
        return _.findWhere(getMissionsCollection(user), {id: missionId});
    };


    /**
     * Returns true if all missions are completed and vv.
     * we use it to determine if game is done
     *
     * @returns {Boolean}
     */
    var isGameAccomplished = function (user) {
        var missions = getMissionsCollection(user);

        return missions.length === _.where(missions, {status: 'SUCCESS'}).length;
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
     *    "levels": [
     *        {
     *            "id": "1",
     *            "name": "Sonar School",
     *            "missions": [
     *                {"id": "1a", name: "A", "status": "SUCCESS"},
     *                {"id": "1b", name: "B", "status": "UNLOCKED"},
     *                {"id": "1c", name: "C", "status": "LOCKED"}
     *            ]
     *        }
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
        levels: [],
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
         * Returns missions collection
         *
         * @returns {Array}
         */
        getMissions: function () {
            return getMissionsCollection(user);
        },

        /**
         * Returns the next mission from the passed one
         *
         * @param missionId
         * @returns {Object}
         */
        getNextMission: function (missionId) {
            return getNextAvailableMission(user, missionId);
        },

        /**
         * Returns the specific mission by its id
         *
         * @param missionId
         * @returns {Object}
         */
        getMission: function (missionId) {
            return getMission(user, missionId);
        },

        /**
         * Checks the missions statuses and make a decision if game is completed or still not
         *
         * @returns {Boolean}
         */
        isGameAccomplished: function () {
            return isGameAccomplished(user);
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
