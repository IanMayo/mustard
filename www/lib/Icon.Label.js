L.IconLabel = L.Icon.Default.extend({
    options: {
        minWidth: 50,
        maxWidth: 100,
        iconAndLabelWhiteSpace: 3
    },

    createIcon: function() {
        var src = this._getIconUrl('icon');

        if (!src) {
            if (name === 'icon') {
                throw new Error('iconUrl not set in Icon options (see the docs).');
            }
            return null;
        }

        var iconSize = L.point(this.options.iconSize)
        var container = L.DomUtil.create('div', 'point-label');
        var img = this._createImg(src);
        container.appendChild(img);

        var labelContainer = this._labelContainer = L.DomUtil.create('div', 'label-container', container);
        labelContainer.style.visibility = 'hidden';
        labelContainer.style.top = -iconSize.y + 'px';
        labelContainer.style.left = (iconSize.x / 2 + this.options.iconAndLabelWhiteSpace) + 'px';
        this._labelWrapper = L.DomUtil.create('div', 'label-wrapper', labelContainer);

        this._setIconStyles(img, 'icon');
        return container;
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
        labelClassName: ''
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        L.Icon.prototype.initialize.call(this, this.options);
    },

    createIcon: function () {
        return this._createLabel(L.Icon.prototype.createIcon.call(this));
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

        label.setAttribute('data-designed-left-margin', this.options.labelAnchor.x);
        label.style.marginLeft = this.options.labelAnchor.x + 'px';
        label.style.marginTop = this.options.labelAnchor.y + 'px';

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
