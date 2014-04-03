/**
 * @module audio service
 *
 * This is the service wrapper for https://github.com/goldfire/howler.js
 */

angular.module('mustard.game.audio', [])

.factory('audio', function () {

    /**
     * Default play options
     *
     * @type {Object}
     */
    var defaultOptions = {
        autoplay: true
    };

    return {
        /**
         * Play the sounds
         *
         * @example
         * audio.play('TorpedoLaunch.mp3');
         * audio.play(['TorpedoLaunch.mp3', 'BowerRingTone.mp3']);
         * audio.play({urls: ['TorpedoLaunch.mp3'], autoplay: true});
         *
         * @param param {String|Array|Object}
         * @returns {Howler}
         */
        play: function (param) {
            var options;

            if (_.isString(param)) {
                options = angular.extend(defaultOptions, {
                    urls: [param]
                });
            } else if (_.isArray(param)) {
                options = angular.extend(defaultOptions, {
                    urls: param
                });
            } else if (_.isObject(param)) {
                options = param;
            } else {
                return;
            }

            return new Howl(options);
        },

        /**
         * Get/Set the global volume for all sounds
         */
        volume: Howler.volume.bind(Howler),

        /**
         * Mutes all sounds.
         */
        mute: Howler.mute.bind(Howler),

        /**
         * Unmutes all sounds and restores them to their previous volume.
         */
        unmute: Howler.unmute.bind(Howler)
    }
});
