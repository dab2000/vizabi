define([
    'jquery',
    'base/utils',
    'base/component',
    'base/model'
], function($, utils, Component, Model) {

    var picker,
        countries;

    var SizeButton = Component.extend({
        init: function(config, parent) {
            this.name = 'size-button';
            this.id = 'size';
            this.title = 'Size';

            this.placeholder = options.placeholder;
            
            this.template = 'components/_gapminder/button-list/button.html';
            this.template_data = this.template_data || {
                name: this.name,
                title: this.title,
                id: this.id,
            };

            this._super(config, parent) ;
        },

        postRender: function() {
        },


        resize: function() {

        },


        update: function() {

        }

    });

    return SizeButton;
});