angular.module('subtrack90.app.options', [
    'subtrack90.app.user',
    'subtrack90.app.sound',
    'subtrack90.app.soundManager'
])

/**
 * @module Options
 * @class OptionsCtrl (controller)
 */
.controller('OptionsCtrl', function (IS_MOBILE, IS_CORDOVA, APP_DEBUG, $scope, user, sound, soundManager) {

    /**
     * Debug flag
     */
    $scope.appDebug = APP_DEBUG;

    /**
     * Disable music volume control if user uses mobile browser
     * TODO: remove it when mobile browsers will fully support howler lib
     *
     * @type {Boolean}
     */
    $scope.disableMusicControl = !IS_CORDOVA && IS_MOBILE;

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

    /**
     * Play robot blip sound when we change the sfx volume
     */
    $scope.$watch('options.sfx', function (sfxVol, oldSfxVol) {
        sfxVol !== oldSfxVol && sound.play('robot-blip');
    });
});
