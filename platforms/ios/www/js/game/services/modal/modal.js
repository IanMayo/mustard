/**
 * @module Modal service
 */

angular.module('mustard.game.modal', [])

.factory('modal', function ($modal) {

    /**
     * Default modal message options
     *
     * @type {Object}
     */
    var modalMessageOptions = {
        templateUrl: 'js/game/services/modal/modalMessage.tpl.html',
        controller: modalMessageController
    };

    /**
     * Default modal message list options
     *
     * @type {Object}
     */
    var modalMessageListOptions = {
        templateUrl: 'js/game/services/modal/modalMessageList.tpl.html',
        controller: modalMessageListController
    };

    /**
     * Modal instance controller
     *
     * @param $scope
     * @param $modalInstance
     * @param messageData
     */
    function modalMessageController ($scope, $modalInstance, messageData) {
        $scope.messageData = messageData;

        $scope.ok = function () {
            $modalInstance.dismiss('ok');
        };
    }

    /**
     * Modal instance controller
     *
     * @param $scope
     * @param $modalInstance
     * @param messages
     */
    function modalMessageListController ($scope, $modalInstance, messages) {
        $scope.messages = messages;

        $scope.ok = function () {
            $modalInstance.dismiss('ok');
        };
    }

    return {
        /**
         * It shows modal popup window with "blocking" background
         *
         * @param type
         * @param title
         * @param text
         * @returns {Object} it returns $modalInstance
         */
        showMessage: function (type, title, text) {

            return $modal.open(angular.extend(modalMessageOptions, {
                resolve: {
                    messageData: function () {
                        return {
                            type: type,
                            title: title,
                            text: text
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
        showMessageList: function (messages) {

            return $modal.open(angular.extend(modalMessageListOptions, {
                resolve: {
                    messages: function () {
                        return messages;
                    }
                }
            }));
        }
    };
});
