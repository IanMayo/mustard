/**
 * @module Sound service
 *
 * @description This is the wrapper service for html5audio & native mobile audio libs
 */

angular.module('subtrack90.app.sound', ['ngCordova'])

.constant('DEFAULT_VOLUME', 1)

.factory('sound', function (IS_CORDOVA, DEFAULT_VOLUME, $cordovaNativeAudio, $q) {

    var soundMap = [];

    /**
     * Play html5audio sound instance
     *
     * @param id
     * @param volume
     * @param inLoop
     * @returns {promise}
     */
    var html5AudioPlay = function (id, volume, inLoop) {
        var deferred = $q.defer();
        var soundMapItem = _.findWhere(soundMap, {id: id});

        // check if sound exists and preloaded
        if (!soundMapItem) {
            deferred.resolve({stop: angular.noop});
            return deferred.promise;
        }

        var sound = soundMapItem.instance;
        sound.volume(volume || DEFAULT_VOLUME);
        sound.loop(inLoop);
        sound.play();

        deferred.resolve({stop: sound.stop.bind(sound)});

        return deferred.promise;
    };

    /**
     * Audio wrapper for howler.js lib
     *
     * @type {Object}
     */
    var html5Audio = {

        /**
         * Load html5audio sound map
         *
         * @param map
         */
        loadSoundMap: function (map) {
            html5Audio.unloadSoundMap();

            angular.forEach(map, function (sound) {
                soundMap.push({
                    id: sound.id,
                    instance: new Howl({
                        urls: [sound.path]
                    })
                });
            });
        },

        /**
         * Destroy existing sound map
         */
        unloadSoundMap: function () {
            soundMap = [];
        },

        /**
         * Play sound from sound map
         *
         * @param id
         * @param volume
         * @returns {promise}
         */
        play: function (id, volume) {
            return html5AudioPlay(id, volume, false);
        },

        /**
         * Play sound from sound map in loop
         *
         * @param id
         * @param volume
         * @returns {promise}
         */
        loop: function (id, volume) {
            return html5AudioPlay(id, volume, true);
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
