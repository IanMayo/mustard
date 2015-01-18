angular.module('subtrack90.app.main', ['subtrack90.app.user'])

/**
 * @module Main
 * @class MainCtrl (controller)
 */
.controller('MainCtrl', function ($scope, $location, user, levels) {

    /** prototype version of the player state object
     *
     * @type {{name: string, achievements: *[], missions: *[]}}
     */
    $scope.player = user;

    /** prototype version of the mission index. Hopefully we will be able to automatically extract this
     * from the scenarios folder in some node/grunt script
     *
     * @type {*[]}
     */
    $scope.levels = levels;


    /**
     * Missions collection
     *
     * @type {Array}
     */
    var userMissions = user.getMissions();


    /**
     * Check if level has only "LOCKED" missions and if it's true let's show its name redacted
     *
     * @param id
     * @returns {boolean}
     */
    $scope.isLockedLevel = function (id) {
        var isLocked = true;
        var level = _.findWhere($scope.player.levels, {id: id}) || {};

        _.every(level.missions, function (mission) {
            isLocked = mission.status === 'LOCKED';

            return isLocked;
        });

        return isLocked;
    };

    /** whether the specified mission is available to the user
     *
     * @param id the mission id
     * @returns {boolean}  is-complete
     */
    $scope.isLocked = function (id) {
        var res = null;

        // ok, lookup this id in the player achievements
        var found = _.find(userMissions, function (ach) {
            return ach.id == id;
        });

        // has this level been tried?
        if (found) {
            switch (found.status) {
                case "SUCCESS":
                case "FAILURE":
                case "UNLOCKED":
                    res = false;
                    break;
                case "LOCKED":
                    res = true;
                    break;
            }
        }

        // fallback - if we don't know about the layer, just lock it
        if (res === null) {
            res = true;
        }

        return res;
    };

    /**
     * Return specific glyph-icon class by mission status
     *
     * @param id of mission
     * @returns {String}
     */
    $scope.glyphForMission = function (id) {
        switch (_.findWhere(userMissions, {id: id}).status) {
            case 'SUCCESS':
                return 'glyphicon-handwritten-ok';
            case 'LOCKED':
                return 'glyphicon-lock';
            default:
                return 'glyphicon-empty';
        }
    };

    /** navigate to the specified URL, if the mission is available to the current user
     *
     * @param id
     */
    $scope.moveToMission = function (id) {
        if (!$scope.isLocked(id)) {
            $location.path('mission/' + id);
        }
    };

});
