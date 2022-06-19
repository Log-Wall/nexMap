import { longDirs } from "./helpertables";
import { generateSVG } from "./styles";
import { stylesheet } from './styles';
import cytoscape from 'cytoscape';

/* global cy */
window.cy = cytoscape({
    container: undefined,//document.getElementById('cy'),
    layout: 'grid',
    style: stylesheet,
    zoom: 1.25,
    minZoom: 0.2,
    maxZoom: 3,
    wheelSensitivity: 0.5,
    boxSelectionEnabled: false,
    selectionType: 'single',
  
    hideEdgesOnViewport: true,
    textureOnViewport: true,
    motionBlur: true,
    pixelRatio: 'auto',
  });

export const generateGraph = async (graph) => {
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

export const generateExits = (currentArea, currentZ) => {
    let exitIndex = 0;

    let createExit = function (position, cmd, tar) {
        let pos = {
            ...position
        }
        switch (cmd) {
            case 's':
                pos.y += 20;
                break;
            case 'n':
                pos.y += 20;
                break;
            case 'e':
                pos.x += 20;
                break;
            case 'w':
                pos.x += -20;
                break;
            case 'se':
                pos.x += 20;
                pos.y += 20;
                break;
            case 'sw':
                pos.x += -20;
                pos.y += 20;
                break;
            case 'ne':
                pos.x += 20;
                pos.y += -20;
                break;
            case 'nw':
                pos.x += -20;
                pos.y += -20;
                break;
            default:
                break;
        }

        let newNode = {
            group: 'nodes',
            data: {
                id: `pseudo${exitIndex}`,
            },
            position: {
                x: pos.x,
                y: pos.y,
                z: pos.z
            },
            classes: ['pseudo', tar ? 'areaAdjacent' : `pseudo-${cmd}`],
        };

        cy.add(newNode);

        if (tar) {
            cy.add({
                group: 'edges',
                data: {
                    id: `pseudoE${exitIndex}`,
                    source: tar,
                    target: newNode.data.id,
                    weight: 1
                },
                classes: ['pseudo', 'areaAdjacentExit'],
            });
        }
        exitIndex++;
    }

    let x = cy.edges().filter(e =>
        e.data('area') === currentArea && e.data('z') === currentZ
    );

    x.filter(e => ['up', 'd', 'in', 'out'].includes(e.data('command')))
        .forEach(e => createExit(e.source().position(), e.data('command')));

    let xe = x.filter(e => ['s', 'n', 'e', 'w', 'ne', 'nw', 'se', 'sw'].includes(e.data('command')));
    xe = xe.filter(e => e.target().data('area') !== currentArea || e.target().data('z') !== currentZ);

    xe.forEach(e => createExit(e.source().position(), e.data('command'), e.data('source')));
}