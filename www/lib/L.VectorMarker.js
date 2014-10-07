(function () {
    "use strict";

    L.VectorMarker = {};
    L.VectorMarker.MAP_PIN = 'M13.897,2.667c0,0-8.871,37.216-11.272,49.917c-1.447,7.655,1.997,13.881,1.997,13.881s7.255-1.741,9.59-1.741c2.46,0,9.59,1.741,9.59,1.741s2.747-6.225,1.3-13.881C22.702,39.883,13.897,2.667,13.897,2.667z';

    L.VectorMarker.Icon = L.Icon.extend({
        options: {
            iconSize: [30, 50],
            iconAnchor: [0, 50],
            popupAnchor: [2, -40],
            shadowAnchor: [7, 45],
            shadowSize: [54, 51],
            className: "vector-marker",
            prefix: "fa",
            spinClass: "fa-spin",
            extraClasses: "",
            icon: "home",
            markerColor: "blue",
            iconColor: "white"
        },
        initialize: function(options) {
            L.Util.setOptions(this, options);
        },
        createIcon: function(oldIcon) {
            var div, icon, options, pin_path;
            div = (oldIcon && oldIcon.tagName === "DIV" ? oldIcon : document.createElement("div"));
            options = this.options;

            pin_path = L.VectorMarker.MAP_PIN;
            div.innerHTML = '<svg x="0" y="0" width="32px" height="72px" version="1.1" viewBox="0 0 30 72" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
                + '<path d="' + pin_path + '" fill="none" stroke-width="2" stroke="' + options.markerColor + '"></path></svg>';
            this._setIconStyles(div, "icon");
            this._setIconStyles(div, "icon-" + options.markerColor);
            return div;
        },
        _setIconStyles: function(img, name) {
            var anchor, options, size;
            options = this.options;
            size = L.point(options[(name === "shadow" ? "shadowSize" : "iconSize")]);

            if (name === "shadow") {
                anchor = L.point(options.shadowAnchor || options.iconAnchor);
            } else {
                anchor = L.point(options.iconAnchor);
            }

            if (!anchor && size) {
                anchor = size.divideBy(2, true);
            }

            img.className = "vector-marker-" + name + " " + options.className;

            if (anchor) {
                img.style.marginLeft = (-anchor.x) + "px";
                img.style.marginTop = (-anchor.y) + "px";
            }

            if (size) {
                img.style.width = size.x + "px";
                return img.style.height = size.y + "px";
            }
        },
        createShadow: function() {
            var div;
            div = document.createElement("div");
            this._setIconStyles(div, "shadow");
            return div;
        }
    });

    L.VectorMarker.icon = function(options) {
        return new L.VectorMarker.Icon(options);
    };
})();
