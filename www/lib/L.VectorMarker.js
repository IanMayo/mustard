(function () {
    "use strict";

    L.VectorMarker = {};
    L.VectorMarker.MAP_PIN = 'M13.897,2.667c0,0-8.871,37.216-11.272,49.917c-1.447,7.655,1.997,13.881,1.997,' +
        '13.881s7.255-1.741,9.59-1.741c2.46,0,9.59,1.741,9.59,1.741s2.747-6.225,1.3-13.881C22.702,39.883,13.897,' +
        '2.667,13.897,2.667z';

    L.VectorMarker.Icon = L.Icon.extend({
        options: {
            iconSize: new L.point(30, 50),
            iconAnchor: new L.point(0, 50),
            className: "vector-marker",
            extraClasses: "",
            markerColor: "blue"
        },
        initialize: function(options) {
            L.Util.setOptions(this, options);
        },
        createIcon: function(oldIcon) {
            var div, icon, options, pintPath;

            div = (oldIcon && oldIcon.tagName === "DIV" ? oldIcon : document.createElement("div"));
            options = this.options;
            pintPath = L.VectorMarker.MAP_PIN;

            this._pathRoot = this._createElement('svg');
            this._container = this._createElement('g');
            this._path = this._createElement('path');

            this._pathRoot.appendChild(this._container);
            this._container.appendChild(this._path);

            this._pathRoot.setAttribute('width', options.iconSize.x);
            this._pathRoot.setAttribute('height', options.iconSize.y);
            this._pathRoot.setAttribute('viewBox', '0 0 30 50');

            this._path.setAttribute('d', pintPath);
            this._path.setAttribute('fill', 'none');
            this._path.setAttribute('stroke-width', '3');
            this._path.setAttribute('stroke', options.markerColor);

            div.appendChild(this._pathRoot);

            this._setIconStyles(div, "icon-" + options.markerColor);
            return div;
        },
        _setIconStyles: function(img, name) {
            var anchor, options, size;
            options = this.options;
            size = options.iconSize;
            anchor = options.iconAnchor;

            if (!anchor && size) {
                anchor = size.divideBy(2, true);
            }

            img.className = "vector-marker-" + name + " " + options.className;
            img.style.position = "absolute";

            if (anchor) {
                img.style.left = (-anchor.x) + "px";
                img.style.top = (-anchor.y) + "px";
            }

            if (size) {
                img.style.width = size.x + "px";
                return img.style.height = size.y + "px";
            }
        },
        _createElement: function (name) {
            return document.createElementNS(L.Path.SVG_NS, name);
        }
    });

    L.VectorMarker.icon = function(options) {
        return new L.VectorMarker.Icon(options);
    };
})();
