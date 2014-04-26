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
    var mockMessages = [
        {title: 'You achieve something', type: 'info', text: 'Message #1'},
        {title: 'Something happened', type: 'danger', text: 'Message #2'},
        {title: 'Warning message', type: 'warning', text: 'Message #3'},
        {title: 'Your ship is upgraded', type: 'info', text: 'Message #4'},
        {title: 'Missile launched', type: 'danger', text: 'Message #5'},
        {title: 'You have something weird on your ship', type: 'warning', text: 'Message #6'},
        {title: 'Another achievement ', type: 'info', text: 'Message #7'},
        {title: 'You are drowning', type: 'danger', text: 'Message #8'},
        {title: 'Gud Luck!', type: 'info', text: 'Message #9'},
        {title: 'Hey it is another warning message', type: 'warning', text: 'Message #10'},
        {title: 'Missile launched but it missed', type: 'danger', text: 'Message #11'},
        {title: 'Buy something in our shop', type: 'info', text: 'Message #12'},
        {title: 'You have bought easter skinn for your ship', type: 'info', text: 'Message #13'},
        {title: 'Watch out!', type: 'warning', text: 'Message #14'},
        {title: 'Happy Easter!', type: 'info', text: 'Message #15'},
        {title: 'Something is coming from sky ... UFO', type: 'danger', text: 'Message #16'},
        {title: 'You have just bitten the record', type: 'info', text: 'Message #17'},
        {title: 'Game tricks wanna read?', type: 'info', text: 'Message #18'},
        {title: 'Your ship is out of course!', type: 'danger', text: 'Message #19'},
        {title: 'Ship is ready to go', type: 'info', text: 'Message #20'},
        {title: 'Hey something is happening', type: 'warning', text: 'Message #21'},
        {title: 'Another info message', type: 'info', text: 'Message #22'},
        {title: 'You are going to loose?', type: 'warning', text: 'Message #23'},
        {title: 'Current objective is done', type: 'info', text: 'Message #24'},
        {title: 'What is the objective?', type: 'info', text: 'Message #25'},
        {title: 'We detect a submarine?', type: 'danger', text: 'Message #26'}
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
        message.showList(mockMessages);
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
