/**
 * @module mustard.game.messageList
 */

angular.module('mustard.game.messageList', [])

/**
 * Message list directive
 */
.directive('messageList', function () {

    return {
        restrict: 'EA',
        templateUrl: 'js/game/directives/messageList/messageList.tpl.html',

        scope: {
            messages: '='
        },

        link: function (scope) { }
    };
});
