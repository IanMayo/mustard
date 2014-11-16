angular.module('subtrack90.app.options', [
    'subtrack90.app.user',
    'subtrack90.app.soundManager'
])

/**
 * @module Options
 * @class OptionsCtrl (controller)
 */
.controller('OptionsCtrl', function (APP_DEBUG, $scope, user, soundManager) {

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
    $scope.$watchCollection('options', function (newOptions) {
        user.setOptions(newOptions);
    });

    /**
     * Let's watch on the musicEnabled user option and play/stop the background music if it's changed
     */
    $scope.$watch('options.music', function (musicVol) {
        !!musicVol ? soundManager.playBackgroundSound() : soundManager.stopBackgroundSound();
    });
});
