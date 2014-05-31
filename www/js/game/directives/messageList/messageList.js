/**
 * @module mustard.game.messageList
 */

angular.module('mustard.game.messageList', ['ngAnimate'])

.animation('.new-message', function ($timeout) {
    return {
        enter: function (element, done) {
            element.addClass('new');

            $timeout(function() {
                element.removeClass('new');
                done();
            }, 15000);
        }
    };
})

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
        }
    };
});
