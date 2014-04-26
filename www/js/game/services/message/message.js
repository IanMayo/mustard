/**
 * @module Message service
 */

angular.module('mustard.game.message', [])

.factory('message', function ($modal) {

    /**
     * Default message options
     *
     * @type {Object}
     */
    var messageOptions = {
        templateUrl: 'js/game/services/message/message.tpl.html',
        controller: messageController
    };

    /**
     * Default message list options
     *
     * @type {Object}
     */
    var messageListOptions = {
        templateUrl: 'js/game/services/message/messageList.tpl.html',
        controller: messageListController
    };

    /**
     * Modal instance controller
     *
     * @param $scope
     * @param $modalInstance
     * @param messageData
     */
    function messageController ($scope, $modalInstance, messageData) {
        $scope.messageData = messageData;

        $scope.ok = function () {
            $modalInstance.close('ok');
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    /**
     * Modal instance controller for the message list
     *
     * @param $scope
     * @param $modalInstance
     * @param messages
     */
    function messageListController ($scope, $modalInstance, messages) {
        $scope.messages = messages;

        $scope.ok = function () {
            $modalInstance.close('ok');
        };
    }

    return {
        /**
         * It shows modal popup window with "blocking" background
         *
         * @param type
         * @param title
         * @param text
         * @param confirm
         * @returns {Object} it returns $modalInstance
         */
        show: function (type, title, text, confirm) {

            return $modal.open(angular.extend(messageOptions, {
                backdrop: confirm ? 'static': true,

                resolve: {
                    messageData: function () {
                        return {
                            type: type,
                            title: title,
                            text: text,
                            confirm: !!confirm
                        };
                    }
                }
            }));
        },

        /**
         * It shows modal popup window with "blocking" background that contains message list
         *
         * @param messages
         * @returns {Object} it returns $modalInstance
         */
        showList: function (messages) {

            return $modal.open(angular.extend(messageListOptions, {
                resolve: {
                    messages: function () {
                        return messages;
                    }
                }
            }));
        }
    };
});
