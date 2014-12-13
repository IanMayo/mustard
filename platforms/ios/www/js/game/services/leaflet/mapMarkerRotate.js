/**
 * @module Marker Rotate
 *
 * Based on comments by @runanet and @coomsie
 * https://github.com/CloudMade/Leaflet/issues/386
 *
 * Wrapping function is needed to preserve L.Marker.update function
 *
 * Since marker has label, the plugin was extended to work with label container
 */

angular.module('subtrack90.game.mapMarkerRotate', [])

/**
 * @module Marker Rotate
 * @class Service
 * @description Leaflet Map Plugin
 */

.service('mapMarkerRotate', function () {
    var mapExtension = function () {
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

                    if (tagName === 'div') {
                        iconImgEl = nodes[i];
                    } else if (tagName === 'span') {
                        this._changeLabelIndent(nodes[i]);
                    }
                }

                return iconImgEl;
            },

            _changeLabelIndent: function (labelElement) {
                var designedLeftPosition = parseInt(labelElement.getAttribute('data-designed-left-position'));
                var designedTopPosition = parseInt(labelElement.getAttribute('data-designed-top-position'));
                var currentLeftPosition = parseInt(labelElement.style.left);

                if ((this.options.iconAngle >= 25 && this.options.iconAngle <= 90)) {
                    labelElement.style.left =  -(parseInt(labelElement.getBoundingClientRect().width) + designedLeftPosition).toString() + 'px';
                    labelElement.style.top = (designedTopPosition).toString() + 'px';
                    labelElement.style.textAlign = 'right';
                } else if (currentLeftPosition !== designedLeftPosition) {
                    labelElement.style.left = designedLeftPosition.toString() + 'px';
                    labelElement.style.top = designedTopPosition.toString() + 'px';
                    labelElement.style.textAlign = 'left';
                }
            }
        });
    };

    this.init = function () {
        mapExtension();
    }
});
