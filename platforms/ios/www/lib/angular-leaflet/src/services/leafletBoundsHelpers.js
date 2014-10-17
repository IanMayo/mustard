angular.module("leaflet-directive").factory('leafletBoundsHelpers', function ($log, leafletHelpers) {

    var isArray = leafletHelpers.isArray,
        isNumber = leafletHelpers.isNumber;

    function _isValidBounds(bounds) {
        return angular.isDefined(bounds) && angular.isDefined(bounds.southWest) &&
               angular.isDefined(bounds.northEast) && angular.isNumber(bounds.southWest.lat) &&
               angular.isNumber(bounds.southWest.lng) && angular.isNumber(bounds.northEast.lat) &&
               angular.isNumber(bounds.northEast.lng);
    }

    return {
        createLeafletBounds: function(bounds) {
            if (_isValidBounds(bounds)) {
                return L.latLngBounds([bounds.southWest.lat, bounds.southWest.lng],
                                      [bounds.northEast.lat, bounds.northEast.lng ]);
            } else {
                return false;
            }
        },

        isValidBounds: _isValidBounds,

        createBoundsFromArray: function(boundsArray) {
            if (!(isArray(boundsArray) && boundsArray.length === 2 &&
                  isArray(boundsArray[0]) && isArray(boundsArray[1]) &&
                  boundsArray[0].length === 2 && boundsArray[1].length === 2 &&
                  isNumber(boundsArray[0][0]) && isNumber(boundsArray[0][1]) &&
                  isNumber(boundsArray[1][0]) && isNumber(boundsArray[1][1]))) {
                $log.error("[AngularJS - Leaflet] The bounds array is not valid.");
                return;
            }

            return {
                northEast: {
                    lat: boundsArray[0][0],
                    lng: boundsArray[0][1]
                },
                southWest: {
                    lat: boundsArray[1][0],
                    lng: boundsArray[1][1]
                }
            };

        },

        updateBoundsInScope: function(leafletScope, map) {
            var mapBounds = map.getBounds();
            var newScopeBounds = {
                northEast: {
                    lat: mapBounds.getNorthEast().lat,
                    lng: mapBounds.getNorthEast().lng
                },
                southWest: {
                    lat: mapBounds.getSouthWest().lat,
                    lng: mapBounds.getSouthWest().lng
                }
            };

            if(!angular.equals(leafletScope.bounds, newScopeBounds)) {
                leafletScope.bounds = newScopeBounds;
            }
        }
    };
});
