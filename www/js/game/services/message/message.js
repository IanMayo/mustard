/**
 * @module Message service
 */

angular.module('mustard.app.message', [])

.factory('message', function ($modal) {

    /**
     * Modal instance controller
     *
     * @param $scope
     * @param $modalInstance
     * @param messageData
     */
    var modalInstanceController = function ($scope, $modalInstance, messageData) {
        $scope.messageData = messageData;

        $scope.ok = function () {
            $modalInstance.dismiss('ok');
        };
    };

    /**
     * Default modal options
     *
     * @type {Object}
     */
    var modalOptions = {
        templateUrl: 'js/game/services/message/message.html',
        controller: modalInstanceController
    };

    return {
        /**
         * It shows modal popup window with "blocking" background
         *
         * @param type
         * @param title
         * @param text
         * @returns {Object} it returns $modalInstance
         */
        showModal: function (type, title, text) {

            return $modal.open(angular.extend(modalOptions, {
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
        }
    };
});
