angular.module('subtrack90.app.options', [
    'subtrack90.app.user',
    'subtrack90.app.sound'
])

/**
 * @module Options
 * @class OptionsCtrl (controller)
 */
.controller('OptionsCtrl', function (APP_DEBUG, $scope, user, sound) {

    /**
     * Debug flag
     */
    $scope.appDebug = APP_DEBUG;

    /**
     * Local options model
     */
    $scope.options = angular.extend({
        music: 0,
        sfx: 0,
        language: "EN"
    }, user.options);

    /**
     * Watches on the local options model and changes the user's one
     */
    $scope.$watchCollection('options', function (value) {
        user.setOptions(value);
    });
});
