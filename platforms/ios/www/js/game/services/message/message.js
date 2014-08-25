/**
 * @module Message service
 */

angular.module('subtrack90.game.message', [])

.factory('message', function ($modal) {

    /**
     * Default message options
     *
     * @type {Object}
     */
    var messageOptions = {
        templateUrl: 'js/game/services/message/message.tpl.html',
        backdrop: 'static',
        controller: messageController
    };

    /**
     * Default message list options
     *
     * @type {Object}
     */
    var messageListOptions = {
        templateUrl: 'js/game/services/message/messageList.tpl.html',
        backdrop: 'static',
        controller: messageListController
    };

    /**
     * Mission finish modal message options
     *
     * @type {Object}
     */
    var missionFinishOptions = {
        templateUrl: 'js/game/services/message/missionFinish.tpl.html',
        backdrop: 'static',
        controller: missionCompleteController
    };

    /**
     * Modal instance controller for the message
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

    /**
     * Modal instance controller for the "mission complete" message
     *
     * @param $scope
     * @param $modalInstance
     * @param config
     */
    function missionCompleteController ($scope, $modalInstance, config) {
        $scope.config = config;

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
        },

        /**
         * It shows the modal popup window with proper controls when user finish some mission
         * also it can show the list of user achievements which were achieved in the mission
         *
         * @example
         * message.finishMission({
         *     title: 'Mission Accomplished',
         *     icon: 'glyphicon-add',
         *     achievements: [{name: 'Speed Demon'}],
         *     buttons: [
         *         {
         *             text: 'Main Menu',
         *             type: 'default',
         *             handler: function () {
         *                 $location.path('/main');
         *             }
         *         },
         *         {
         *             text: 'Review',
         *             type: 'warning',
         *             handler: function () {
         *                 console.log('Review call');
         *             }
         *         },
         *         {
         *             text: 'Next Mission',
         *             type: 'success',
         *             handler: function () {
         *                 console.log('Next Mission call');
         *             }
         *         }
         *     ]
         * }).result.then(function () {
         *     console.log('popup was closed');
         * });
         *
         * @param missionFinishConfig mission finish option parameters
         * @returns {Object}
         */
        finishMission: function (missionFinishConfig) {

            return $modal.open(angular.extend(missionFinishOptions, {
                resolve: {
                    config: function () {
                        return missionFinishConfig;
                    }
                }
            }));
        }
    };
});
