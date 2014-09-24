/*
 * Based on comments by @runanet and @coomsie 
 * https://github.com/CloudMade/Leaflet/issues/386
 *
 * Wrapping function is needed to preserve L.Marker.update function
 */
(function () {
    var _old__setPos = L.Marker.prototype._setPos;
    L.Marker.include({
        _updateImg: function(i, a, s) {
            a = L.point(s).divideBy(2)._subtract(L.point(a));
            var transform = '';
            transform += ' translate(' + -a.x + 'px, ' + -a.y + 'px)';
            transform += ' rotate(' + this.options.iconAngle + 'deg)';
            transform += ' translate(' + a.x + 'px, ' + a.y + 'px)';
            i.style[L.DomUtil.TRANSFORM] += transform;
        },

        setIconAngle: function (iconAngle) {
            this.options.iconAngle = iconAngle;

            if (this._map) this.update();
        },

        _setPos: function (pos) {
            var iconImg;

            if (this._icon) {
                iconImg = this._icon;
                if (iconImg.tagName.toLowerCase() !== 'img') {
                    iconImg = this._findImgElement(iconImg);
                }
                iconImg.style[L.DomUtil.TRANSFORM] = "";
            }
            if (this._shadow) {
                this._shadow.style[L.DomUtil.TRANSFORM] = "";
            }

            _old__setPos.apply(this,[pos]);

            if (this.options.iconAngle) {

                var a = this.options.icon.options.iconAnchor;
                var s = this.options.icon.options.iconSize;
                var i;
                if (iconImg) {
                    this._updateImg(iconImg, a, s);
                }

                if (this._shadow) {
                    // Rotate around the icons anchor.
                    s = this.options.icon.options.shadowSize;
                    i = this._shadow;
                    this._updateImg(i, a, s);
                }

            }
        },

        _findImgElement: function (element) {
            var nodes = element.childNodes;
            var iconImgEl;

            for (var len = nodes.length, i = 0; i < len; i ++) {
                var tagName = nodes[i].tagName.toLocaleLowerCase();

                if (tagName === 'img') {
                    iconImgEl = nodes[i];
                } else if (tagName === 'span') {
                    this._changeLabelIndent(nodes[i]);
                }
            }

            return iconImgEl;
        },

        _changeLabelIndent: function (labelElement) {
            var designedLeftMargin = parseInt(labelElement.getAttribute('data-designed-left-margin'));
            var designedTopMargin = parseInt(labelElement.getAttribute('data-designed-top-margin'));
            var currentLeftMargin = parseInt(labelElement.style.marginLeft);

            if ((this.options.iconAngle >= 25 && this.options.iconAngle <= 90)) {
                labelElement.style.marginLeft = (0 - (2 * designedLeftMargin + 10)).toString() + 'px';
                labelElement.style.marginTop = (designedTopMargin + 10).toString() + 'px';
                labelElement.style.textAlign = 'right';
            } else if (currentLeftMargin !== designedLeftMargin) {
                labelElement.style.marginLeft = designedLeftMargin + 'px';
                labelElement.style.marginTop = designedTopMargin + 'px';
                labelElement.style.textAlign = 'left';
            }
        }
    });
}());
