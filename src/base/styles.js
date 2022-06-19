/* global cy */
import { stop, speedWalk } from './walker.js';
import { notice } from './display.js';
import { changeRoom, changeArea } from './navigation';
import { nexmap } from './nexmap.js';

export const style = () => {
    if (nexmap.logging) {
        console.log('nexMap: nexMap.style()')
    };

    cy.on('mouseout', 'node', evt => {
        evt.target.removeClass('displayLabel');
    }); // Pop up labels on mouseover
    cy.on('mouseover', 'node', evt => {
        evt.target.flashClass('displayLabel', 3000)
    }); // Pop up labels on mouseover
    cy.on('zoom', evt => {
        cy.style().selector('.displayLabel').style({
            'font-size': `${12 * (1 / cy.zoom())}px`
        })
    }) //Increases the size of the label based on the zoom level.
    cy.on('unselect', 'node', evt => {
        stop()
    });
    cy.on('select', 'node', evt => {
        speedWalk()
    });

    let generateStyle = function () {
        let inject = function (rule) {
            document.body.appendChild('<div class="client_nexmap-rules">&shy;<style>' + rule + '</style></div>');
        };

        if (document.querySelector('.client_nexmap-ruless')) {
            document.querySelector('.client_nexmap-ruless').remove();
        }
        
        let nexMapCSS = '.nexswitch {position: relative;display: inline-block;width: 38px;height: 22px;}' +
            'cy {width: 100%;height: calc(100% - 44px);position: absolute;overflow: hidden;top: 0px;left: 0px;margin-top: 22px;margin-bottom: 22px}' +
            '.nexswitch input {opacity: 0;width: 0;height: 0;}' +
            '.nexslider {position: absolute;cursor: pointer;top: 0;left: 0;right: 0;bottom: 0;background-color: #555555;-webkit-transition: .4s;transition: .4s;border-radius: 24px;}' +
            '.nexslider:before {position: absolute;content: "";height: 16px;width: 16px;left: 3px;bottom: 3px;background-color: white;-webkit-transition: .4s;transition: .4s;border-radius: 50%;}' +
            'input:checked + .nexslider {background-color: #2196F3;}' +
            'input:focus + .nexslider {box-shadow: 0 0 1px #2196F3;}' +
            'input:checked + .nexslider:before {-webkit-transform: translateX(16px);-ms-transform: translateX(16px);transform: translateX(16px);}' +
            '.nexcontainer   { display: flex; }' +
            '.nexfixed    { width: 200px; }' +
            '.nexflex-item    { flex-grow: 1; }';
        if (window.css_style !== 'standard')
            nexMapCSS += '#tab_nexmap_map::before {content: "\\f2ae";}';

        inject(nexMapCSS);
    };
    generateStyle();
}

export const refresh = () => {
    if (typeof cy.unmount !== 'function') {
        notice(`nexMap not loaded. Please run "nm load".`);
        return;
    }
    setTimeout(async function(){
        await Promise.all([
            changeRoom(nexmap.currentRoom),
            changeArea(nexmap.currentArea, nexmap.currentZ, true)
        ])
    }, 500);  
}

export const generateSVG = (txt) => {
  let svg_pin = document.createElement('svg');
  svg_pin.setAttribute('width',"100");
  svg_pin.setAttribute('height', "100");
  svg_pin.setAttribute('viewBox', '0 0 100 100');
  svg_pin.setAttribute('version', '1.1');
  svg_pin.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg_pin.setAttribute('xmlns', "http://www.w3.org/2000/svg");
  
  let svg_text = document.createElement('text');
  svg_text.setAttribute('x', "50");
  svg_text.setAttribute('y', "60");
  svg_text.setAttribute('font-size', '90px');
  svg_text.setAttribute('dominant-baseline', 'middle');
  svg_text.setAttribute('text-anchor', 'middle');
  svg_text.setAttribute('fill', "black");
    /*stroke: "black",
    'stroke-width': '5px',
    'stroke-linecap': 'butt',
    'stroke-linejoin': 'miter',*/
  svg_text.setAttribute('font-family', "Arial, monospace");
  svg_text.setAttribute('text-align', 'center');
  svg_text.setAttribute('font-weight', 'bold');

  svg_text.appendChild(document.createTextNode(txt));
  svg_pin.appendChild(svg_text);

  let svgpin_Url = encodeURI("data:image/svg+xml;utf-8," + svg_pin.outerHTML);

  return svgpin_Url;
}

export const stylesheet = [
  {
      'selector': 'node',
      'style': {
          'shape': 'rectangle',
          'width': '10',
          'height': '10',
          'border-color': 'black',
          'border-width': '0.5',
          'display': 'none',
      }
  },
  {
      'selector': 'edge',
      'style': {
          'width': '1',
          'line-color': 'grey'
      }
  },
  {
      'selector': '[image]',
      'style': {
          'background-image': 'data(image)',
          'background-fit': 'contain contain',
          'background-width': '100%',
          'background-height': '100%',
          "background-repeat": "no-repeat",
          "background-clip": "none"
      }
  },
  /*{
      'selector':'node[wormhole = true]',
      'style': {
          'background-image': 'data(image)',
          'background-fit':'contain',
          'background-width':'100%',
          'background-height':'100%',
      }
  },*/
  {
      'selector': '.displayLabel',
      'style': {
          'color': 'white',
          'label': 'data(name)',
          "min-zoomed-font-size": "12pt"
      }
  },
  {
      'selector': '.areaDisplay',
      'style': {
          'display': 'element'
      }
  },
  {
      'selector': '.areaAdjacent',
      'style': {
          'visibility': 'hidden',
          'display': 'element'
      }
  },
  {
      'selector': '.wormhole',
      'style': {
          'visibility': 'hidden',
          'width': '1',
          'line-style': 'dashed',
          'line-dash-pattern': [5, 10],
          'line-color': '#8d32a8'
      }
  },
  {
      'selector': '.sewergrate',
      'style': {
          'visibility': 'hidden'
      }
  },
  {
      "selector": ".downexit",
      "style": {
          "visibility": "hidden",
          "curve-style": "bezier",
          "source-arrow-shape": "triangle"
      }
  },
  {
      "selector": ".upexit",
      "style": {
          "visibility": "hidden",
          "curve-style": "bezier",
          "source-arrow-shape": "triangle"
      }
  },
  {
      "selector": ".inexit",
      "style": {
          "visibility": "hidden",
          "curve-style": "bezier",
          "source-arrow-shape": "circle"
      }
  },
  {
      "selector": ".outexit",
      "style": {
          "visibility": "hidden",
          "curve-style": "bezier",
          "source-arrow-shape": "circle"
      }
  },
  {
      "selector": ".doorexit",
      "style": {
          'curve-style': 'straight',
          'mid-source-arrow-shape': 'tee',
          'mid-target-arrow-shape': 'tee',
          'arrow-scale': .65
      }
  },
  {
      "selector": ".pseudo-d",
      "style": {
          "display": "element",
          "label": "",
          "shape": "polygon",
          "shape-polygon-points": "-0.6 -0.7 0.6 -0.7 0 -0.1",
          "background-color": "rgb(255,255,255)",
          "border-color": "rgb(0,0,0)",
          "border-width": "0.5px"
      }
  },
  {
      "selector": ".pseudo-up",
      "style": {
          "display": "element",
          "label": "",
          "shape": "polygon",
          "shape-polygon-points": "0.6 0.7 -0.6 0.7 0 0.1",
          "background-color": "rgb(255,255,255)",
          "border-color": "rgb(0,0,0)",
          "border-width": "0.5px"
      }
  },
  {
      "selector": ".pseudo-in",
      "style": {
          "display": "element",
          "label": "",
          "shape": "polygon",
          "shape-polygon-points": "0.7 -0.6 0.7 0.6 0.1 0",
          "background-color": "rgb(255,255,255)",
          "border-color": "rgb(0,0,0)",
          "border-width": "0.5px"
      }
  },
  {
      "selector": ".pseudo-out",
      "style": {
          "display": "element",
          "label": "",
          "shape": "polygon",
          "shape-polygon-points": "-0.7 0.6 -0.7 -0.6 -0.1 0",
          "background-color": "rgb(255,255,255)",
          "border-color": "rgb(0,0,0)",
          "border-width": "0.5px"
      }
  },
  {
      "selector": ".areaAdjacentExit",
      "style": {
          "display": "element",
          "curve-style": "straight",
          "arrow-scale": "0.75",
          "target-arrow-shape": "vee"
      }
  },
  {
      "selector": ".environment2",
      "style": {
          "background-color": "rgb(128,115,95)"
      }
  },
  {
      "selector": ".environment3",
      "style": {
          "background-color": "rgb(118,81,22)"
      }
  },
  {
      "selector": ".environment4",
      "style": {
          "background-color": "rgb(54,102,46)"
      }
  },
  {
      "selector": ".environment5",
      "style": {
          "background-color": "rgb(255,255,204)"
      }
  },
  {
      "selector": ".environment6",
      "style": {
          "background-color": "rgb(249,253,0)"
      }
  },
  {
      "selector": ".environment7",
      "style": {
          "background-color": "rgb(29,199,19)"
      }
  },
  {
      "selector": ".environment8",
      "style": {
          "background-color": "rgb(189,160,203)"
      }
  },
  {
      "selector": ".environment9",
      "style": {
          "background-color": "rgb(45,119,32)"
      }
  },
  {
      "selector": ".environment10",
      "style": {
          "background-color": "rgb(0,221,255)"
      }
  },
  {
      "selector": ".environment11",
      "style": {
          "background-color": "rgb(131,119,102)"
      }
  },
  {
      "selector": ".environment12",
      "style": {
          "background-color": "rgb(124,124,124)"
      }
  },
  {
      "selector": ".environment13",
      "style": {
          "background-color": "rgb(65,171,47)"
      }
  },
  {
      "selector": ".environment14",
      "style": {
          "background-color": "rgb(88,74,52)"
      }
  },
  {
      "selector": ".environment15",
      "style": {
          "background-color": "rgb(118,132,60)"
      }
  },
  {
      "selector": ".environment16",
      "style": {
          "background-color": "rgb(197,252,255)"
      }
  },
  {
      "selector": ".environment17",
      "style": {
          "background-color": "rgb(137,225,75)"
      }
  },
  {
      "selector": ".environment18",
      "style": {
          "background-color": "rgb(171,158,109)"
      }
  },
  {
      "selector": ".environment19",
      "style": {
          "background-color": "rgb(86,165,116)"
      }
  },
  {
      "selector": ".environment20",
      "style": {
          "background-color": "rgb(0,0,255)"
      }
  },
  {
      "selector": ".environment21",
      "style": {
          "background-color": "rgb(148,228,93)"
      }
  },
  {
      "selector": ".environment22",
      "style": {
          "background-color": "rgb(95,240,240)"
      }
  },
  {
      "selector": ".environment23",
      "style": {
          "background-color": "rgb(145,128,16)"
      }
  },
  {
      "selector": ".environment24",
      "style": {
          "background-color": "rgb(0,51,102)"
      }
  },
  {
      "selector": ".environment25",
      "style": {
          "background-color": "rgb(249,129,103)"
      }
  },
  {
      "selector": ".environment27",
      "style": {
          "background-color": "rgb(255,255,255)"
      }
  },
  {
      "selector": ".environment28",
      "style": {
          "background-color": "rgb(0,227,66)"
      }
  },
  {
      "selector": ".environment29",
      "style": {
          "background-color": "rgb(153,0,0)"
      }
  },
  {
      "selector": ".environment30",
      "style": {
          "background-color": "rgb(77,66,212)"
      }
  },
  {
      "selector": ".environment31",
      "style": {
          "background-color": "rgb(221,68,0)"
      }
  },
  {
      "selector": ".environment32",
      "style": {
          "background-color": "rgb(221,186,130)"
      }
  },
  {
      "selector": ".environment33",
      "style": {
          "background-color": "rgb(131,119,102)"
      }
  },
  {
      "selector": ".environment34",
      "style": {
          "background-color": "rgb(0,0,255)"
      }
  },
  {
      "selector": ".environment35",
      "style": {
          "background-color": "rgb(255,255,255)"
      }
  },
  {
      "selector": ".environment36",
      "style": {
          "background-color": "rgb(145,128,16)"
      }
  },
  {
      "selector": ".environment39",
      "style": {
          "background-color": "rgb(145,128,16)"
      }
  },
  {
      "selector": ".environment40",
      "style": {
          "background-color": "rgb(192,192,192)"
      }
  },
  {
      "selector": ".environment41",
      "style": {
          "background-color": "rgb(192,192,192)"
      }
  },
  {
      "selector": ".environment42",
      "style": {
          "background-color": "rgb(207,16,32)"
      }
  },
  {
      "selector": ".environment43",
      "style": {
          "background-color": "rgb(0,112,31)"
      }
  },
  {
      "selector": ".environment48",
      "style": {
          "background-color": "rgb(249,129,103)"
      }
  },
  {
      "selector": ".environment257",
      "style": {
          "background-color": "rgb(128,0,0)"
      }
  },
  {
      "selector": ".environment258",
      "style": {
          "background-color": "rgb(0,128,0)"
      }
  },
  {
      "selector": ".environment259",
      "style": {
          "background-color": "rgb(128,128,0)"
      }
  },
  {
      "selector": ".environment260",
      "style": {
          "background-color": "rgb(0,0,128)"
      }
  },
  {
      "selector": ".environment261",
      "style": {
          "background-color": "rgb(128,0,128)"
      }
  },
  {
      "selector": ".environment262",
      "style": {
          "background-color": "rgb(0,128,128)"
      }
  },
  {
      "selector": ".environment263",
      "style": {
          "background-color": "rgb(192,192,192)"
      }
  },
  {
      "selector": ".environment264",
      "style": {
          "background-color": "rgb(70,70,70)"
      }
  },
  {
      "selector": ".environment265",
      "style": {
          "background-color": "rgb(255,0,0)"
      }
  },
  {
      "selector": ".environment266",
      "style": {
          "background-color": "rgb(0,255,0)"
      }
  },
  {
      "selector": ".environment267",
      "style": {
          "background-color": "rgb(255,255,0)"
      }
  },
  {
      "selector": ".environment268",
      "style": {
          "background-color": "rgb(0,0,255)"
      }
  },
  {
      "selector": ".environment269",
      "style": {
          "background-color": "rgb(255,0,255)"
      }
  },
  {
      "selector": ".environment270",
      "style": {
          "background-color": "rgb(0,255,255)"
      }
  },
  {
      "selector": ".environment271",
      "style": {
          "background-color": "rgb(255,255,255)"
      }
  },
  {
      "selector": ".environment272",
      "style": {
          "background-color": "rgb(128,128,128)"
      }
  },
  {
      "selector": ":selected",
      "style": {
          "shape": "star",
          "height": "20px",
          "width": "20px",
          "background-color": "#ff1493"
      }
  },
  {
      "selector": ".basherArea",
      "style": {
          "background-color": "deeppink"
      }
  },
  {
      "selector": ".currentRoom",
      "style": {
          "height": "12px",
          "width": "12px",
          "shape": "square", //nexMap?.settings?.userPreferences?.currentRoomShape,
          "border-color": "orange", //nexMap?.settings?.userPreferences?.currentRoomColor,
          "border-width": "2px"
      }
  }
]