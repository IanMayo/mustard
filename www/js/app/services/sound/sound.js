/**
 * @module Sound service
 *
 * @description This is the wrapper service for html5audio & native mobile audio libs
 */

angular.module('subtrack90.app.sound', ['ngCordova'])

.factory('sound', function (IS_CORDOVA, $cordovaNativeAudio, $q) {

    /**
     * Audio wrapper for howler.js lib
     *
     * @type {Object}
     */
    var html5Audio = {

        /**
         * Play sound
         *
         * @param path
         * @param volume
         * @returns {promise}
         */
        play: function (path, volume) {
            var deferred = $q.defer();

            var sound = new Howl({
                urls: [path],
                volume: volume
            }).play();

            deferred.resolve({stop: sound.stop.bind(sound)});

            return deferred.promise;
        },

        /**
         * Play sound in loop
         *
         * @param path
         * @param volume
         * @returns {promise}
         */
        loop: function (path, volume) {
            var deferred = $q.defer();

            var sound = new Howl({
                urls: [path],
                loop: true,
                volume: volume
            }).play();

            deferred.resolve({stop: sound.stop.bind(sound)});

            return deferred.promise;
        },

        /**
         * Set global volume
         *
         * @param value
         */
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
