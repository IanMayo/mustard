angular.module('mustard.app.userProfile', [
    'mustard.app.user',
    'mustard.game.message',
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

    // Mock messages
    $scope.messages = [
        {title: 'You achieve something', type: 'info', text: 'Message #1', unread: true},
        {title: 'Something happened', type: 'danger', text: 'Message #2', unread: true},
        {title: 'Warning message', type: 'warning', text: 'Message #3', unread: true},
        {title: 'Your ship is upgraded', type: 'info', text: 'Message #4', unread: true},
        {title: 'Missile launched', type: 'danger', text: 'Message #5', unread: false},
        {title: 'You have something weird on your ship', type: 'warning', text: 'Message #6', unread: false},
        {title: 'Another achievement ', type: 'info', text: 'Message #7', unread: false},
        {title: 'You are drowning', type: 'danger', text: 'Message #8', unread: false},
        {title: 'Gud Luck!', type: 'info', text: 'Message #9', unread: false},
        {title: 'Hey it is another warning message', type: 'warning', text: 'Message #10', unread: false},
        {title: 'Missile launched but it missed', type: 'danger', text: 'Message #11', unread: false},
        {title: 'Buy something in our shop', type: 'info', text: 'Message #12', unread: false},
        {title: 'You have bought easter skinn for your ship', type: 'info', text: 'Message #13', unread: false},
        {title: 'Watch out!', type: 'warning', text: 'Message #14', unread: false},
        {title: 'Happy Easter!', type: 'info', text: 'Message #15', unread: false},
        {title: 'Something is coming from sky ... UFO', type: 'danger', text: 'Message #16', unread: false},
        {title: 'You have just bitten the record', type: 'info', text: 'Message #17', unread: false},
        {title: 'Game tricks wanna read?', type: 'info', text: 'Message #18', unread: false},
        {title: 'Your ship is out of course!', type: 'danger', text: 'Message #19', unread: false},
        {title: 'Ship is ready to go', type: 'info', text: 'Message #20', unread: false},
        {title: 'Hey something is happening', type: 'warning', text: 'Message #21', unread: false},
        {title: 'Another info message', type: 'info', text: 'Message #22', unread: false},
        {title: 'You are going to loose?', type: 'warning', text: 'Message #23', unread: false},
        {title: 'Current objective is done', type: 'info', text: 'Message #24', unread: false},
        {title: 'What is the objective?', type: 'info', text: 'Message #25', unread: false},
        {title: 'We detect a submarine?', type: 'danger', text: 'Message #26', unread: false}
    ];

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
            message.show('info', 'Notification', ('User is ' + (isSaved ? 'SAVED' : 'NOT SAVED')));
        });
    };

    $scope.showModalMessage = function () {
        message.show('success', 'Test message', 'Text Message');
    };

    $scope.showModalMessageList = function () {
        message.showList($scope.messages);
    };

    $scope.showModalConfirm = function () {
        message.show('info', 'Test message', 'Text Message', true).result.then(
            function () {
                message.show('success', 'Yes!', 'You pushed yes button');
            },

            function () {
                message.show('danger', 'No!', 'You pushed no button');
            }
        );
    };
});
