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
     * Mission complete modal message options
     *
     * @type {Object}
     */
    var missionCompleteOptions = {
        templateUrl: 'js/game/services/message/missionComplete.tpl.html',
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
     * @param missionCompleteData
     */
    function missionCompleteController ($scope, $modalInstance, missionCompleteData) {

        $scope.objectives = missionCompleteData.objectives;
        $scope.achievements = missionCompleteData.achievements;

        $scope.menu = function () {
            missionCompleteData.menu();
            $modalInstance.close('ok');
        };

        $scope.next = function () {
            missionCompleteData.next();
            $modalInstance.close('ok');
        };

        $scope.review = function () {
            missionCompleteData.review();
            $modalInstance.close('ok');
        }
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
         * It shows the modal popup window with proper controls when user complete some mission
         * also it can show the list of user achievements which were achieved in the mission
         *
         * @example
         * message.showMissionComplete(
         *     [{}], // objectives collection
         *     [{}], // achievements collection
         *     function () {
         *         // main menu
         *     },
         *     function () {
         *         // next mission
         *     },
         *     function () {
         *         // review mission
         *     }
         * ).result.then(function () {
         *     // popup is closed
         * });
         *
         * @param objectives
         * @param achievements
         * @param menuCb main menu callback
         * @param nextCb next mission callback
         * @param reviewCb review mission callback
         * @returns {Object}
         */
        showMissionComplete: function (objectives, achievements, menuCb, nextCb, reviewCb) {

            return $modal.open(angular.extend(missionCompleteOptions, {
                resolve: {
                    missionCompleteData: function () {
                        return {
                            objectives: objectives,
                            achievements: achievements,
                            menu: angular.isFunction(menuCb) ? menuCb : angular.noop,
                            next: angular.isFunction(nextCb) ? nextCb : angular.noop,
                            review: angular.isFunction(reviewCb) ? reviewCb : angular.noop
                        }
                    }
                }
            }));
        }
    };
});
