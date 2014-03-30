angular.module('mustard.app.main', ['mustard.app.user'])

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


    /** whether the specified mission is available to the user
     *
     * @param id the mission id
     * @returns {boolean}  is-complete
     */
    var isLocked = function (id) {
        var res = null;

        // ok, lookup this id in the player achievements
        var found = _.find($scope.player.missions, function (ach) {
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

    /** navigate to the specified URL, if the mission is avaialble to the current user
     *
     * @param id
     */
    $scope.moveToMission = function (id) {
        if (!isLocked(id)) {
            $location.path('mission/' + id);
        }
    };

    /** whether the specified mission is has been completed by this user
     *
     * @param id the mission id
     * @returns {String}  the glyph to use
     */
    $scope.glyphFor = function (id) {
        var res = false;
        // ok, lookup this id in the player achievemtns
        var found = _.find($scope.player.missions, function (ach) {
            return ach.id == id;
        });

        // has this level been tried?
        if (found) {
            switch (found.status) {
                case "SUCCESS":
                    res = "glyphicon glyphicon-check";
                    break;
                case "UNLOCKED":
                    res = "glyphicon glyphicon-unchecked";
                    break;
                case "FAILURE":
                    res = "glyphicon glyphicon-unchecked";
                    break;
                case "LOCKED":
                    res = "glyphicon glyphicon-lock";
                    break;
            }
        }

        // fallback - just lock it
        if (!res) {
            res = "glyphicon glyphicon-lock";
        }

        return res;
    };

});
