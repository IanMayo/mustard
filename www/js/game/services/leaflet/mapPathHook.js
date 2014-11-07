/**
 * @module Path Hook
 *
 * The extension creates wrapper with svg filter for all paths in map
 */

angular.module('subtrack90.game.mapPathHook', [])

/**
 * @module Path Hook
 * @class Service
 * @description Leaflet Map Plugin
 */

.service('mapPathHook', function () {
    var mapExtension = function () {
        L.Path.include({
            _onAddOrig: L.Path.prototype.onAdd,
            _onRemoveOrig: L.Path.prototype.onRemove,
            onAdd: function (map) {
                this._onAddOrig(map);

                if (!this._map._pathWrapper) {
                    this.addPathWrapper(map);
                }

                var container = this._map._pathRoot.removeChild(this._container);
                this._map._pathWrapper.appendChild(container);
            },

            onRemove: function (map) {
                var path = this;
                try {
                    // try to remove the path path from vendor-designed svg container
                    path._onRemoveOrig(map);
                } catch (e) {
                    // save pathRoot element
                    var _pathRoot = map._pathRoot;
                    // replace pathRoot element with pathWrapper element
                    map._pathRoot = map._pathWrapper;

                    // remove the path element form path
                    path._onRemoveOrig(map);
                    // restore pathRoot element
                    map._pathRoot = _pathRoot;
                }
            },

            addPathWrapper: function (map) {
                var pathWrapper = L.Path.prototype._createElement('g');
                pathWrapper.setAttribute('filter', 'url(#blurElement)');

                map._pathRoot.appendChild(pathWrapper);
                map._pathWrapper = pathWrapper;
            }
        });
    };

    this.init = function () {
        mapExtension();
    }
});
