/* 
  Breaking changes from 2.0 to 3.0:
    GMCP > nexusclient.datahandler().GMCP
    get_variable > nexusclient.variables().get()
    set_variable > nexusclient.variables().set()
    run_function > nexusclient.reflexes().run_function()
    $
*/


import { aliases } from "./aliases";
import { generateGraph } from "./graph";
import { mongo } from "./mongo";
import { changeRoom, farseeArea, farseeLocal, onGMCP } from "./navigation";
import { styles } from "./styles";
import { speedWalk } from "./walker";

export const nexmap = {
  speedwalk: speedWalk,
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
  styles: styles,
  aliases: aliases,
  mongo: mongo,

  startup() {
    document.getElementById('cy')?.remove();
    const nexmapTab = document.getElementById('tbl_nexmap_map')

    nexmapTab.appendChild(Object.assign(document.createElement('div'), {id: 'currentRoomLabel'}));
    nexmapTab.appendChild(Object.assign(document.createElement('div'), {id: 'cy'}));
    nexmapTab.appendChild(Object.assign(document.createElement('div'), {id: 'currentExitsLabel', style: 'position:absolute;bottom:0px'}));
    styles.style();

    fetch("https://ire-mudlet-mapping.github.io/AchaeaCrowdmap/Map/map_mini.json")
      .then(response => response.json())
      .then(async data => {
        let graph = await generateGraph(data);
        window.cy.add(graph)
      })
      .then(() => {
        window.cy.mount(document.getElementById('cy'))
        nexmap.changeRoom(6534)
      })
  }
}

window.nexmap = nexmap;