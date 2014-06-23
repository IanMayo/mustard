/**
 * @module Splash Screen service
 */

angular.module('mustard.app.splashScreen', [])

/**
 * Splash time constant which is used in "desktop splash screen resolver"
 */
.constant('SPLASH_TIME', 5000)

.factory('splashScreen', ['$q', '$timeout', 'SPLASH_TIME', function ($q, $timeout, SPLASH_TIME) {

    /**
     * Indicates that splash screen is blocked and we can't show it by splash.show()
     *
     * @type {Boolean}
     */
    var isBlocked = false;

    /**
     * Phonegap splash screen plugin which should exist only on mobile devices
     *
     * @type {org.apache.cordova.splashscreen}
     */
    var navSplash = navigator.splashscreen;

    /**
     * Desktop splash screen options
     *
     * @type {Object}
     */
    var options = {
        id: 'splash',
        idSel: '#splash',
        fadeOutDelay: 500
    };

    /**
     * Body element
     *
     * @type {jQuery|HTMLElement}
     */
    var $body = $('body');

    return {
        /**
         * Block splash screen
         *
         * @returns {Boolean}
         */
        block: function () {
            return isBlocked = true;
        },

        /**
         * Unblock splash screen
         *
         * @returns {Boolean}
         */
        unblock: function () {
            return isBlocked = false;
        },

        /**
         * Show splash screen
         */
        show: navSplash ?
        function () {
            !isBlocked && navSplash.show();
        } :
        function () {
            if ($body.find(options.idSel).length || isBlocked) {
                return;
            }

            $(document.createElement('div'))
                .attr({id: options.id})
                .appendTo($body);
        },

        /**
         * Hide splash screen
         */
        hide: navSplash ? navSplash.hide : function () {
            $body.find(options.idSel).fadeOut(options.fadeOutDelay, function() {
                $(this).remove();
            });
        },

        /**
         * Resolver method for using in $routeProvider resolve
         *
         * @param showSplash
         * @returns {deferred.promise}
         */
        resolver: function (showSplash) {
            var deferred = $q.defer();
            var self = this;

            if (showSplash && !isBlocked) {
                self.show();
                self.block();

                $timeout(function () {
                    self.hide();
                    deferred.resolve(true);
                }, SPLASH_TIME);
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        }
    };
}]);
