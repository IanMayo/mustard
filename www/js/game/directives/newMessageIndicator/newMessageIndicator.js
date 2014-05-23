/**
 * @module mustard.game.newMessageIndicator
 */

angular.module('mustard.game.newMessageIndicator', [])

/**
 * New message indicator directive
 * It takes the message collection and indicate if there are new messages
 */
.directive('newMessageIndicator', function () {

    return {
        restrict: 'EA',
        templateUrl: 'js/game/directives/newMessageIndicator/newMessageIndicator.tpl.html',

        scope: {
            active: '='
        },

        link: function () { }
    };
});
