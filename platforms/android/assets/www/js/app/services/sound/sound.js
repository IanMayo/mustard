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
     * Volume level of sfx and music sounds
     *
     * @type {Object}
     */
    var volumeLevel = {
        sfx: 0,
        music: 0
    };

    /**
     * Return correct volume level for sound by its type
     *
     * @param sound
     */
    var getVolumeLevelForSound = function (sound) {
        return volumeLevel[sound.type];
    };

    /**
     * Set particular volume level by sound type
     *
     * @param type of sound
     * @param volume level of sound
     */
    var setVolumeLevelBySoundType = function (type, volume) {
        volumeLevel[type] = volume;
    };

    /**
     * Play html5audio sound instance
     *
     * @param id
     * @param inLoop
     * @returns {{stop: function, resume: function}}
     */
    var html5AudioPlay = function (id, inLoop) {
        var soundMapItem = _.findWhere(soundMap, {id: id});

        if (!soundMapItem) {
            return {stop: angular.noop, resume: angular.noop};
        }

        var sound = soundMapItem.instance;
        sound.volume(getVolumeLevelForSound(soundMapItem));
        sound.loop(inLoop);
        sound.play();

        return {
            stop: sound.stop.bind(sound),
            resume: sound.play.bind(sound)
        };
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
         * instance.resume();
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
         * instance.resume();
         *
         * @param id of sound in preloaded map
         * @returns {Object}
         */
        loop: function (id) {
            return html5AudioPlay(id, true);
        },

        /**
         * Set sfx or music volume
         *
         * @param type of sound
         * @param value of volume
         */
        volume: function (type, value) {
            var sounds = _.where(soundMap, {type: type});

            setVolumeLevelBySoundType(type, value);

            angular.forEach(sounds, function (sound) {
                sound.instance.volume(getVolumeLevelForSound(sound));
            });
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
        /**
         * Load sounds by passed map
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
            mobileAudio.unloadSoundMap();
            soundMap = angular.isArray(map) ? map : [];

            angular.forEach(soundMap, function (sound) {
                $cordovaNativeAudio
                    .preloadComplex(sound.id, sound.path, DEFAULT_VOLUME, DEFAULT_VOICES);
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
         * var instance = sound.play('torpedo');
         * instance.stop();
         * instance.resume();
         *
         * @param id of sound
         * @returns {{stop: function, resume: function}}
         */
        play: function (id) {
            var sound = _.findWhere(soundMap, {id: id});

            $cordovaNativeAudio.setVolumeForComplexAsset(id, getVolumeLevelForSound(sound));
            $cordovaNativeAudio.play(id);

            return {
                stop: $cordovaNativeAudio.stop.bind($cordovaNativeAudio, id),
                resume: $cordovaNativeAudio.play.bind($cordovaNativeAudio, id)
            }
        },

        /**
         * Play particular sound in a loop
         *
         * @example
         * var instance = sound.loop('music');
         * instance.stop();
         * instance.resume();
         *
         * @param id of sound
         * @returns {{stop: function, resume: function}}
         */
        loop: function (id) {
            var sound = _.findWhere(soundMap, {id: id});

            $cordovaNativeAudio.setVolumeForComplexAsset(id, getVolumeLevelForSound(sound));
            $cordovaNativeAudio.loop(id);

            return {
                stop: $cordovaNativeAudio.stop.bind($cordovaNativeAudio, id),
                resume: $cordovaNativeAudio.loop.bind($cordovaNativeAudio, id)
            }
        },

        /**
         * Set sfx or music volume
         *
         * @param type of sound
         * @param value of volume
         */
        volume: function (type, value) {
            var sounds = _.where(soundMap, {type: type});

            setVolumeLevelBySoundType(type, value);

            angular.forEach(sounds, function (sound) {
                $cordovaNativeAudio.setVolumeForComplexAsset(sound.id, getVolumeLevelForSound(sound));
            })
        }
    };

    /**
     * Make hard decision which service we want to use
     */
    return IS_CORDOVA ? mobileAudio : html5Audio
});
