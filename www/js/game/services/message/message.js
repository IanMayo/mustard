/**
 * @module Message service
 */

angular.module('mustard.app.message', [])

.factory('message', function ($modal) {

    var ModalInstanceController = function ($scope, $modalInstance, messageData) {
        $scope.messageData = messageData;

        $scope.ok = function () {
            $modalInstance.dismiss('ok');
        };
    };

    var modalOptions = {
        templateUrl: 'js/game/services/message/message.html',
        controller: ModalInstanceController
    };

    return {
        showModal: function (type, title, text) {
            var messageData = {
                type: type,
                title: title,
                text: text
            };

            return $modal.open(angular.extend(modalOptions, {
                resolve: {
                    messageData: function () {
                        return messageData;
                    }
                }
            }));
        }
    };
});
