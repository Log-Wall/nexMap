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
import { save, userPreferences } from "./base/settings";
import { styles } from "./base/styles";
import { walker } from "./base/walker";
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

if (typeof nexusclient.ui().layout().get_tab_object_original === 'undefined') {
  nexusclient.ui().layout().get_tab_object_original = nexusclient.ui().layout().get_tab_object;
}
nexusclient.ui().layout().get_tab_object = function(name, gmcp) {
  if (name === 'nexmap') {
    return React.createElement(nexmap.components.Nexmap, {
      evt: nexmap.evt,
      settings: nexmap.settings.userPreferences
    });
  }

  return nexusclient._ui._layout.get_tab_object_original(name, gmcp)
};

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

window.nexmap = nexmap;