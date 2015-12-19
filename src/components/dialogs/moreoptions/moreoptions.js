import * as utils from 'base/utils';
import Component from 'base/component';
import Dialog from '../_dialog';

import {
  simpleslider,
  bubblesize,
  colorlegend,
  indicatorpicker,
  simplecheckbox,
  minmaxinputs
}
from 'components/_index';

/*
 * More options dialog
 */

var MoreOptions = Dialog.extend({

  /**
   * Initializes the dialog component
   * @param config component configuration
   * @param context component context (parent)
   */
  init: function(config, parent) {
    this.name = 'moreoptions';
// 
//     this.components = [{
//       component: indicatorpicker,
//       placeholder: '.vzb-xaxis-selector',
//       model: ["state.marker", "language"],
//       markerID: "axis_x"
//     },{
//       component: minmaxinputs,
//       placeholder: '.vzb-xaxis-minmax',
//       model: ["state.marker", "language"],
//       markerID: "axis_x",
//       ui: {
//         selectMinMax: false,
//         selectFakeMinMax: true
//       }
//     }, {
//       component: indicatorpicker,
//       placeholder: '.vzb-yaxis-selector',
//       model: ["state.marker", "language"],
//       markerID: "axis_y"
//     }, {
//       component: minmaxinputs,
//       placeholder: '.vzb-yaxis-minmax',
//       model: ["state.marker", "language"],
//       markerID: "axis_y",
//       ui: {
//         selectMinMax: false,
//         selectFakeMinMax: true
//       }
//     }, {
//       component: simplecheckbox,
//       placeholder: '.vzb-axes-options',
//       model: ["state", "language"],
//       submodel: 'time',
//       checkbox: 'adaptMinMaxZoom'
//     }, {
//       component: indicatorpicker,
//       placeholder: '.vzb-saxis-selector',
//       model: ["state.marker", "language"],
//       markerID: "size"
//     }, {
//       component: bubblesize,
//       placeholder: '.vzb-dialog-bubblesize',
//       model: ["state.marker.size"],
//       ui: {
//         show_button: false
//       }
//     }, {
//       component: indicatorpicker,
//       placeholder: '.vzb-caxis-selector',
//       model: ["state.marker", "language"],
//       markerID: "color"
//     }, {
//       component: colorlegend,
//       placeholder: '.vzb-clegend-container',
//       model: ["state.marker.color", "state.entities", "language"]
//     }, {
//       component: simpleslider,
//       placeholder: '.vzb-dialog-bubbleopacity-regular',
//       model: ["state.entities"],
//       arg: "opacityRegular"
//     }, {
//       component: simpleslider,
//       placeholder: '.vzb-dialog-bubbleopacity-selectdim',
//       model: ["state.entities"],
//       arg: "opacitySelectDim"
//     }, {
//       component: simpleslider,
//       placeholder: '.vzb-dialog-delay-slider',
//       model: ["state.time"],
//       arg: "delay",
//       properties: {min:1, max:5, step:0.1, scale: d3.scale.linear()
//         .domain([1,2,3,4,5])
//         .range([1200,900,450,200,75])
//       }
//     },
//     {
//       component: simplecheckbox,
//       placeholder: '.vzb-presentationmode-switch',
//       model: ["ui", "language"],
//       checkbox: 'presentation'
//     }];

    this._super(config, parent);
  },

  readyOnce: function() {
    var _this = this;
    this.element = d3.select(this.element);
    
    var dialog_popup = this.model.ui.dialogs.popup || [];
    var dialog_moreoptions = this.model.ui.dialogs['more-options'] || [];
    
    // if dialog_moreoptions has been passed in with boolean param or array must check and covert to array
    if (dialog_moreoptions === true) {
      dialog_moreoptions = dialog_popup;
      this.model.ui.dialogs['more-options'] = dialog_moreoptions;
    }
    
    this._addDialogs(dialog_moreoptions);

    
    
    
    
    this.resize();
    
    //accordion
    this.accordionEl = this.element.select('.vzb-accordion');
    if(this.accordionEl) {
      this.accordionEl.selectAll('.vzb-accordion-section')
        .select('.vzb-accordion-section-title')
        .on('click', function() {
          var sectionEl = d3.select(this.parentNode);
          var activeEl = _this.accordionEl.select('.vzb-accordion-active');
          if(activeEl) {
            activeEl.classed('vzb-accordion-active', false);
          }
          if(sectionEl.node() !== activeEl.node()) {
            sectionEl.classed('vzb-accordion-active', true);
          }
        })
    }
  },

  resize: function() {
    var totalHeight = this.root.element.offsetHeight - 200;
    var content = this.element.select('.vzb-dialog-content');
    content.style('max-height', totalHeight + 'px');

    this._super();
  },
  
  _addDialogs: function(dialog_list) {

//     var dialog_list = [];
//     
//     dialog_list = dialog_popup ? dialog_list.concat(dialog_popup) : dialog_list;
//     dialog_list = dialog_sidebar ? dialog_list.concat(dialog_sidebar) : dialog_list;
// //    dialog_list = dialog_moreoptions ? dialog_list.concat(dialog_moreoptions) : dialog_list;
//     
//     //TODO: test speed with utils.unique
//     dialog_list = dialog_list.sort().reduce(function (a, b) {
//         if(a[a.length - 1] !== b) {
//           return a.concat(b);
//         }
//         return a;
//       }, []);

    this._components_config = [];
    var details_dlgs = [];
    if(!dialog_list.length) return;
    //add a component for each dialog
    for(var i = 0; i < dialog_list.length; i++) {

      var dlg = dialog_list[i];
      var dlg_config = this.parent._available_dialogs[dlg];

      //if it's a dialog, add component
      if(dlg_config && dlg_config.dialog) {
        var comps = this._components_config;

        //add corresponding component
        comps.push({
          component: dlg_config.dialog,
          placeholder: '.vzb-dialogs-dialog[data-dlg="' + dlg + '"]',
          model: ["state", "ui", "language"]
        });

        dlg_config.component = comps.length - 1;
      }

      //add template data
      var d = (dlg_config) ? dlg : "_default";
      var details_dlg = this.parent._available_dialogs[d];

      details_dlg.id = dlg;
      details_dlgs.push(details_dlg);
    };

    this.element.selectAll('div').data(details_dlgs)
      .enter().append("div")
      .attr('class', function (d) {
        var cls = 'vzb-dialogs-dialog';
        if (dialog_popup && dialog_popup.indexOf(d.id) > -1) {
            cls += ' vzb-popup';
        }
        if (dialog_sidebar && dialog_sidebar.indexOf(d.id) > -1) {
            cls += ' vzb-sidebar';
        }

        return cls;
      })
      .attr('data-btn', function(d) {
        return d.id;
      });

    this.loadComponents();

    var _this = this;
    //render each subcomponent
    utils.forEach(this.components, function(subcomp) {
      subcomp.render();
      _this.on('resize', function() {
        subcomp.trigger('resize');
      });
      subcomp.on('dragstart', function() {
        _this.bringForward(subcomp.name);
      });
      subcomp.on('close', function() {
        this.placeholderEl.each( function(d) {
          _this.root.findChildByName("gapminder-buttonlist")
            .setButtonActive(d.id, false);
        });
      });
    });
    
  }
});

export default MoreOptions;
