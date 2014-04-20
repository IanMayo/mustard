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
        templateUrl: 'js/game/services/modal/modalMessage.html',
        controller: modalInstanceController
    };

    /**
     * Modal instance controller
     *
     * @param $scope
     * @param $modalInstance
     * @param messageData
     */
    function modalInstanceController ($scope, $modalInstance, messageData) {
        $scope.messageData = messageData;

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
        }
    };
});
