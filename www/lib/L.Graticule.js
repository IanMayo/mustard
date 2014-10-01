/*
 Graticule plugin for Leaflet powered maps.
*/
L.Graticule = L.GeoJSON.extend({

    options: {
        style: {
            color: '#333',
            weight: 1
        },
        interval: 20,
        maxIntervals: 20
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        this._layers = {};

        if (this.options.sphere) {
            this.addData(this._getFrame());
        } else {
            this.onAdd = this._createGraticule;
        }
    },

    _getFrame: function() {
        return { "type": "Polygon",
          "coordinates": [
              this._getMeridian(-180).concat(this._getMeridian(180).reverse())
          ]
        };
    },

    _getMeridian: function (lng) {
        lng = this._lngFix(lng);
        var coords = [];
        for (var lat = -90; lat <= 90; lat++) {
            coords.push([lng, lat]);
        }
        return coords;
    },

    _getMeridianForLng: function (lng) {
        lng = this._lngFix(lng);
        return [[lng, -90], [lng, 90]];
    },

    _getParallelForLat: function (lat) {
        return [[this._lngFix(-180), lat], [this._lngFix(180), lat]];
    },

    _getFeature: function (coords, prop) {
        return {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            },
            "properties": prop
        };
    },

    _lngFix: function (lng) {
        if (lng >= 180) return 179.999999;
        if (lng <= -180) return -179.999999;
        return lng;
    },

    _createGraticule: function (map) {
        this._map = map;
        L.GeoJSON.prototype.onAdd.call(this, map);

        this._lineStrings = {};

        this.on({
            'layeradd': this._addLineLayer
        }, this);

        this._update();

        map.on({
            'moveend': this._update
        }, this);
    },

    _addLineLayer: function (event) {
        this._lineStrings[event.layer.feature.properties.name] = event.layer;
    },

    _update: function () {
        if (!this._map) { return; }

        var bounds = this._map.getBounds();
        this._addLineWithinBounds(bounds);
        this._removeOtherLines(bounds);
    },

    _addLineWithinBounds: function (bounds) {
        var features = [];
        var lat, lng;

        var interval = this.options.interval;
        var maxIntervals = this.options.maxIntervals;

        var northEast = bounds.getNorthEast();
        var southWest = bounds.getSouthWest();

        // find the latitude of the centre of the visible area
        var deltaLat = northEast.lat - southWest.lat;

        // see how many intervals we're due to produce
        var numIntervals = deltaLat / interval;
        if(numIntervals > maxIntervals)
        {
            // we're zoomed out too far to show lines, ditch them
            for (var key in this._lineStrings) {
                var kArr = key.split(':');
                this._removeLine(key);
            }

            // ok, now drop out
            return;
        }

        // find the centre-lat of the visible area
        var midLat = southWest.lat + (deltaLat)/2.0;

        // convert mid-lat to a whole num of degs, so that the rectangles stay about the same size
        midLat = 10 * Math.round(midLat/10);

        // convert the interval to the effective height at this latitude
        var latInterval = Math.cos(midLat * Math.PI / 180.0) * interval;

        var minLat = Math.floor(southWest.lat / latInterval) * latInterval;
        var maxLat = Math.floor(northEast.lat / latInterval) * latInterval;

        var minLng = Math.floor(southWest.lng / interval) * interval;
        var maxLng = Math.floor(northEast.lng / interval) * interval;

        for (lat = minLat; lat <= maxLat.toFixed(5); lat = parseFloat((lat + latInterval).toFixed(5))) {
            var name = 'lat:' + lat.toString();
            if (this._lineShouldBeAdded(name)) {
                var northCoord = this._getParallelForLat(lat);
                var feature = this._getFeature(northCoord, {name: name});
                features.push(feature);
            }
        }

        for (lng = minLng; lng <= maxLng; lng = parseFloat((lng + interval).toFixed(5))) {
            var name = 'lng:' + lng.toString() ;
            if (this._lineShouldBeAdded(name)) {
                var eastCoord = this._getMeridianForLng(lng);
                var feature = this._getFeature(eastCoord, {name: name});
                features.push(feature);
            }
        }

        var linesToLoad = features.length;

        if (linesToLoad === 0) { return; }

        for (lng = 0; lng < linesToLoad; lng++) {
            this._addLine(features[lng]);
        }
    },

    _removeOtherLines: function (bounds) {
        var kArr, type, degree, key;

        for (key in this._lineStrings) {
            kArr = key.split(':');
            type = kArr[0];
            degree = parseFloat(kArr[1]);

            switch (type) {
                case 'lng':
                    this._removeLongitudeLine(degree, bounds, key);
                    break;
                case 'lat':
                    this._removeLatitudeLine(degree, bounds, key);
                    break;
            }
        }
    },

    _removeLatitudeLine: function (lat, mapBounds, lineIndex) {
        var north = mapBounds.getNorth();
        var south = mapBounds.getSouth();

        if ((lat < north && lat < south) || (lat > north && lat > south)) {
            this._removeLine(lineIndex);
        }
    },

    _removeLongitudeLine: function (lng, mapBounds, lineIndex) {
        var east = mapBounds.getEast();
        var west = mapBounds.getWest();

        if ((lng > east && lng > west) || (lng < east && lng < west)) {
            this._removeLine(lineIndex);
        }
    },

    _lineShouldBeAdded: function (line) {
        if (line in this._lineStrings) {
            return false; // already loaded
        }

        return true;
    },

    _addLine: function (feaure) {
        this.addData(feaure);
    },
    
    _removeLine: function (key) {
        this.removeLayer(this._lineStrings[key]);
        delete this._lineStrings[key];
    }
});

L.graticule = function (options) {
    return new L.Graticule(options);
};
