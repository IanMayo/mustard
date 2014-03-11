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

    /**
     * It's IMPORTANT variable which indicates if user is authorized in app
     *
     * @private
     * @type {boolean}
     */
    var authorized = false;

    /**
     * User singleton object
     */
    var user = {
        name: "",
        missions: [],
        achievements: [],

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
         * Search mission by its id and set it as COMPLETED
         *
         * @param missionId
         * @returns {boolean}
         */
        missionCompleted: function (missionId) {
            return changeMissionStatus(user, missionId, 'COMPLETED');
        },

        /**
         * Search mission by its id and set it as FAILED
         *
         * @param missionId
         * @returns {boolean}
         */
        missionFailed: function (missionId) {
            return changeMissionStatus(user, missionId, 'FAILED');
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
