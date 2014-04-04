/**
 * @module Geo Math
 */

angular.module('mustard.game.geoMath', [])

/**
 * @module Geo Math
 * @class Service
 * @description Geo Math Helper
 */

.service('geoMath', function () {

    /**
     * Convert decimal degrees to deg/min/sec format
     *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
     *    direction is added
     *
     * @private
     * @param   {Number} [deg]: Degrees
     * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
     * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
     * @returns {String} deg formatted as deg/min/secs according to specified format
     * @throws  {TypeError} deg is an object, perhaps DOM object without .value?
     */
    var toDMS = function (deg, format, dp) {
        if (typeof deg == 'object') throw new TypeError('Geo.toDMS - deg is [DOM?] object');
        if (isNaN(deg)) return null;  // give up here if we can't make a number from deg

        // default values
        if (typeof format == 'undefined') format = 'dms';
        if (typeof dp == 'undefined') {
            switch (format) {
                case 'd':
                    dp = 4;
                    break;
                case 'dm':
                    dp = 2;
                    break;
                case 'dms':
                    dp = 0;
                    break;
                default:
                    format = 'dms';
                    dp = 0;  // be forgiving on invalid format
            }
        }

        deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)

        var dms;

        switch (format) {
            case 'd':
                d = deg.toFixed(dp);     // round degrees
                if (d < 100) d = '0' + d;  // pad with leading zeros
                if (d < 10) d = '0' + d;
                dms = d + '\u00B0';      // add º symbol
                break;
            case 'dm':
                var min = (deg * 60).toFixed(dp);  // convert degrees to minutes & round
                var d1 = Math.floor(min / 60);    // get component deg/min
                var m1 = (min % 60).toFixed(dp);  // pad with trailing zeros
                if (d1 < 100) d1 = '0' + d1;          // pad with leading zeros
                if (d1 < 10) d1 = '0' + d1;
                if (m1 < 10) m1 = '0' + m1;
                dms = d + '\u00B0' + m1 + '\u2032';  // add º, ' symbols
                break;
            case 'dms':
                var sec = (deg * 3600).toFixed(dp);  // convert degrees to seconds & round
                var d2 = Math.floor(sec / 3600);    // get component deg/min/sec
                var m2 = Math.floor(sec / 60) % 60;
                var s2 = (sec % 60).toFixed(dp);    // pad with trailing zeros
                if (d2 < 100) d2 = '0' + d2;            // pad with leading zeros
                if (d2 < 10) d2 = '0' + d2;
                if (m2 < 10) m2 = '0' + m2;
                if (s2 < 10) s2 = '0' + s2;
                dms = d2 + '\u00B0' + m2 + '\u2032' + s2 + '\u2033';  // add º, ', " symbols
                break;
        }

        return dms;
    };

    /**
     * Convert numeric degrees to deg/min/sec latitude (suffixed with N/S)
     *
     * @param   {Number} [deg]: Degrees
     * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
     * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
     * @returns {String} Deg/min/seconds
     */
    var toLat = function (deg, format, dp) {
        var lat = toDMS(deg, format, dp);
        return lat == null ? '–' : lat.slice(1) + (deg < 0 ? 'S' : 'N');  // knock off initial '0' for lat!
    };

    /**
     * Convert numeric degrees to deg/min/sec longitude (suffixed with E/W)
     *
     * @param   {Number} [deg]: Degrees
     * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
     * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
     * @returns {String} Deg/min/seconds
     */
    var toLon = function (deg, format, dp) {
        var lon = toDMS(deg, format, dp);
        return lon == null ? '–' : lon + (deg < 0 ? 'W' : 'E');
    };

    var toString = function (degLat, degLon, format, dp) {
        if (typeof format == 'undefined') format = 'dms';

        return toLat(degLat, format, dp) + ', ' + toLon(degLon, format, dp);
    };

    var toRads = function (degVal) {
        return degVal / 180.0 * Math.PI;
    };

    var toDegs = function (radVal) {
        return radVal * 180.0 / Math.PI;
    };

    /** CONVERT MILLISECONDS TO DIGITAL CLOCK FORMAT
     *
     * @param duration
     * @returns {String} value
     */
    var formatMillis = function (duration) {
        var milliseconds = parseInt((duration % 1000) / 100)
            , seconds = parseInt((duration / 1000) % 60)
            , minutes = parseInt((duration / (1000 * 60)) % 60)
            , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    };

    /**
     * Module API
     */
    return {
        toRads: toRads,

        toDegs: toDegs,

        formatMillis: formatMillis,

        toString: function (location) {
            return toString(location.lat, location.lng);
        },

        /**
         *
         * @param thisCat the categoiry we're looking for
         * @param theCats an array of categories
         * @returns {boolean} true/false for finding item
         */
        hasCategory: function (thisCat, theCats) {
            return (theCats.indexOf(thisCat) > -1);
        },

        /** remove the specified category from the list
         *
         * @param {String} thisCat  the category to remove
         * @param {Array} theCats  an array of categories
         */
        removeCategory: function (thisCat, theCats) {
            var index = theCats.indexOf(thisCat);    // <-- Not supported in <IE9
            if (index !== -1) {
                theCats.splice(index, 1);
            }
        },

        /**
         * Returns the destination point from this point having travelled the given distance (in km) on the
         * given bearing along a rhumb line
         *
         * @param   {Object} [location]: origin location
         * @param   {Number} [brng]: Bearing in radians from North
         * @param   {Number} [dist]: Distance in m
         */
        rhumbDestinationPoint: function (location, brng, dist) {

            if (brng < 0) {
                brng += Math.PI * 2;
            }

            const R = 6371000;  // radius in metres
            var d = dist / R;  // d = angular distance covered on earth’s surface
            var lat1 = toRads(location.lat);
            var lon1 = toRads(location.lng);

            var dLat = d * Math.cos(brng);

            // nasty kludge to overcome ill-conditioned results around parallels of latitude:
            if (Math.abs(dLat) < 1e-10) dLat = 0; // dLat < 1 mm

            var lat2 = lat1 + dLat;

            var dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
            var q = (isFinite(dLat / dPhi)) ? dLat / dPhi : Math.cos(lat1);  // E-W line gives dPhi=0
            var dLon = d * Math.sin(brng) / q;

            // check for some daft bugger going past the pole, normalise latitude if so
            if (Math.abs(lat2) > Math.PI / 2) lat2 = lat2 > 0 ? Math.PI - lat2 : -Math.PI - lat2;

            var lon2 = (lon1 + dLon + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

            var res = {};
            res.lat = toDegs(lat2);
            res.lng = toDegs(lon2);

            return res;
        },

        /**
         * Returns the distance from this point to the supplied point, in m, travelling along a rhumb line
         *
         *   see http://williams.best.vwh.net/avform.htm#Rhumb
         *
         * @param   {Object} [origin] Latitude/longitude of start point
         * @param   {Object} [point] Latitude/longitude of destination point
         * @returns {Number} Distance in m between this point and destination point
         */
        rhumbDistanceFromTo: function (origin, point) {
            const R = 6371000;  // earth radius in m
            var lat1 = toRads(origin.lat);
            var lat2 = toRads(point.lat);
            var dLat = toRads(point.lat - origin.lat);
            var dLon = toRads(Math.abs(point.lng - origin.lng));

            var dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
            var q = (isFinite(dLat / dPhi)) ? dLat / dPhi : Math.cos(lat1);  // E-W line gives dPhi=0

            // if dLon over 180° take shorter rhumb across anti-meridian:
            if (Math.abs(dLon) > Math.PI) {
                dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);
            }
            return Math.sqrt(dLat * dLat + q * q * dLon * dLon) * R;
        },

        /**
         * Returns the bearing from this point to the supplied point along a rhumb line, in degrees
         *
         * @param   {Object} [origin]: Latitude/longitude of start point
         * @param   {Object} [point]: Latitude/longitude of destination point
         * @returns {Number} Bearing in degrees from North
         */
        rhumbBearingFromTo: function (origin, point) {
            var lat1 = toRads(origin.lat), lat2 = toRads(point.lat);
            var dLon = toRads(point.lng - origin.lng);

            var dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
            if (Math.abs(dLon) > Math.PI) dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);
            var brng = Math.atan2(dLon, dPhi);

            return (toDegs(brng) + 360) % 360;
        }
    };
});
