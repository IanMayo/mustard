/**
 * @module Sound service
 *
 * @description This is the wrapper service for html5audio & native mobile audio services
 */

angular.module('subtrack90.app.sound', ['ngCordova'])

/**
 * Default volume level
 */
.constant('DEFAULT_VOLUME', 1)

/**
 * Default amount of overlapping sounds
 */
.constant('DEFAULT_VOICES', 10)

.factory('sound', function (IS_CORDOVA, DEFAULT_VOLUME, DEFAULT_VOICES, $cordovaNativeAudio) {

    /**
     * Map that should contain sound ids and their instances/paths
     *
     * @type {Array}
     */
    var soundMap = [];

    /**
     * Play html5audio sound instance
     *
     * @param id
     * @param inLoop
     * @returns {{stop: function}}
     */
    var html5AudioPlay = function (id, inLoop) {
        var soundMapItem = _.findWhere(soundMap, {id: id});

        if (!soundMapItem) {
            return {stop: angular.noop};
        }

        var sound = soundMapItem.instance;
        sound.volume(DEFAULT_VOLUME);
        sound.loop(inLoop);
        sound.play();

        return {stop: sound.stop.bind(sound)};
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
         * @example
         * sound.loadSoundMap([
         *     {id: 'torpedo', path: 'audio/TorpedoLaunch.mp3', type: 'sfx'},
         *     {id: 'alarm', path: 'audio/Alarm.mp3', type: 'sfx'},
         *     {id: 'music', path: 'audio/DarkNoise.mp3', type: 'music'}
         * ]);
         *
         * @param map of sounds
         */
        loadSoundMap: function (map) {
            html5Audio.unloadSoundMap();

            angular.forEach(map, function (sound) {
                soundMap.push({
                    id: sound.id,
                    type: sound.type,
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
            angular.forEach(soundMap, function(sound) {
                sound.instance.stop();
            });

            soundMap = [];
        },

        /**
         * Play sound from sound map
         *
         * @example
         * var instance = sound.play('alert');
         * instance.stop();
         *
         * @param id of sound in preloaded map
         * @returns {Object}
         */
        play: function (id) {
            return html5AudioPlay(id, false);
        },

        /**
         * Play sound from sound map in a loop
         *
         * @example
         * var instance = sound.loop('noise');
         * instance.stop();
         *
         * @param id of sound in preloaded map
         * @returns {Object}
         */
        loop: function (id) {
            return html5AudioPlay(id, true);
        },

        /**
         * Set sfx and music volume
         *
         * @param type of sound
         * @param value of volume
         */
        volume: function (type, value) {
            var sounds = _.where(soundMap, {type: type});

            angular.forEach(sounds, function (sound) {
                sound.instance.volume(value || DEFAULT_VOLUME);
            });
        }
    };

    /**
     * This is the value of global mobile audio volume,
     * it is needed just to simulate proper behaviour
     *
     * @type {Number}
     */
    var globalMobileVolume = 0;

    /**
     * Audio wrapper for native mobile audio plugin which is based on
     * https://github.com/SidneyS/cordova-plugin-nativeaudio
     * http://ngcordova.com/docs/#NativeAudio
     *
     * @type {Object}
     */
    var mobileAudio = {
        /**
         * Load sounds by passed map
         *
         * @example
         * sound.loadSoundMap([
         *     {id: 'torpedo', path: 'audio/TorpedoLaunch.mp3'},
         *     {id: 'alarm', path: 'audio/Alarm.mp3'},
         *     {id: 'music', path: 'audio/DarkNoise.mp3'}
         * ]);
         *
         * @param map of sounds
         */
        loadSoundMap: function (map) {
            mobileAudio.unloadSoundMap();
            soundMap = angular.isArray(map) ? map : [];

            angular.forEach(soundMap, function (sound) {
                $cordovaNativeAudio
                    .preloadComplex(sound.id, sound.path, globalMobileVolume || DEFAULT_VOLUME, DEFAULT_VOICES);
            });
        },

        /**
         * Destroy sound map and unload sounds
         */
        unloadSoundMap: function () {
            angular.forEach(soundMap, function (sound) {
                $cordovaNativeAudio.unload(sound.id);
            });

            soundMap = [];
        },

        /**
         * Play sound by its id in sound map
         *
         * @example
         * var instance = sound.play('torpedo', 0.5);
         * instance.stop();
         *
         * @param id of sound
         * @param volume level for sound
         * @returns {{stop: function}}
         */
        play: function (id, volume) {
            $cordovaNativeAudio.setVolumeForComplexAsset(id, globalMobileVolume || volume || DEFAULT_VOLUME);
            $cordovaNativeAudio.play(id);
            
            return {stop: $cordovaNativeAudio.stop.bind($cordovaNativeAudio, id)}
        },

        /**
         * Play particular sound in a loop
         *
         * @example
         * var instance = sound.loop('music', 0.2);
         * instance.stop();
         *
         * @param id of sound
         * @param volume level for sound
         * @returns {{stop: function}}
         */
        loop: function (id, volume) {
            $cordovaNativeAudio.setVolumeForComplexAsset(id, globalMobileVolume || volume || DEFAULT_VOLUME);
            $cordovaNativeAudio.loop(id);

            return {stop: $cordovaNativeAudio.stop.bind($cordovaNativeAudio, id)}
        },

        /**
         * Set sfx and music volume
         *
         * @param type of sound
         * @param value of volume
         */
        volume: function (type, value) {
            angular.forEach(soundMap, function (sound) {
                $cordovaNativeAudio.setVolumeForComplexAsset(sound.id, value || DEFAULT_VOLUME);
            })
        }
    };

    /**
     * Make hard decision which service we want to use
     */
    return IS_CORDOVA ? mobileAudio : html5Audio
});
