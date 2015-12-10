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
// var class_active = "vzb-active";
// var class_active_locked = "vzb-active-locked";
// var class_expand_dialog = "vzb-dialog-side";
// var class_hide_btn = "vzb-dialog-side-btn";
// var class_unavailable = "vzb-unavailable";
// var class_vzb_fullscreen = "vzb-force-fullscreen";
// var class_container_fullscreen = "vzb-container-fullscreen";

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
    this.template = '<div class="vzb-dialogs"></div>';
    
    this._super(config, context);

  }
});

export default Dialogs;
