/* 
  Breaking changes from 2.0 to 3.0:
    GMCP > nexusclient.datahandler().GMCP
    get_variable > nexusclient.variables().get()
    set_variable > nexusclient.variables().set()
    run_function > nexusclient.reflexes().run_function()
    send_direct > nexusclient.send_commands()
    $ > all jQuery references
*/

/*global nexusclient, React */

import { aliases } from "./base/aliases";
import { generateGraph } from "./base/graph";
import { mongo } from "./base/mongo";
import { changeRoom, farseeArea, farseeLocal, onGMCP } from "./base/navigation";
import { styles } from "./base/styles";
import { walker } from "./base/walker";
import { userPreferences, save } from "./base/settings";
import Nexmap from "./components/Nexmap";

export const nexmap = {
  evt: new EventTarget(),
  components: {
    Nexmap: Nexmap,
  },
  version: '1.0.7',
  nxsVersion: '1.0.7',
  logging: false,
  loggingTime: '',
  cytoscapeLoaded: false,
  mudletMapLoaded: false,
  currentRoom: -99,
  currentArea: -99,
  currentZ: -99,
  wormholes: {},
  sewergrates: {},

  /* import mappings */
  generateGraph: generateGraph,
  farseeLocal: farseeLocal,
  farseeArea: farseeArea,
  changeRoom: changeRoom,
  onGMCP: onGMCP,
  
  settings: {
    userPreferences: userPreferences,
    save: save,
  },
  styles: styles,
  aliases: aliases,
  mongo: mongo,
  walker: walker,
}

Object.setAtString = function (obj, dotarr, val) {
  let a = dotarr.shift()
  if (dotarr.length === 0) {
      // if at last element in chain, set value
      if (obj[a] === undefined) {
          obj[a] = {}
      }
      if (Array.isArray(val)) {
          obj[a] = val
      } else if (typeof val === 'object') {
          Object.assign(obj[a], val)
          /*
        for(key in val) {
            obj[a][key] = val[key];
        }
        */
      } else {
          obj[a] = val
      }
      return
  } else {
      if (obj[a] === undefined) {
          obj[a] = {}
      }
      Object.setAtString(obj[a], dotarr, val)
  }
}

window.GMCP = nexusclient.datahandler().GMCP;
window.GMCP.Room = {};
window.GMCP.Char = {
  Items: {}
};

if (typeof nexusclient.ui().layout().get_tab_object_original === 'undefined') {
  nexusclient.ui().layout().get_tab_object_original = nexusclient.ui().layout().get_tab_object;
  nexusclient.ui().layout().get_tab_object = function(name, gmcp) {
    switch (name) {
      case 'nexmap':
        return React.createElement(nexmap.components.Nexmap, {
          evt: nexmap.evt,
          settings: nexmap.settings.userPreferences
        });
        break;

      default:
        return nexusclient._ui._layout.get_tab_object_original(name, gmcp)
        break;
    }
  };
}

if (typeof nexusclient.ui().layout().flexLayout.model.getNodeById('nexmap') === 'undefined') {
  let tt = {
    component: "nexmap",
    helpText: "nexmap",
    icon: "feather-pointed",
    id: "nexmap",
    name: "nexmap",
    type: "tab"
  };
  nexusclient.ui().layout().flexLayout.addTab(tt, nexusclient.ui().layout().flexLayout.model.getNodeById('map').getParent().getId());
}

nexusclient.reflexes().disable_reflex(nexusclient.reflexes().find_by_name("group", "Aliases", false, false, "nexmap3"));
nexusclient.reflexes().disable_reflex(nexusclient.reflexes().find_by_name("group", "Triggers", false, false, "nexmap3"));

window.nexmap = nexmap;