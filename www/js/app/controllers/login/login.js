angular.module('mustard.app.login', ['mustard.app.user'])

/**
 * @module Login
 * @class LoginCtrl (controller)
 */
.controller('LoginCtrl', function ($scope, $location, user) {

    // TODO: Move to the bootstrap module
    user.restoreFromLocal(function (isRestored) {
        isRestored && $location.path('/main');
    });

    $scope.submit = function (username, password) {
        user.restoreFromWeb(username, password).then(function (isRestored) {
            isRestored && $location.path('/main');
        });
    };
});
