angular.module('mustard.app.userProfile', [
    'mustard.app.user',
    'mustard.game.modal',
    'LocalStorageModule'
])

/**
 * @module Profile
 * @class ProfileCtrl (controller)
 */
.controller('ProfileCtrl', function ($scope, user, localStorageService, $location, modal) {

    /**
     * GOD CONSOLE METHODS
     */
    $scope.user = user;
    $scope.userInStorage = localStorageService.get('user');

    $scope.$watch('user', function () {
        $scope.userInStorage = localStorageService.get('user');
    }, true);

    $scope.addMockAchievement = function (achievementName) {
        user.addAchievement(achievementName);
    };

    $scope.missionMockCompleted = function (missionId) {
        user.missionCompleted(missionId);
    };

    $scope.missionMockFailed = function (missionId) {
        user.missionFailed(missionId);
    };

    $scope.logout = function () {
        user.deauthorizeUser();
        $location.path('/');
    };

    $scope.saveUser = function () {
        user.syncWithWeb().then(function (isSaved) {
            modal.showMessage('info', 'Notification', ('User is ' + (isSaved ? 'SAVED' : 'NOT SAVED')));
        });
    };

    $scope.showModalMessage = function () {
        modal.showMessage('warning', 'Test message', 'Text Message');
    };
});
