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
     * Mission failed modal message options
     *
     * @type {Object}
     */
    var missionFailedOptions = {
        templateUrl: 'js/game/services/message/missionFailed.tpl.html',
        backdrop: 'static',
        controller: missionFailedController
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

        $scope.review = function () {
            missionCompleteData.review();
            $modalInstance.close('ok');
        };

        $scope.next = function () {
            missionCompleteData.next();
            $modalInstance.close('ok');
        };
    }

    /**
     * Modal instance controller for the "mission complete" message
     *
     * @param $scope
     * @param $modalInstance
     * @param missionFailedData
     */
    function missionFailedController ($scope, $modalInstance, missionFailedData) {

        $scope.objectives = missionFailedData.objectives;

        $scope.menu = function () {
            missionFailedData.menu();
            $modalInstance.close('ok');
        };

        $scope.brief = function () {
            missionFailedData.brief();
            $modalInstance.close('ok');
        };

        $scope.replay = function () {
            missionFailedData.replay();
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
         *         // review mission
         *     }
         *     function () {
         *         // next mission
         *     },
         * ).result.then(function () {
         *     // popup is closed
         * });
         *
         * @param objectives
         * @param achievements
         * @param menuCb main menu callback
         * @param reviewCb review mission callback
         * @param nextCb next mission callback
         * @returns {Object}
         */
        showMissionComplete: function (objectives, achievements, menuCb, reviewCb, nextCb) {

            return $modal.open(angular.extend(missionCompleteOptions, {
                resolve: {
                    missionCompleteData: function () {
                        return {
                            objectives: objectives,
                            achievements: achievements,
                            menu: angular.isFunction(menuCb) ? menuCb : angular.noop,
                            review: angular.isFunction(reviewCb) ? reviewCb : angular.noop,
                            next: angular.isFunction(nextCb) ? nextCb : angular.noop
                        }
                    }
                }
            }));
        },

        /**
         * It shows the modal popup window with proper controls when user failed some mission
         *
         * @example
         * message.showMissionComplete(
         *     [{}], // objectives collection
         *     function () {
         *         // main menu
         *     },
         *     function () {
         *         // brief mission
         *     }
         *     function () {
         *         // replay mission
         *     },
         * ).result.then(function () {
         *     // popup is closed
         * });
         *
         * @param objectives
         * @param menuCb main menu callback
         * @param briefCb review mission callback
         * @param replayCb next mission callback
         * @returns {Object}
         */
        showMissionFailed: function (objectives, menuCb, briefCb, replayCb) {

            return $modal.open(angular.extend(missionFailedOptions, {
                resolve: {
                    missionFailedData: function () {
                        return {
                            objectives: objectives,
                            menu: angular.isFunction(menuCb) ? menuCb : angular.noop,
                            brief: angular.isFunction(briefCb) ? briefCb : angular.noop,
                            replay: angular.isFunction(replayCb) ? replayCb : angular.noop
                        }
                    }
                }
            }));
        }
    };
});
