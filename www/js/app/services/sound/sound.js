/**
 * @module Sound service
 *
 * @description This is the wrapper service for html5audio & native mobile audio libs
 */

angular.module('subtrack90.app.sound', ['ngCordova', ''])

.factory('sound', function (IS_CORDOVA, $cordovaNativeAudio, AudioService) {

    return {
        play: function (path) {

        },

        loop: function (path) {

        },

        volume: function (value) {

        }
    }
});
