/**
 * @module Splash Screen service
 */

angular.module('subtrack90.app.splashScreen', [])

.factory('splashScreen', ['$q', '$http', 'IS_MOBILE', function ($q, $http, IS_MOBILE) {

    /**
     * Body element
     *
     * @type {jQuery|HTMLElement}
     */
    var $body = $('body');

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
        templateUrl: 'js/app/services/splashScreen/splashScreen.tpl.html'
    };

    /**
     * Get splash screen template via $http service and cache it
     */
    var getTemplate = function () {
        return $http({
            method: 'GET',
            url: options.templateUrl,
            cache: true
        });
    };

    /**
     * Handler to close (hide) splash screen
     *
     * @param deferred
     */
    var splashScreenClickHandler = function (deferred) {
        var $element = $(this);

        $element.fadeOut(options.fadeOutDelay, function() {
            $element.remove();
        });

        deferred.resolve(true);
    };

    /**
     * Create splash screen element and add it to the body element
     *
     * @param template
     * @param deferred
     */
    var createSplashScreenElement = function (template, deferred) {
        var $splash = $(document.createElement('div'));

        $splash.attr({id: options.id})
            .bind(IS_MOBILE ? 'touchend' : 'click', splashScreenClickHandler.bind($splash, deferred))
            .append(template)
            .appendTo($body);
    };

    /**
     * Check the existence and blocking of splash screen
     *
     * @returns {Boolean}
     */
    var splashScreenExistsOrBlocked = function () {
        return $body.find(options.idSel).length || isBlocked;
    };

    return {
        /**
         * Show splash screen
         *
         * @param deferred
         */
        show: function (deferred) {
            if (splashScreenExistsOrBlocked()) return;

            getTemplate().then(function (responce) {
                createSplashScreenElement(responce.data, deferred);
            }).catch(function (error) {
                deferred.resolve(error);
            });
        },

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
         * Resolver method for using in $routeProvider
         *
         * @param splashOnPage
         * @returns {deferred.promise}
         */
        resolver: function (splashOnPage) {
            var deferred = $q.defer();
            var self = this;

            if (splashOnPage && !isBlocked) {
                self.show(deferred);
                self.block();
            } else {
                deferred.resolve(false);
            }

            return deferred.promise;
        }
    };
}]);
