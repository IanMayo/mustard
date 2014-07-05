angular.module('mustard.app.userProfile', [
    'mustard.app.user'
])

/**
 * @module Profile
 * @class ProfileCtrl (controller)
 */
.controller('ProfileCtrl', function ($scope, user) {
    /**
     * User's achievements
     *
     * @type {Array}
     */
    $scope.achievements = user.achievements;

    /**
     * Complete user's missions
     *
     * @type {Array}
     */
    $scope.completeMissions = _.where(user.getMissions(), {status: 'SUCCESS'});
});
