/**
 * @module User service
 */

angular.module('mustard.app.user', [
    'mustard.app.mockLogin',
    'LocalStorageModule'
])

.factory('user', function ($q, localStorageService, mockLogin) {

    var saveUserToLocal = function (user) {
        return localStorageService.add('user', user);
    };

    var user = {
        name: "",
        missions: [],
        achievements: [],

        restoreFromLocal: function (cb) {
            var restoredUser = localStorageService.get('user');

            restoredUser && angular.extend(user, restoredUser);
            cb(!!(restoredUser));
        },

        restoreFromWeb: function (username, password) {
            var deferred = $q.defer();

            mockLogin.login(username).then(function (restoredUser) {
                restoredUser && angular.extend(user, restoredUser);

                deferred.resolve(!!(restoredUser && saveUserToLocal(user)));
            });

            return deferred.promise;
        }
    };

    return user;
});
