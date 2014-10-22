L.IconLabel = L.Icon.Default.extend({
    options: {
        minWidth: 50,
        maxWidth: 100,
        iconAndLabelWhiteSpace: 3
    },

    createIcon: function() {
        var container = L.DomUtil.create('div', 'point-label');
        var labelContainer = this._labelContainer = L.DomUtil.create('div', 'label-container', container);
        var iconSize = L.point(this.options.iconSize);
        var topPosition = -iconSize.y;
        var leftPosition = iconSize.x / 2;

        if (this.options.hideIcon) {
            topPosition = topPosition / 2;
            leftPosition = leftPosition / 2;
        } else {
            container.appendChild(this._customIcon());
        }

        labelContainer.style.visibility = 'hidden';
        labelContainer.style.top = topPosition + 'px';
        labelContainer.style.left = (leftPosition + this.options.iconAndLabelWhiteSpace) + 'px';
        this._labelWrapper = L.DomUtil.create('div', 'label-wrapper', labelContainer);

        return container;
    },

    createShadow: function (oldIcon) {
        return null;
    },

    addLabel: function (text) {
        var width;
        var labelWrapper = this._labelWrapper;
        var style = labelWrapper.style;

        labelWrapper.innerHTML = text;
        width = labelWrapper.offsetWidth;
        width = Math.min(width, this.options.maxWidth);
        width = Math.max(width, this.options.minWidth);
        style.width = (width + 1) + 'px';
        this._labelContainer.style.visibility = 'visible';
    },

    _customIcon: function () {
        var icon;

        if (this.options.markerSymbol) {
            // create symbol icon
            var icon = L.DomUtil.create('span', 'marker-icon-symbol');
            icon.innerHTML = this.options.markerSymbol;
        } else {
            // create default leaflet icon
            var src = this._getIconUrl('icon');
            var img;

            if (!src) {
                if (name === 'icon') {
                    throw new Error('iconUrl not set in Icon options (see the docs).');
                }
                return null;
            }

            icon = this._createImg(src);
            this._setIconStyles(icon, 'icon');
        }

        return icon;
    }
});

L.iconLabel = function (text, options) {
    return new L.IconLabel(text, options);
};

L.Icon.Name = L.Icon.extend({
    options: {
        /*
         labelAnchor: (Point) (top left position of the label within the wrapper, default is right)
         labelText: (String) (label's text component, if this is null the element will not be created)
         */
        labelTextColor: '#bcdf1b',
        labelClassName: ''
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
    },

    createIcon: function () {
        var vectorMarker = L.VectorMarker.icon(this.options);
        var icon = vectorMarker.createIcon();
        return this._createLabel(icon);
    },

    createShadow: function (oldIcon) {
        return null;
    },

    updateLabel: function (icon, text) {
        if (icon.nodeName.toUpperCase() === 'DIV') {
            icon.childNodes[1].innerHTML = text;

            this.options.labelText = text;
        }
    },

    _createLabel: function (img) {
        if (!this._labelTextIsSet()) {
            return img;
        }

        var wrapper = document.createElement('div'),
            label = document.createElement('span');

        wrapper.className = 'leaflet-marker-icon-wrapper leaflet-zoom-animated';

        // set up label
        label.className = 'leaflet-marker-iconlabel ' + this.options.labelClassName;

        label.innerHTML = this.options.labelText;

        label.setAttribute('data-designed-left-position', this.options.labelAnchor.x);
        label.setAttribute('data-designed-top-position', this.options.labelAnchor.y);
        label.style.left = this.options.labelAnchor.x + 'px';
        label.style.top = this.options.labelAnchor.y + 'px';
        label.style.color = this.options.labelTextColor;

        wrapper.appendChild(img);
        wrapper.appendChild(label);

        return wrapper;
    },

    _labelTextIsSet: function () {
        return typeof this.options.labelText !== 'undefined' && this.options.labelText !== null;
    }
});

L.icon.Name = function (text, options) {
    return new L.Icon.Name(text, options);
};
