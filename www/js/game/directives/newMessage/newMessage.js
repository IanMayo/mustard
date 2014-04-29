/**
 * @module mustard.game.newMessage
 */

angular.module('mustard.game.newMessage', ['mustard.game.message'])

/**
 * New message directive
 * It takes the message collection and indicate if there are new messages
 */
.directive('newMessage', ['message', function (message) {

    return {
        restrict: 'EA',
        templateUrl: 'js/game/directives/newMessage/newMessage.tpl.html',

        scope: {
            messages: '='
        },

        link: function (scope) {

            /**
             * New message button active state
             *
             * @type {Boolean}
             */
            scope.isActive = false;

            /**
             * It watches on message collection length and activate the new message button if length is changed
             */
            scope.$watch('messages.length', function (newValue, oldValue) {
                scope.isActive = newValue > oldValue;
            });

            /**
             * It shows message list and deactivate the new message button
             */
            scope.showMessageList = function () {
                message.showList(scope.messages);
                scope.isActive = false;
            };
        }
    };
}]);
