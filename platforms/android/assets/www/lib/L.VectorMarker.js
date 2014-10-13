(function () {
    "use strict";

    L.VectorMarker = {};
    L.VectorMarker.SVG_SHAPE_COORDINATES = 'M16,1C11.203,21.736,4.595,43.493,1.497,57.52 C-0.37,65.975,3.625,71,3.625,' +
        '71S12.987,68.207,16,68.207c3.174,0,12.375,2.793,12.375,2.793s3.995-5.025,2.128-13.48 C27.405,43.493,20.797,' +
        '21.736,16,1z';

    // svg shape height consists of actual value plus an extra indent.
    // the indent in viewBox height and svg height attr allows shifting svg shape within viewBox without scale influence
    // (if the indent is not included in svg height attr, svg shape shifts and scales)
    L.VectorMarker.SVG_SHAPE_HEIGHT = 72 + 8;
    L.VectorMarker.SVG_SHAPE_WIDTH = 32;

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
            var div, icon, options, pintPath, shapeHeight, shapeWidth;

            div = (oldIcon && oldIcon.tagName === "DIV" ? oldIcon : document.createElement("div"));
            options = this.options;
            pintPath = L.VectorMarker.SVG_SHAPE_COORDINATES;
            shapeHeight = L.VectorMarker.SVG_SHAPE_HEIGHT;
            shapeWidth = L.VectorMarker.SVG_SHAPE_WIDTH;


            this._pathRoot = this._createElement('svg');
            this._container = this._createElement('g');
            this._path = this._createElement('path');

            this._pathRoot.appendChild(this._container);
            this._container.appendChild(this._path);

            this._pathRoot.setAttribute('width', options.iconSize.x);
            this._pathRoot.setAttribute('height', options.iconSize.y);
            this._pathRoot.setAttribute('viewBox', '0 0 ' + shapeWidth + ' ' + shapeHeight);

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
