angular.module('subtrack90.app.login', ['subtrack90.app.user'])

/**
 * @module Login
 * @class LoginCtrl (controller)
 */
.controller('LoginCtrl', function ($scope, $location, user) {

    $scope.submit = function (username, password) {
        user.restoreFromWeb(username, password).then(function (isRestored) {
            isRestored && $location.path('/main');
        });
    };
});
