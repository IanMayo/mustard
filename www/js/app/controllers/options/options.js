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

    /**
     * Watch on the sfx volume indicator and change it in sound service
     */
    $scope.$watch('options.sfx', function (value) {
        sound.volume('sfx', value * 0.2);
    });

    /**
     * Watch on the music volume indicator and change it in sound service
     */
    $scope.$watch('options.music', function (value) {
        sound.volume('music', value * 0.2);
    });
});
