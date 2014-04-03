angular.module('mustard.app.settings', [
    'mustard.game.audio'
])

/**
 * @module Settings
 * @class SettingsCtrl (controller)
 */
.controller('SettingsCtrl', function ($scope, audio) {
    $scope.volume = audio.volume();

    $scope.$watch('volume', function (newValue) {
        audio.volume(newValue);
    });
});
