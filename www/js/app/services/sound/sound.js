/**
 * @module Sound service
 *
 * @description This is the wrapper service for html5audio & native mobile audio libs
 */

angular.module('subtrack90.app.sound', ['ngCordova'])

.factory('sound', function (IS_CORDOVA, $cordovaNativeAudio) {

    /**
     * Audio wrapper for howler.js lib
     *
     * @type {Object}
     */
    var html5Audio = {
        play: function (path, volume) {
            new Howl({
                urls: [path],
                volume: volume
            }).play();
        },

        loop: function (path, volume) {
            new Howl({
                urls: [path],
                loop: true,
                volume: volume
            }).play();
        },

        volume: function (value) {
            Howler.volume(value);
        }
    };

    /**
     * Audio wrapper for native mobile audio plugin which is based on
     * https://github.com/SidneyS/cordova-plugin-nativeaudio
     * http://ngcordova.com/docs/#NativeAudio
     *
     * @type {Object}
     */
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
