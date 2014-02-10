/**
 * Created by ian on 10/02/14.
 */

function toRads(degVal) {
    return degVal / 180.0 * Math.PI;
}
function toDegs(radVal) {
    return radVal * 180.0 / Math.PI;
}



/**
 * Returns the destination point from this point having travelled the given distance (in km) on the
 * given bearing along a rhumb line
 *
 * @param   {Object} [location]: origin location
 * @param   {Number} [brng]: Bearing in radians from North
 * @param   {Number} [dist]: Distance in m
 */
function rhumbDestinationPoint(location, brng, dist) {

    if(brng < 0)
    {
        brng += Math.PI * 2;
    }

    const R = 6371000;  // radius in metres
    var d = dist/R;  // d = angular distance covered on earth’s surface
    var lat1 = toRads(location.lat);
    var lon1 = toRads(location.long);

    var dLat = d*Math.cos(brng);

    // nasty kludge to overcome ill-conditioned results around parallels of latitude:
    if (Math.abs(dLat) < 1e-10) dLat = 0; // dLat < 1 mm

    var lat2 = lat1 + dLat;

    var dPhi = Math.log(Math.tan(lat2/2+Math.PI/4)/Math.tan(lat1/2+Math.PI/4));
    var q = (isFinite(dLat/dPhi)) ? dLat/dPhi : Math.cos(lat1);  // E-W line gives dPhi=0
    var dLon = d*Math.sin(brng)/q;

    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(lat2) > Math.PI/2) lat2 = lat2>0 ? Math.PI-lat2 : -Math.PI-lat2;

    var lon2 = (lon1+dLon+3*Math.PI)%(2*Math.PI) - Math.PI;

    location.lat = toDegs(lat2);
    location.long = toDegs(lon2);
}


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
function toDMS(deg, format, dp) {
    if (typeof deg == 'object') throw new TypeError('Geo.toDMS - deg is [DOM?] object');
    if (isNaN(deg)) return null;  // give up here if we can't make a number from deg

    // default values
    if (typeof format == 'undefined') format = 'dms';
    if (typeof dp == 'undefined') {
        switch (format) {
            case 'd': dp = 4; break;
            case 'dm': dp = 2; break;
            case 'dms': dp = 0; break;
            default: format = 'dms'; dp = 0;  // be forgiving on invalid format
        }
    }

    deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)

    var dms;

    switch (format) {
        case 'd':
            d = deg.toFixed(dp);     // round degrees
            if (d<100) d = '0' + d;  // pad with leading zeros
            if (d<10) d = '0' + d;
            dms = d + '\u00B0';      // add º symbol
            break;
        case 'dm':
            var min = (deg*60).toFixed(dp);  // convert degrees to minutes & round
            var d1 = Math.floor(min / 60);    // get component deg/min
            var m1 = (min % 60).toFixed(dp);  // pad with trailing zeros
            if (d1<100) d1 = '0' + d1;          // pad with leading zeros
            if (d1<10) d1 = '0' + d1;
            if (m1<10) m1 = '0' + m1;
            dms = d + '\u00B0' + m1 + '\u2032';  // add º, ' symbols
            break;
        case 'dms':
            var sec = (deg*3600).toFixed(dp);  // convert degrees to seconds & round
            var d2 = Math.floor(sec / 3600);    // get component deg/min/sec
            var m2 = Math.floor(sec/60) % 60;
            var s2 = (sec % 60).toFixed(dp);    // pad with trailing zeros
            if (d2<100) d2 = '0' + d2;            // pad with leading zeros
            if (d2<10) d2 = '0' + d2;
            if (m2<10) m2 = '0' + m2;
            if (s2<10) s2 = '0' + s2;
            dms = d2 + '\u00B0' + m2 + '\u2032' + s2 + '\u2033';  // add º, ', " symbols
            break;
    }

    return dms;
}

/**
 * Convert numeric degrees to deg/min/sec latitude (suffixed with N/S)
 *
 * @param   {Number} [deg]: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 */
function toLat(deg, format, dp) {
    var lat = toDMS(deg, format, dp);
    return lat==null ? '–' : lat.slice(1) + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
}

/**
 * Convert numeric degrees to deg/min/sec longitude (suffixed with E/W)
 *
 * @param   {Number} [deg]: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 */
function toLon(deg, format, dp) {
    var lon = toDMS(deg, format, dp);
    return lon==null ? '–' : lon + (deg<0 ? 'W' : 'E');
}

function toString(degLat, degLon, format, dp) {
    if (typeof format == 'undefined') format = 'dms';

    return toLat(degLat, format, dp) + ', ' + toLon(degLon, format, dp);
}