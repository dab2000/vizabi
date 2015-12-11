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

var closeCallback;
var pinCallback;

var Dialogs = Component.extend({

  closeCallback: function(input) {
    if(!arguments.length) return closeCallback;
    closeCallback = input;
    return this;
  },
  pinCallback: function(input) {
    if(!arguments.length) return pinCallback;
    pinCallback = input;
    return this;
  },

  /**
   * Initializes the dialogs
   * @param config component configuration
   * @param context component context (parent)
   */
  init: function(config, context) {

    //set properties
    var _this = this;
    this.name = 'gapminder-dialogs';
    this.template = '<div class="vzb-dialogs"></div>';
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
    
    this._available_buttons = {
      'find': {
        title: "buttons/find",
        icon: "search",
        dialog: dialogs.find,
        ispin: false,
        required: false,
        isgraph: false
      },
      'show': {
        title: "buttons/show",
        icon: "asterisk",
        dialog: dialogs.show,
        ispin: false,
        required: false,
        isgraph: false
      },
      'moreoptions': {
        title: "buttons/more_options",
        icon: "gear",
        dialog: dialogs.moreoptions,
        ispin: false,
        required: true,
        isgraph: false
      },
      'colors': {
        title: "buttons/colors",
        icon: "paintbrush",
        dialog: dialogs.colors,
        ispin: false,
        required: false,
        isgraph: false
      },
      'size': {
        title: "buttons/size",
        icon: "circle",
        dialog: dialogs.size,
        ispin: false,
        required: false,
        isgraph: false
      },
      'fullscreen': {
        title: "buttons/expand",
        icon: "expand",
        dialog: false,
        required: true,
        isgraph: false
      },
      'trails': {
        title: "buttons/trails",
        icon: "trails",
        dialog: false,
        required: false,
        isgraph: true
      },
      'lock': {
        title: "buttons/lock",
        icon: "lock",
        dialog: false,
        required: false,
        isgraph: true
      },
      'presentation': {
        title: "buttons/presentation",
        icon: "presentation",
        dialog: false,
        func: null,
        required: false,
        isgraph: false
      },
      'axes': {
        title: "buttons/axes",
        icon: "axes",
        dialog: dialogs.axes,
        ispin: false,
        required: false,
        isgraph: false
      },
      'axesmc': {
        title: "buttons/axesmc",
        icon: "axes",
        dialog: dialogs.axesmc,
        ispin: false,
        required: false,
        isgraph: false
      },
      'stack': {
        title: "buttons/stack",
        icon: "stack",
        dialog: dialogs.stack,
        ispin: false,
        required: false,
        isgraph: false
      },
      '_default': {
        title: "Button",
        icon: "asterisk",
        dialog: false,
        required: false,
        isgraph: false
      }
    };
    
    this._super(config, context);

  },
  
  readyOnce: function() {

    var _this = this;
    var button_expand = this.model.ui.buttons_expand;

    this.element = d3.select(this.element);
    this.dialogContainerEl = d3.select(".vzb-dialogs");
  
    // if button_expand has been passed in with boolean param or array must check and covert to array
    if (button_expand){
      this.model.ui.buttons_expand = (button_expand === true) ? this.model.ui.buttons : button_expand;
    }

    if (button_expand.length !== 0) {
        d3.select(this.root.element).classed("vzb-button-expand-true", true);
    }
    
    var button_list = [].concat(button_expand);

    this.model.ui.buttons.forEach(function(button) {
      if (button_list.indexOf(button) === -1) {
        button_list.push(button);
      }
    });

    this.model.ui.buttons = button_list;

    //add buttons and render components
    if(this.model.ui.buttons) {
      this._addButtons();
    }
  
    var close_buttons = this.dialogContainerEl.selectAll(".vzb-dialogs-dialog").select("[data-click='closeDialog']");
    close_buttons.on('click', function(type, index) {
      _this.closeDialog(_this.model.ui.buttons[index]);
    });
    var pinDialog = this.dialogContainerEl.selectAll("[data-click='pinDialog']");
    pinDialog.on('click', function() {
      _this.pinDialog(this);
    });

    this.dialogContainerEl.on('click', function() {
      d3.event.stopPropagation();
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
  
  },  /*
   * adds buttons configuration to the components and template_data
   * @param {Array} button_list list of buttons to be added
   */
  _addButtons: function() {

    this._components_config = [];
    var button_list = this.model.ui.buttons;
    var details_btns = [],
        button_expand = this.model.ui.buttons_expand;
    if(!button_list.length) return;
    //add a component for each button
    for(var i = 0; i < button_list.length; i++) {

      var btn = button_list[i];
      var btn_config = this._available_buttons[btn];

      //if it's a dialog, add component
      if(btn_config && btn_config.dialog) {
        var comps = this._components_config;

        //add corresponding component
        comps.push({
          component: btn_config.dialog,
          placeholder: '.vzb-dialogs-dialog[data-btn="' + btn + '"]',
          model: ["state", "ui", "language"]
        });

        btn_config.component = comps.length - 1;
      }

      //add template data
      var d = (btn_config) ? btn : "_default";
      var details_btn = this._available_buttons[d];

      details_btn.id = btn;
      details_btns.push(details_btn);
    };

    this.dialogContainerEl.selectAll('div').data(details_btns)
      .enter().append("div")
      .attr('class', function (d) {
        var cls = 'vzb-dialogs-dialog';
        if (button_expand && button_expand.length > 0) {
          if (button_expand.indexOf(d.id) > -1) {
            cls += ' vzb-dialog-side';
          }
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
    });
    
  },
  
  bringForward: function(id) {
    var dialog = this.element.select(".vzb-dialogs-dialog[data-btn='" + id + "']");
    dialog.style('z-index', this._curr_dialog_index);
    this._curr_dialog_index += 10;
  },

  //TODO: make opening/closing a dialog via update and model
  /*
   * Activate a button dialog
   * @param {String} id button id
   */
  openDialog: function(id) {

    this.closeAllDialogs();

    //var btn = this.element.selectAll(".vzb-buttonlist-btn[data-btn='" + id + "']");
    var dialog = this.element.selectAll(".vzb-dialogs-dialog[data-btn='" + id + "']");

    this._active_comp = this.components[this._available_buttons[id].component];

    this._active_comp.beforeOpen();
    //add classes
    //btn.classed(class_active, true);
    dialog.classed(class_active, true);

    this.bringForward(id);

    if (this.getLayoutProfile() === 'large' && this.model.ui.buttons_expand.indexOf(id) !== -1) {
      //btn.classed(class_hide_btn, true);
      dialog.classed(class_expand_dialog, true);
    }

    //call component function
    this._active_comp.open();
  },


  pinDialog: function(button) {
    var id = typeof button === 'string' ? button : button.getAttribute('data-dialogtype');
    //var btn = this.element.select(".vzb-buttonlist-btn[data-btn='" + id + "']");
    var dialog = this.element.select(".vzb-dialogs-dialog[data-btn='" + id + "']");
    if(this._available_buttons[id].ispin) {
      // button.textContent = '';
      //btn.classed('pinned', false);
      this.element.select(".vzb-dialogs-dialog[data-btn='" + id + "']").classed('pinned', false);
      this._available_buttons[id].ispin = false;
      this._active_comp.isPin = false;
    } else {
      //  button.textContent = '';
      //btn.classed('pinned', true);
      dialog.classed('pinned', true);
      this._available_buttons[id].ispin = true;
      this._active_comp.isPin = true;
    }
  },


  /*
   * Closes a button dialog
   * @param {String} id button id
   */
  closeDialog: function(id) {
    //var btn = this.element.selectAll(".vzb-buttonlist-btn[data-btn='" + id + "']");
    var dialog = this.element.selectAll(".vzb-dialogs-dialog[data-btn='" + id + "']");

    this._active_comp = this.components[this._available_buttons[id].component];

    if(this._available_buttons[id].ispin)
      this.pinDialog(id);

    if(this._active_comp) {
      this._active_comp.beforeClose();
    }
    //remove classes
    //btn.classed(class_active, false);
    dialog.classed(class_active, false);

    if (this.getLayoutProfile() === 'large' && this.model.ui.buttons_expand.indexOf(id) !== -1) {
      //btn.classed(class_hide_btn, false);
      dialog.classed(class_expand_dialog, false);
    }

    //call component close function
    if(this._active_comp) {
      this._active_comp.close();
    }
    this._active_comp = false;
    
    if(closeCallback) closeCallback(id);
  },

  /*
   * Close all dialogs
   */
  closeAllDialogs: function(forceclose) {
    //remove classes
    //var btnClass = forceclose ? ".vzb-buttonlist-btn" : ".vzb-buttonlist-btn:not(.pinned)";
    var dialogClass = forceclose ? ".vzb-dialogs-dialog" : ".vzb-dialogs-dialog:not(.pinned)";
    //var all_btns = this.element.selectAll(btnClass);
    var all_dialogs = this.element.selectAll(dialogClass);
    if(forceclose)
      this.unpinAllDialogs();

    if(this._active_comp && (forceclose || !this._available_buttons[this._active_comp.name].ispin)) {
      this._active_comp.beforeClose();
    }

    //all_btns.classed(class_active, false);
    all_dialogs.classed(class_active, false);

    //call component close function
    if(this._active_comp && (forceclose || !this._available_buttons[this._active_comp.name].ispin)) {
      this._active_comp.close();
    }
    if(this._active_comp && !this._available_buttons[this._active_comp.name].ispin)
      this._active_comp = false;

    this.model.state.entities.setNeedUpdate();
  },

  unpinAllDialogs: function() {
    var availBtns = this._available_buttons;
    var keys = Object.keys(availBtns);
    keys.forEach(function(dialogName) {
      if(availBtns[dialogName].ispin)
        this.pinDialog(dialogName);
    }.bind(this));
  }

  
});

export default Dialogs;
