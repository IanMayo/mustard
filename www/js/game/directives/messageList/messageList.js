/**
 * @module mustard.game.messageList
 */

angular.module('mustard.game.messageList', ['ngAnimate'])

/**
 * It adds .new class to the new item in the message list and removes the class after 3sec
 */
.animation('.message', function ($timeout) {
    return {
        enter: function (element, done) {
            element.addClass('new');

            $timeout(function() {
                element.removeClass('new');
                done();
            }, 3000);
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
