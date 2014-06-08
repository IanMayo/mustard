angular.module('mustard.app.options', ['mustard.app.user'])

/**
 * @module Options
 * @class OptionsCtrl (controller)
 */
.controller('OptionsCtrl', function ($scope, user) {

    /**
     * Local options model
     */
    $scope.options = angular.extend({
        audio: 0,
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
