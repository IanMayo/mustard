/**
 * @module Sound service
 *
 * @description This is the wrapper service for html5audio & native mobile audio libs
 */

angular.module('subtrack90.app.sound', ['ngCordova'])

.factory('sound', function (IS_CORDOVA, $cordovaNativeAudio) {

    var html5Audio = {
        play: function (path) {

        },

        loop: function (path) {

        },

        volume: function (value) {

        }
    };

    var mobileAudio = {
        play: function (path) {

        },

        loop: function (path) {

        },

        volume: function (value) {

        }
    };

    return IS_CORDOVA ? mobileAudio : html5Audio
});
