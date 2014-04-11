angular.module('mustard.app.userProfile', [
    'mustard.app.user',
    'mustard.app.message',
    'LocalStorageModule'
])

/**
 * @module Profile
 * @class ProfileCtrl (controller)
 */
.controller('ProfileCtrl', function ($scope, user, localStorageService, $location, message) {

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
            message.showModal('info', 'Notification', ('User is ' + (isSaved ? 'SAVED' : 'NOT SAVED')));
        });
    };

    $scope.showModalMessage = function () {
        message.showModal('warning', 'Test message', 'Text Message');
    };
});
