/**
 * @module Splash Screen service
 */

angular.module('subtrack90.app.splashScreen', [])

.factory('splashScreen', ['$q', 'IS_MOBILE', function ($q, IS_MOBILE) {

    /**
     * Indicates that splash screen is blocked and we can't show it by splash.show()
     *
     * @type {Boolean}
     */
    var isBlocked = false;

    /**
     * Desktop splash screen options
     *
     * @type {Object}
     */
    var options = {
        id: 'splash',
        idSel: '#splash',
        fadeOutDelay: 500,
        labelTmpl:
            '<h3 class="label-splash">' +
                '<span class="label label-info">Click anywhere to continue</span>' +
            '</h3>'
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
         */
        block: function () {
            isBlocked = true;
        },

        /**
         * Unblock splash screen
         */
        unblock: function () {
            isBlocked = false;
        },

        /**
         * Show splash screen and add on touch handler to close it
         *
         * @param deferred
         */
        show: function (deferred) {
            if ($body.find(options.idSel).length || isBlocked) {
                return;
            }

            $(document.createElement('div'))
                .attr({id: options.id})
                .bind(IS_MOBILE ? 'touchend' : 'click', function () {
                    var $element = $(this);

                    $element.fadeOut(options.fadeOutDelay, function() {
                        $element.remove();
                    });

                    deferred.resolve(true);
                })
                .append(options.labelTmpl)
                .appendTo($body);
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
                self.show(deferred);
                self.block();
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        }
    };
}]);
