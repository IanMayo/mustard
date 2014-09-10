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
