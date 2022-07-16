/* 
  Breaking changes from 2.0 to 3.0:
    GMCP > nexusclient.datahandler().GMCP
    get_variable > nexusclient.variables().get()
    set_variable > nexusclient.variables().set()
    run_function > nexusclient.reflexes().run_function()
    send_direct > nexusclient.send_commands()
    $ > all jQuery references
*/

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
  version: '3.0.7',
  nxsVersion: '3.0.7',
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

window.nexmap = nexmap;