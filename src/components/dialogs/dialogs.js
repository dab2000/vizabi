import * as utils from 'base/utils';
import Component from 'base/component';
import * as iconset from 'base/iconset';

//dialogs
import * as dialogs from 'dialogs/_index';

/*!
 * VIZABI DIALOGS
 * Reusable dialogs component
 */

//default existing dialogs
var class_active = "vzb-active";
var class_expand_dialog = "vzb-dialog-side";

var Dialogs = Component.extend({

  /**
   * Initializes the dialogs
   * @param config component configuration
   * @param context component context (parent)
   */
  init: function(config, context) {

    //set properties
    var _this = this;
    this.name = 'gapminder-dialogs';
    this._curr_dialog_index = 20;

    
    this.model_expects = [{
      name: "state",
      type: "model"
    }, {
      name: "ui",
      type: "model"
    }, {
      name: "language",
      type: "language"
    }];
    
    this._available_dialogs = {
      'find': {
        dialog: dialogs.find,
      },
      'show': {
        dialog: dialogs.show,
      },
      'more-options': {
        dialog: dialogs.moreoptions,
      },
      'colors': {
        dialog: dialogs.colors,
      },
      'size': {
        dialog: dialogs.size,
      },
      'axes': {
        dialog: dialogs.axes,
      },
      'axesmc': {
        dialog: dialogs.axesmc,
      },
      'stack': {
        dialog: dialogs.stack,
      },
      'speed': {
        dialog: dialogs.speed
      },
      'opacity': {
        dialog: dialogs.opacity
      },
      'presentation': {
        dialog: dialogs.presentation
      }
    };
    
    this._super(config, context);

  },
  
  readyOnce: function() {

    var _this = this;
    var dialog_popup = this.model.ui.dialogs.popup || [];
    var dialog_sidebar = this.model.ui.dialogs.sidebar || [];
//    var dialog_moreoptions = this.model.ui.dialogs['more-options'];

    this.element = d3.select(this.placeholder);

    this.element.selectAll("div").remove();
  
    // if dialog_sidebar has been passed in with boolean param or array must check and covert to array
    if (dialog_sidebar === true) {
      dialog_sidebar = dialog_popup;
      this.model.ui.dialogs.sidebar = dialog_sidebar;
    }
    
    if (dialog_sidebar.length !== 0) {
        d3.select(this.root.element).classed("vzb-dialog-expand-true", true);
    }
    
    // if dialog_moreoptions has been passed in with boolean param or array must check and covert to array
    // if (dialog_moreoptions && dialog_moreoptions === true) {
    //   dialog_moreoptions = dialog_popup;
    //   this.model.ui.dialogs['more-options'] = dialog_moreoptions;
    // }
    
// 
//     this.model.ui.dialogs.sidebar.forEach(function(dialog) {
//       if (dialog_list.indexOf(dialog) === -1) {
//         dialog_list.push(dialog);
//       }
//     });
// 
//     this.model.ui.buttons = dialog_list;

    this._addDialogs(dialog_popup, dialog_sidebar);

    if(this.model.ui.dialogs.popup) {
      this.root.findChildByName("gapminder-buttonlist")
        .on("click", function(evt, button) {
          if(!_this._available_dialogs[button.id]) return;

          if(button.active) {
            _this.openDialog(button.id)
          } else {
            _this.closeDialog(button.id)
          }
        });

      
      //TODO: check close
      var close_buttons = this.element.selectAll(".vzb-popup").select(".vzb-popup>.vzb-dialog-modal>.vzb-dialog-buttons>[data-click='closeDialog']");
      close_buttons.on('click', function(d, i) {
        _this.closeDialog(d.id);
      });

      var pinDialog = this.element.selectAll(".vzb-popup").select(".vzb-popup>.vzb-dialog-modal>[data-click='pinDialog']");
      pinDialog.on('click', function(d, i) {
        _this.pinDialog(d.id);
      });

      this.root.element.addEventListener('click', function() {
        _this.closeAllDialogs();
      });

      d3.select(this.root.element).on("mousedown", function(e) {
        if(!this._active_comp) return; //don't do anything if nothing is open
  
        var target = d3.event.target;
        var closeDialog = true;
        while(target) {
          if(target.classList.contains("vzb-dialog-modal")) {
            closeDialog = false;
            break;
          }
          target = target.parentElement;
        }
        if(closeDialog) {
          _this.closeAllDialogs();
        }
      });
    }
  
    this.element.on('click', function() {
      d3.event.stopPropagation();
    });
  
  },
  
  /*
   * adds dialogs configuration to the components and template_data
   * @param {Array} dialog_list list of dialogs to be added
   */
  _addDialogs: function(dialog_popup, dialog_sidebar) {

    var dialog_list = [];
    
    dialog_list = dialog_popup ? dialog_list.concat(dialog_popup) : dialog_list;
    dialog_list = dialog_sidebar ? dialog_list.concat(dialog_sidebar) : dialog_list;
//    dialog_list = dialog_moreoptions ? dialog_list.concat(dialog_moreoptions) : dialog_list;
    
    //TODO: test speed with utils.unique
    dialog_list = dialog_list.sort().reduce(function (a, b) {
        if(a[a.length - 1] !== b) {
          return a.concat(b);
        }
        return a;
      }, []);

    this._components_config = [];
    var details_dlgs = [];
    if(!dialog_list.length) return;
    //add a component for each dialog
    for(var i = 0; i < dialog_list.length; i++) {

      var dlg = dialog_list[i];
      var dlg_config = this._available_dialogs[dlg];

      //if it's a dialog, add component
      if(dlg_config && dlg_config.dialog) {
        var comps = this._components_config;

        //add corresponding component
        comps.push({
          component: dlg_config.dialog,
          placeholder: '.vzb-dialogs-dialog[data-btn="' + dlg + '"]',
          model: ["state", "ui", "language"]
        });

        dlg_config.component = comps.length - 1;
      }

      //add template data
      var d = (dlg_config) ? dlg : "_default";
      var details_dlg = this._available_dialogs[d];

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
    
  },
  
  bringForward: function(id) {
    var dialog = this.element.select(".vzb-popup.vzb-dialogs-dialog[data-btn='" + id + "']");
    dialog.style('z-index', this._curr_dialog_index);
    this._curr_dialog_index += 10;
  },

  //TODO: make opening/closing a dialog via update and model
  /*
   * Activate a dialog
   * @param {String} id dialog id
   */
  openDialog: function(id) {
    
    this.closeAllDialogs();

    var dialog = this.element.selectAll(".vzb-popup.vzb-dialogs-dialog[data-btn='" + id + "']");

    this._active_comp = this.components[this._available_dialogs[id].component];

    this._active_comp.beforeOpen();
    //add classes
    dialog.classed(class_active, true);

    this.bringForward(id);

    // if (this.getLayoutProfile() === 'large' && this.model.ui.buttons_expand.indexOf(id) !== -1) {
    //   dialog.classed(class_expand_dialog, true);
    // }

    //call component function
    this._active_comp.open();
  },


  pinDialog: function(id) {
    var dialog = this.element.select(".vzb-popup.vzb-dialogs-dialog[data-btn='" + id + "']");

    if(this._available_dialogs[id].ispin) {
      dialog.classed('pinned', false);
      this._available_dialogs[id].ispin = false;
    } else {
      dialog.classed('pinned', true);
      this._available_dialogs[id].ispin = true;
    }
  },


  /*
   * Closes a dialog
   * @param {String} id dialog id
   */
  closeDialog: function(id) {
    var dialog = this.element.selectAll(".vzb-popup.vzb-dialogs-dialog[data-btn='" + id + "']");

    this._active_comp = this.components[this._available_dialogs[id].component];

    if(this._active_comp && !this._active_comp.isOpen) return;
    
    if(this._available_dialogs[id].ispin)
      this.pinDialog(id);

    if(this._active_comp) {
      this._active_comp.beforeClose();
    }
    //remove classes
    dialog.classed(class_active, false);

    // if (this.getLayoutProfile() === 'large' && this.model.ui.buttons_expand.indexOf(id) !== -1) {
    //   dialog.classed(class_expand_dialog, false);
    // }

    //call component close function
    if(this._active_comp) {
      this._active_comp.close();
    }
    this._active_comp = false;
    
  },

  /*
   * Close all dialogs
   */
  closeAllDialogs: function(forceclose) {
    var _this = this;
    //remove classes   
    var dialogClass = forceclose ? ".vzb-popup.vzb-dialogs-dialog.vzb-active" : ".vzb-popup.vzb-dialogs-dialog.vzb-active:not(.pinned)";
    var all_dialogs = this.element.selectAll(dialogClass);
      all_dialogs.each(function(d) {
        _this.closeDialog(d.id)
      });
  }
  
});

export default Dialogs;
