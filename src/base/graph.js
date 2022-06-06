import { longDirs } from "./helpertables";
import { generateSVG } from "./styles";

export const generateGraph = (graph) => {
    /** Generate nodes */
    let graphModel =  [];
    for (const area of graph.areas) {
        if (area.roomCount === 0) { continue; }
        graphModel = graphModel.concat(createRooms(area));
    }

    return graphModel;
}

const createRooms = (area) => {
  let graph = [];
  for (const room of area.rooms) {
    let exits, edges;
    [exits, edges] = createExits(room, area.id);
    let node = {
      group: 'nodes',
      data: {
          id: room.id,
          area: area.id,
          areaName: area.name,
          environment: room.environment,
          name: room.name,
          continent: area.continent,
          userData: room.userData,
          coordinates: room.coordinates,
          z: room.coordinates[2],
          exits: exits,
          symbol: room.symbol ? room.symbol : false,
      },
      position: {
          x: room.coordinates[0] * 20,
          y: room.coordinates[1] * -20,
          z: room.coordinates[2]
      },
      classes: [`environment${room.environment}`],
      locked: true,
    };
    
    if (room?.symbol?.text && ['S', 'F', 'G', 'C', 'N', 'M', '$', 'L', 'H', 'W', 'A', 'P', 'B'].includes(room.symbol.text)) {
      node.classes.push('backgroundImageRoom');
      node.data.image = generateSVG(room.symbol.text);
    }

    graph.push(node);
    graph = graph.concat(edges);
  }

  return graph;  
}

const createExits = (room, areaId) => {
  const edges = [];
  const exits = [];
  let command;

  for (const exit of room.exits) {
    // Convert long exit names to short.northwest to nw
    command = longDirs[exit.name] ? longDirs[exit.name] : exit.name;
    let edge = {
      group: 'edges',
      data: {
          id: `${room.id}-${exit.exitId}`,
          source: room.id,
          target: exit.exitId,
          weight: 1,
          area: areaId,
          command: command,
          door: exit.door ? exit.door : false,
          z: room.coordinates[2]
      }
    }
    edge.data.classes = addExitClasses(edge.data);

    /*
    if (command.includes('sendAll') && !xt.includes('if')) {
        command = command.substr(command.indexOf("(")+1, command.indexOf(")") - command.indexOf("(") - 1)
                .replace(/["']/g, '')
                    .replace(/,\s?/g, nexMap.settings.userPreferences.commandSeparator);
    } else if (command.includes('send(') && !command.includes('if')) {
        command = command.substr(command.indexOf("(")+1, command.indexOf(")") - command.indexOf("(") - 1)
                .replace(/["']/g, '');
    }
    */

    exits.push(command);
    edges.push(edge);
  }

  return [exits, edges];
}

const addExitClasses = (data) => {
    let classes = [];
    
    if (data.door) {
        classes.push('doorexit');
    }

    switch (data.command) {
        case 'in':
            classes.push('inexit');
            break;
        case 'out':
            classes.push('outexit');
            break;
        case 'up':
            classes.push('upexit');
            break;
        case 'down':
            classes.push('downexit');
            break;
        case 'worm warp':
            classes.push('wormhole');
            break;
        case 'enter grate':
            classes.push('sewergrate');
            break;
        default:
            break;
    }

    return classes;
}