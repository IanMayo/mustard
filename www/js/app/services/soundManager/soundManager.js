/**
 * @module Sound Manager service
 *
 * @description The main idea of this service is managing of background music and global volume within the whole app
 */

angular.module('subtrack90.app.soundManager', ['subtrack90.app.sound'])

/**
 * We use it to prevent unexpected bugs in $cordovaNativeAudio service
 * and bugs with initialization of mobile Native Audio library
 */
.constant('SOUND_MAP_LOAD_DELAY', 1000)

/**
 * We need this to convert the values from user volume options to the values for sound.volume method
 */
.constant('VOLUME_MULTIPLIER', 0.2)

.factory('soundManager', function (SOUND_MAP_LOAD_DELAY, VOLUME_MULTIPLIER, $timeout, $q, sound) {

    /**
     * Promise which we use to know if the sound map is ready to be used
     */
    var soundMapDeferred = $q.defer();

    /**
     * Background sound instance
     *
     * @type {null|Object}
     */
    var bgSound = null;

    /**
     * It represents if background sound is currently playing
     *
     * @type {Boolean}
     */
    var isBgSoundPlaying = false;

    /**
     * It reflects if we need to play the background sound on the current page
     *
     * @type {Boolean}
     */
    var playBgSoundOnPage = false;

    /**
     * So it shows if background music is enabled by default
     *
     * @type {Boolean}
     */
    var bgSoundEnabled = false;

    return {

        /**
         * Please use it carefully, it loads each sound in the app
         */
        loadAppSounds: function () {
            $timeout(function () {
                sound.loadSoundMap([
                    {id: 'torpedo', path: 'audio/TorpedoLaunch.mp3', type: 'sfx'},
                    {id: 'alarm', path: 'audio/Alarm.mp3', type: 'sfx'},
                    {id: 'noise', path: 'audio/DarkNoise.mp3', type: 'music'},
                    {id: '1sec', path: 'audio/1sec.mp3', type: 'sfx'},
                    {id: 'robot-blip', path: 'audio/Robot_blip-Marianne_Gagnon.mp3', type: 'sfx'},
                    {id: 'sad-thrombone', path: 'audio/Sad_Trombone-Joe_Lamb.mp3', type: 'sfx'},
                    {id: 'ta-da', path: 'audio/Ta_Da-SoundBible.mp3', type: 'sfx'}
                ]);

                // Ok sound map is ready to be used
                $timeout(function () {
                    soundMapDeferred.resolve(true);
                }, SOUND_MAP_LOAD_DELAY);
            }, SOUND_MAP_LOAD_DELAY);
        },

        /**
         * Play background sound trying to avoid creation of extra bg sound instances
         */
        playBackgroundSound: function () {
            var self = this;

            if (isBgSoundPlaying || !bgSoundEnabled || !playBgSoundOnPage) return;

            isBgSoundPlaying = true;

            if (bgSound) {
                bgSound.resume();
                return;
            }

            soundMapDeferred.promise.then(function () {
                if (!playBgSoundOnPage || !bgSoundEnabled) {
                    self.stopBackgroundSound();
                    return;
                }

                bgSound = sound.loop('noise');
            });
        },

        /**
         * Stop the background sound
         */
        stopBackgroundSound: function () {
            isBgSoundPlaying = false;

            bgSound && bgSound.stop();
        },

        /**
         * Set the bgSoundEnabled option based on global music volume option
         *
         * @param musicVol
         */
        enableBackgroundSound: function (musicVol) {
            bgSoundEnabled = !!musicVol;

            !bgSoundEnabled && this.stopBackgroundSound();
        },

        /**
         * Set global sound volume
         *
         * @param sfxVol
         * @param musicVol
         */
        setVolume: function (sfxVol, musicVol) {
            sound.volume('sfx', sfxVol * VOLUME_MULTIPLIER);
            sound.volume('music', musicVol * VOLUME_MULTIPLIER);
        },

        /**
         * We use this to resolve if we need to play the background sound on the particular page
         *
         * @param playBgSound just a boolean flag
         * @returns {promise}
         */
        resolver: function (playBgSound) {
            var deferred = $q.defer();

            playBgSoundOnPage = playBgSound;

            playBgSound
                ? this.playBackgroundSound()
                : this.stopBackgroundSound();
            deferred.resolve(playBgSound);

            return deferred.promise;
        }
    }
});
