/**
 * @module Full-screen service
 *
 * @description Very experimental service which is based on
 * https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode
 */

angular.module('subtrack90.app.fullscreen', [])

.factory('fullscreen', function () {

    return {
        /**
         * Request fullscreen mode of course if it's possible
         */
        request: function () {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        },

        /**
         * If fullscreen mode is allowed then we can use this to go back to the normal mode
         */
        exit: function () {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        },

        /**
         * Toggle normal and fullscreen modes
         */
        toggle: function () {
            !document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement
                ? this.request()
                : this.exit();
        }
    }
});
