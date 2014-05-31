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
            messages: '=',
            hasNew: '='
        },

        link: function (scope) {
            /**
             * Watches on messages length and switch the value of hasNew flag
             */
            scope.$watch('messages.length', function (newValue, oldValue) {
                scope.hasNew = newValue > oldValue;
            });
        }
    };
});
