'use strict';
var cy = {};
var nexMap = {
    version: 1.2,
    nxsVersion: 1.2,
    logging: false,
    loggingTime: '',
    mudmap: {},
    cytoscapeLoaded: false,
    mudletMapLoaded: false,
    currentRoom: GMCP?.Room?.Info?.num ? GMCP?.Room?.Info?.num : -99,
    currentArea: -99,
    currentZ: -99,
    shortDirs: {
        east: "e",
        west: "w",
        south: "s",
        north: "n",
        northeast: "ne",
        northwest: "nw",
        southeast: "se",
        southeastst: "se", // mudlet map misspells 'southeast'
        southwest: "sw",
        in: "in",
        out: "out",
        down: "d",
        up: "up",
    },
};

nexMap.stopWatch = function () {
    let t = (new Date() - nexMap.loggingTime) / 1000;

    if (nexMap.logging)
        console.log(`${t}s`);

    return t;
}

// Returns the JSON object matching the room ID.
nexMap.findRoom = function (roomNum) {
    if (nexMap.logging)
        console.log(`nexMap: nexMap.findRoom(${roomNum})`);

    let area = nexMap.mudmap.areas.find(e => e.rooms.find(e2 => e2.id == roomNum))

    if (typeof area === 'undefined') {
        console.log(`Area ${roomNum} not mapped`);
        return false;
    }

    let rm = area.rooms.find(e3 => e3.id == roomNum);
    if (nexMap.logging) {
        console.log(rm);
    }
    print(JSON.stringify(rm));
    return true;
};

// Returns a collection of Nodes matching the room NAME
nexMap.findRooms = function (search) {
    if (nexMap.logging)
        console.log(`nexMap: nexMap.findRoom(${search})`);

    let qry = cy.nodes().filter(e => {
        if (e.data('name') && e.data('name').toLowerCase().includes(search.trim().toLowerCase()))
            return true;
    });

    if (typeof qry === 'undefined') {
        console.log(`Rooms matching ${search} not found.`);
        return false;
    } else {
        return qry;
    }
};

// Returns a collection of JSON area objects.
// JSON areas have custom names that do not always match the GMCP area names.
// The GMCP area names are stored as userData in the room objects. Searches all user data for exact matches,
// then returns the area containing the matched room.
nexMap.findArea = function (search) {
    let areas = nexMap.mudmap.areas.filter(e => e.rooms.find(e2 => e2?.userData?.['Game Area']?.toLowerCase() == search.toLowerCase()))

    if (typeof areas === 'undefined') {
        console.log(`Area not found`);
        return false;
    }

    return areas;
}

// Filters for possible matching areas rather than exact matches.
nexMap.findAreas = function (search) {
    let areas = nexMap.mudmap.areas.filter(e => e.rooms.find(e2 => e2?.userData?.['Game Area']?.toLowerCase().includes(search.toLowerCase())));

    if (typeof areas === 'undefined') {
        console.log(`Area not found`);
        return false;
    }

    return areas;
}

nexMap.changeRoom =  async function (id) {
    if (nexMap.logging)
        console.log(`nexMap: nexMap.changeRoom(${id})`);

    if (cy.$id(id).hasClass('currentRoom') || !cy.$id(id).length)
        return;

    let room = cy.$id(id);

   cy.startBatch();
        cy.$('.currentRoom').removeClass('currentRoom'); //remove the class from the previous room.
        room.addClass('currentRoom');

        await nexMap.changeArea(cy.$id(id).data('area'), cy.$id(id).position().z);   
    cy.endBatch();
    cy.center(`#${id}`); 
    
    $('#currentRoomLabel').text(`${room.data('areaName')}: ${room.data('name')}`)
    $('#currentExitsLabel').text(`Exits: ${room.data('exits').join(', ')}`)

    nexMap.currentRoom = id;
};

nexMap.changeArea = async function (area, z, override = false) {
    if (nexMap.logging)
        console.log(`nexMap: nexMap.changeArea(${area} ${z})`);

    if (area == nexMap.currentArea && z == nexMap.currentZ && !override) {
        return;
    }

    nexMap.currentArea = area;
    nexMap.currentZ = z;

    cy.$('.areaDisplay').removeClass('areaDisplay');
    cy.$('.pseudo').remove();
    let x = cy.nodes().filter(e =>
        e.data('area') == nexMap.currentArea && e.data('z') == nexMap.currentZ
    );
    x.addClass('areaDisplay');
    nexMap.generateExits();

    return true;
};

nexMap.fit = function () {
    cy.fit();
}

nexMap.generateExits = function () {
    if (nexMap.logging)
        console.log('nexMap: nexMap.generateExits()');

    let exitIndex = 0;

    let createExit = function (position, cmd, tar) {
        let pos = {
            ...position
        }
        if (cmd == 's')
            pos.y += 20;
        else if (cmd == 'n')
            pos.y += -20;
        else if (cmd == 'e')
            pos.x += 20;
        else if (cmd == 'w')
            pos.x += -20;
        else if (cmd == 'se') {
            pos.x += 20;
            pos.y += 20;
        } else if (cmd == 'sw') {
            pos.x += -20;
            pos.y += 20;
        } else if (cmd == 'ne') {
            pos.x += 20;
            pos.y += -20;
        } else if (cmd == 'nw') {
            pos.x += -20;
            pos.y += -20;
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
        e.data('area') == nexMap.currentArea && e.data('z') == nexMap.currentZ
    );

    x.filter(e => ['up', 'd', 'in', 'out'].includes(e.data('command')))
        .forEach(e => createExit(e.source().position(), e.data('command')));

    let xe = x.filter(e => ['s', 'n', 'e', 'w', 'ne', 'nw', 'se', 'sw'].includes(e.data('command')));
    xe = xe.filter(e => e.target().data('area') != nexMap.currentArea || e.target().data('z') != nexMap.currentZ);

    xe.forEach(e => createExit(e.source().position(), e.data('command'), e.data('source')));
};

nexMap.generateGraph = async function () {
    if (nexMap.logging)
        console.log('nexMap: nexMap.generateGraph()');

    return new Promise((resolve, reject) => {
        let nexGraph = [];
        nexMap.mudmap.areas.forEach(area => {
            if (area.roomCount) {
                area.rooms.forEach(room => {
                    let xts = [];
                    let xt;
                    let newEdge;
                    room.exits.forEach(exit => {
                        xts.push(nexMap.shortDirs[exit.name] ? nexMap.shortDirs[exit.name] : exit.name);
                        xt = nexMap.shortDirs[exit.name] ? nexMap.shortDirs[exit.name] : exit.name;
                        if (cy.$(`#${room.id}-${exit.exitId}`).length == 0) {
                            newEdge = {
                                group: 'edges',
                                data: {
                                    id: `${room.id}-${exit.exitId}`,
                                    source: room.id,
                                    target: exit.exitId,
                                    weight: 1,
                                    area: area.id,
                                    command: xt,
                                    door: exit.door ? exit.door : false,
                                    z: room.coordinates[2]
                                },
                                classes: []
                            }

                            if (newEdge.data.door)
                                newEdge.classes.push('doorexit');

                            if (xt == 'in')
                                newEdge.classes.push('inexit');
                            else if (xt == 'out')
                                newEdge.classes.push('outexit');
                            else if (xt == 'up')
                                newEdge.classes.push('upexit');
                            else if (xt == 'd')
                                newEdge.classes.push('downexit');
                            else if (xt == 'worm warp') {
                                newEdge.classes.push('wormhole');
                                newEdge.data.weight = 12;
                            } else if (xt == 'enter grate')
                                newEdge.classes.push('sewergrate');

                            nexGraph.push(newEdge);
                        }
                    });

                    let newNode = {
                        group: 'nodes',
                        data: {
                            id: room.id,
                            area: area.id,
                            areaName: area.name,
                            environment: room.environment,
                            name: room.name,
                            userData: room.userData,
                            z: room.coordinates[2],
                            exits: xts,
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

                    if (room?.symbol?.text && ['S', 'F', 'G', 'C', 'N', 'M', '$', 'L', 'H', 'W', 'A', 'P', 'B'].includes(room.symbol.text))
                        newNode.data.image = nexMap.styles.generateSVG(room.symbol.text);

                    if (xts.includes('worm warp'))
                        newNode.classes.push('wormholeRoom');

                    nexGraph.push(newNode);
                });
            }
        });

        cy.batch( () => {
            cy.add(nexGraph);
            nexMap.wormholes = cy.$('.wormhole');
            nexMap.settings.toggleWormholes();
        });

        /* 
        //Mudlet map has hundreds of rooms with no name.
        
        nexMap.mudmap.areas.forEach(e=>{
            let col = e.rooms.filter(e2=>!e2.name);
            if (col.length) {
                console.log(`${e.id}:${e.name}`);
                console.log(col);
            }
        });
        */
        console.log('nexMap: Graph model created.');
        resolve();
    });
}

nexMap.loadDependencies = async function () {
    if (nexMap.logging)
        console.log('nexMap: nexMap.loadDependencies()');

    let preloader = async function () {
        return new Promise((resolve, reject) => {
            let src = "https://cdn.jsdelivr.net/npm/cytoscape@3.19.0/dist/cytoscape.min.js";
            let head = document.getElementsByTagName('head')[0];
            let elem = document.createElement('script');
            elem.src = src + '?' + Math.random();
            elem.onload = () => {
                console.log('Loaded ' + src + '.');
                nexMap.cytoscapeLoaded = true;
                resolve();
            }
            elem.onerror = () => {
                console.log('Unable to load ' + src + '.');
                reject();
            }

            head.appendChild(elem)
        });
    }

    let clone = function (obj) {
        let copy;
        if (null == obj || 'object' != typeof obj) {
            return obj
        }
        if (obj instanceof String) {
            return (' ' + obj).slice(1)
        } // https://stackoverflow.com/a/31733628
        if (obj instanceof Date) {
            copy = new Date()
            copy.setTime(obj.getTime())
            return copy
        }
        if (obj instanceof Array) {
            copy = []
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i])
            }
            return copy
        }
        if (obj instanceof Object) {
            copy = {}
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    copy[attr] = clone(obj[attr])
                }
            }
            return copy
        }
        throw new Error('Unable to copy object! Type not supported.')
    }

    let restoreMap = function () {
        $('body')
            .on('restoreMap', function (e, _map) {
                console.log(_map)
                window.Map = _map
                $('body').off('restoreMap')
            })

        let f = document.createElement('iframe')
        f.width = 0
        f.height = 0
        f.src = 'about:blank'
        f.onload = function () {
            $('body').trigger('restoreMap', [clone(f.contentWindow.Map)])
            document.body.removeChild(f)
        }
        document.body.appendChild(f)
    }

    let loadMap = async function () {
        return new Promise((resolve, reject) => {
            $.ajax({
                async: true,
                global: false,
                url: 'https://cdn.jsdelivr.net/gh/Log-Wall/nexMap/mudletmap-min.json',
                //url: "https://raw.githubusercontent.com/IRE-Mudlet-Mapping/AchaeaCrowdmap/gh-pages/Map/map.json",
                dataType: "json",
                success: function (data) {
                    nexMap.mudmap = data;
                    nexMap.mudletMapLoaded = true;
                },
                complete: () => {
                    if (nexMap.mudletMapLoaded)
                        resolve();
                    console.log('nexMap: mudlet JSON map loaded.');
                },
                error: () => {
                    reject()
                }
            });
        });
    }

    restoreMap();
    await Promise.all([preloader(), loadMap()]);
    return true;
};

nexMap.initializeGraph = function () {
    if (nexMap.logging)
        console.log('nexMap: nexMap.initializeGraph()');

    if ($('#cy').length)
        $('#cy').remove();

    $('<div></div>', {
        id: 'currentRoomLabel'
    }).appendTo('#tbl_nexmap_map');
    $('<div></div>', {
        id: 'cy'
    }).appendTo('#tbl_nexmap_map');
    $('<div></div>', {
        style: 'position:absolute;bottom:0px',
        id: 'currentExitsLabel'
    }).appendTo('#tbl_nexmap_map');

    cy = cytoscape({
        container: document.getElementById('cy'),
        layout: 'grid',
        style: nexMap.styles.stylesheet,
        zoom: 1,
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
};

nexMap.startUp = function () {
    if (nexMap.logging) 
        console.log('nexMap: nexMap.startUp()');

    nexMap.loggingTime = new Date();

    nexMap.stopWatch();
    run_function('nexMap.settings', {}, 'nexmap');
    nexMap.stopWatch();        
    run_function('nexMap.display', {}, 'nexmap');
    nexMap.stopWatch();
    nexMap.display.notice('Loading mapper modules. May take up to 10 seconds.');
    nexMap.loadDependencies().then(() => {
        nexMap.stopWatch();
        nexMap.initializeGraph();
        nexMap.stopWatch();
        nexMap.generateGraph().then(() => {
            nexMap.stopWatch();
            
            nexMap.styles.style();
            nexMap.stopWatch();
            
            nexMap.display.notice(`Use "nm" for summary of user commands`);

            cy.once('render', () => {
                nexMap.display.notice(`nexMap loaded and ready for use. ${nexMap.stopWatch()}s`);
                send_direct('ql');
                nexMap.styles.refresh();
                if (nexMap.settings.userPreferences.initialConfiguration != nexMap.version)
                    send_direct('nm config');
            });
        });
    });
};

nexMap.settings = {};

nexMap.settings.userPreferences = get_variable('nexMapConfigs') || {
    intialConfiguration: 0,
    commandSeparator: '\\',
    useDuanathar: false,
    useDuanatharan: false,
    duanatharCommand: 'say duanathar',
    duanatharanCommand: 'say duanatharan',
    useWormholes: false,
    vibratingStick: false,
    displayWormholes: false,
    currentRoomShape: 'rectangle',
    currentRoomColor: '#ff1493',
    labelDisplay: 'name',
    landmarks: [],
    antiWingAreas: [],
    antiGareAreas: []
}

nexMap.settings.save = function () {
    nexMap.settings.userPreferences.initialConfiguration = nexMap.version;
    set_variable('nexMapConfigs', nexMap.settings.userPreferences);
}

nexMap.settings.toggleWormholes = function () {
    if (nexMap.settings.userPreferences.useWormholes) {
            nexMap.wormholes.restore();
    } else {
            nexMap.wormholes.remove(); 
    }
}

nexMap.settings.toggle = function (seting) {
    if (nexMap.settings.userPreferences[seting])
        nexMap.settings.userPreferences[seting] = false;
    else
        nexMap.settings.userPreferences[seting] = true;

    if (seting == 'useWormholes')
        nexMap.settings.toggleWormholes();

    nexMap.settings.save();
}

nexMap.settings.addMark = function (str) {
    if (nexMap.settings.userPreferences.landmarks.find(e => e.name.toLowerCase() == str.toLowerCase())) {
        nexMap.display.notice(`Landmark already exits for "${str}". Please remove existing landmark first.`);
        nexMap.display.generateTable('landmarkTable', [nexMap.settings.userPreferences.landmarks.find(e => e.name.toLowerCase() == str.toLowerCase())], str);
        return;
    }

    let newMark = {}
    newMark.name = str;
    newMark.roomID = cy.$('.currentRoom').data('id');

    nexMap.settings.userPreferences.landmarks.push(newMark);
    nexMap.display.notice(`Added landmark "${str}"`);
    nexMap.settings.save();
}

nexMap.settings.removeMark = function (name) {
    let i = nexMap.settings.userPreferences.landmarks.findIndex(e => e.name.toLowerCase() == name.toLowerCase());

    nexMap.settings.userPreferences.landmarks.splice(i, 1);
    nexMap.display.notice(`Removed landmark for "${name}"`);
}

nexMap.styles = {};

nexMap.styles.style = function () {
    if (nexMap.logging) {
        console.log('nexMap: nexMap.style()')
    };
    $('#cy').css({
        id: 'cy',
        'background-image': ' url(/includes/images/windows/map-background.jpg)',
        width: '100%',
        height: 'calc(100% - 44px)',
        position: 'absolute',
        overflow: 'hidden',
        top: '0px',
        left: '0px',
        'margin-top': '22px',
        'margin-bottom': '22px'
    });

    cy.on('mouseout', 'node', evt => {
        evt.target.removeClass('displayLabel');
    }); // Pop up labels on mouseover
    cy.on('mouseover', 'node', evt => {
        evt.target.flashClass('displayLabel', 3000)
    }); // Pop up labels on mouseover
    cy.on('zoom', e => {
        cy.style().selector('.displayLabel').style({
            'font-size': `${12 * 1 / cy.zoom()}pt`
        })
    }) //Increases the size of the label based on the zoom level.
    cy.on('unselect', 'node', evt => {
        nexMap.walker.stop()
    });
    cy.on('select', 'node', evt => {
        nexMap.walker.speedWalk()
    });

    let generateStyle = function () {
        let inject = function (rule) {
            $('body').append('<div class="client_nexmap-rules">&shy;<style>' + rule + '</style></div>')
        };
        if ($('.client_nexmap-rules').length) {
            $('.client_nexmap-rules').remove();
        };
        let nexMapCSS = '.nexswitch {position: relative;display: inline-block;width: 38px;height: 22px;}' +
            '.nexswitch input {opacity: 0;width: 0;height: 0;}' +
            '.nexslider {position: absolute;cursor: pointer;top: 0;left: 0;right: 0;bottom: 0;background-color: #555555;-webkit-transition: .4s;transition: .4s;border-radius: 24px;}' +
            '.nexslider:before {position: absolute;content: "";height: 16px;width: 16px;left: 3px;bottom: 3px;background-color: white;-webkit-transition: .4s;transition: .4s;border-radius: 50%;}' +
            'input:checked + .nexslider {background-color: #2196F3;}' +
            'input:focus + .nexslider {box-shadow: 0 0 1px #2196F3;}' +
            'input:checked + .nexslider:before {-webkit-transform: translateX(16px);-ms-transform: translateX(16px);transform: translateX(16px);}' +
            '.nexcontainer   { display: flex; }' +
            '.nexfixed    { width: 200px; }' +
            '.nexflex-item    { flex-grow: 1; }';
        if (client.css_style != 'standard')
            nexMapCSS += '#tab_nexmap_map::before {content: "\\f2ae";}';

        inject(nexMapCSS);
    };
    generateStyle();
}

nexMap.styles.generateSVG = function (txt) {
    let svg_pin = $('<svg width="11" height="11" viewBox="0 0 11 11" version="1.1"  xmlns="http://www.w3.org/2000/svg"></svg>')
    let svg_text = $('<text></text>', {
        x: "2",
        y: "8",
        fill: "black",
        'font-family': "Arial, monospace",
        style: "font-size:8px;text-align:center;font-weight:bold"
    }).text(txt);

    svg_text.appendTo(svg_pin)

    let svgpin_Url = encodeURI("data:image/svg+xml;utf-8," + svg_pin[0].outerHTML);

    return svgpin_Url;
}

nexMap.styles.stylesheet = [{
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
            'background-fit': 'contain',
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
            'label': 'data(id)',
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
        "selector": ".currentRoom",
        "style": {
            "height": "12px",
            "width": "12px",
            "shape": nexMap.settings.userPreferences.currentRoomShape,
            "border-color": nexMap.settings.userPreferences.currentRoomColor,
            "border-width": "2px"
        }
    }
];

nexMap.styles.refresh = function () {
    if (typeof cy.unmount !== 'function') {
        nexMap.display.notice(`nexMap not loaded. Please run "nm load".`);
        return;
    }
    setTimeout(function(){
        nexMap.changeRoom(GMCP.Room.Info.num);
        nexMap.changeArea(nexMap.currentArea, nexMap.currentZ, true)
    }, 500);  
}

nexMap.walker = {
    pathing: false,
    pathRooms: [],
    pathCommands: [],
    pathRawCommands: [],
    pathRawRooms: [],
    delay: false,
    destination: 0,
    stepCommand: '',
    clientEcho: client.echo_input,
}

nexMap.walker.speedWalk = function (s, t) {
    if (nexMap.logging) {
        console.log('nexMap: nexMap.walker.speedwalk()')
    };

    nexMap.walker.pathingStartTime = new Date();
    nexMap.walker.clientEcho = client.echo_input;
    client.echo_input = false;
    nexMap.walker.determinePath(s, t);
    nexMap.walker.step();
}

//nexMap.walker.speedWalk(nexMap.currentRoom, cy.$(`[area = ${id}]`))
// The aStar pathing to a collection of Nodes in an area does not seem to always path to the closest Node in the collection.
// this is a work around.
nexMap.walker.areaWalk = function (areaID) {
    let target = cy.elements().aStar({
        root: `#${nexMap.currentRoom}`,
        goal: cy.$(`[area = ${areaID}]`),
        weight: function (edge) {
            return edge.data('weight');
        },
        directed: true
    }).path.nodes().find(n => n.data('area') == areaID).data('id')

    nexMap.walker.speedWalk(nexMap.currentRoom, target)
}

nexMap.walker.goto = function (str) {
    if (typeof str !== 'string') {
        return;
    }

    let findMark = nexMap.settings.userPreferences.landmarks.find(e => e.name.toLowerCase() == str.toLowerCase());
    if (findMark) {
        nexMap.walker.speedWalk(nexMap.currentRoom, findMark.roomID);
        return;
    }

    let areas = nexMap.findArea(str);

    if (areas.length == 0) {
        let findAreas = nexMap.findAreas(str);
        console.log(findAreas);
        let findMarks = nexMap.settings.userPreferences.landmarks.filter(e => e.name.toLowerCase().includes(str.toLowerCase()));
        if (findAreas.length) {
            nexMap.display.generateTable('areaTable', findAreas, str);
        }
        if (findMarks.length) {
            nexMap.display.generateTable('landmarkTable', findMarks, str);
        }
        return;
    }

    if (areas.length == 1)
    {
        nexMap.walker.areaWalk(areas[0].id);
        return;
    }

    let findAreaNode = function (areaID) {
        let aStar = cy.elements().aStar({
            root: `#${nexMap.currentRoom}`,
            goal: cy.$(`[area = ${areaID}]`),
            weight: function (edge) {
                return edge.data('weight');
            },
            directed: true
        })
        return {
            'distance': aStar?.path?.nodes()?.findIndex(e=>e.data('area')==areaID),
            'id': areaID
        }
    }

    let closestArea = {'id': 0,'distance':999999};
    areas.forEach(a => {
        let ar = findAreaNode(a.id);
        if (ar.distance < closestArea.distance) {
            closestArea = ar;
        }
    });

    nexMap.walker.areaWalk(closestArea.id);
}

nexMap.walker.step = function () {
    let nmw = nexMap.walker;

    if (nexMap.logging) 
        console.log('nexMap: nexMap.walker.step()');

    if (nmw.pathCommands.length == 0) {
        if (nexMap.logging) {
            console.log('nexMap: nexMap.walker.step RETURN')
        };
        return;
    }

    let index = nmw.pathRooms.indexOf(GMCP.Room.Info.num.toString());

    if (GMCP.Room.Info.num == nmw.destination) {
        nmw.pathing = false;
        nmw.reset();
        nexMap.display.notice(`Pathing complete. ${(new Date() - nmw.pathingStartTime) / 1000}s`);
        return;
    }

    if (index >= 0) {
        nmw.pathing = true;
        nmw.stepCommand = nmw.pathCommands[index];
    }

    send_direct(`${nmw.stepCommand}`);
}

nexMap.walker.determinePath = function (s, t) {
    if (nexMap.logging) {
        console.log(`nexMap: nexMap.walker.determinePath(${s}, ${t})`)
    };
    let source = s ? s : cy.$('.currentRoom').data('id');
    let target = t ? t : cy.$(':selected').data('id');
    let nmw = nexMap.walker;
    nmw.destination = target;

    nmw.pathRooms = [];
    nmw.pathCommands = [];

    let g = typeof target === 'object' ? t : `#${target}`

    let astar = cy.elements().aStar({
        root: `#${source}`,
        goal: g,
        weight: function (edge) {
            return edge.data('weight');
        },
        directed: true
    });

    if (nexMap.logging)
        console.log(astar);

    if (!astar.found) {
        nexMap.display.notice(`No path to ${target} found.`);
        return;
    }

    astar.path.nodes().forEach(e => nmw.pathRooms.push(e.data('id')));
    astar.path.edges().forEach(e => nmw.pathCommands.push(e.data('command')));

    let gare = nmw.checkGare(astar, target);
    let cloud = nmw.checkClouds(astar, target);
    let air = nmw.checkAirlord(astar, target);
    let base = {
        rooms: nmw.pathRooms,
        commands: nmw.pathCommands
    }

    let optimalPath = [gare, cloud, air, base].reduce((a, b) => {
        if (typeof a == 'undefined') {return b};
        if (typeof b == 'undefined') {return a};
        return a?.commands?.length < b?.commands?.length ? a : b;
    });

    nmw.pathRawCommands = [...nmw.pathCommands];
    nmw.pathRawRooms = [...nmw.pathRooms];

    nexMap.walker.pathCommands = optimalPath.commands;
    nexMap.walker.pathRooms = optimalPath.rooms;

    nmw.hybridPath();

    return {
        path: nexMap.walker.pathCommands,
        rawPath: nexMap.walker.pathRawCommands
    }
}

nexMap.walker.checkAirlord = function (astar, target) {
    if (!GMCP.Status.class.toLowerCase().includes('dragon')) {
        return;
    }

    let firstOutdoorRoom = astar.path.nodes().find(e => e.data().userData.indoors != 'y' && !nexMap.settings.userPreferences.antiWingAreas.includes(e.data('area')));
    let wingRoomId = firstOutdoorRoom ? firstOutdoorRoom.data('id') : 0;

    if (wingRoomId == 0) {
        return;
    }

    let nmw = nexMap.walker;
    let cloudRooms = [...nmw.pathRooms];
    let cloudCommands = [...nmw.pathCommands];
    let cloudPath = {distance: 1000};
    let highCloudPath = {distance: 1000};
    let stratospherePath = {distance: 1000};
    let g = typeof target === 'object' ? target : `#${target}`

    if (!nexMap.settings.userPreferences.useDuanathar) {
        cloudPath = cy.elements().aStar({
            root: `#3885`,
            goal: g,
            weight: function (edge) {
                return edge.data('weight');
            },
            directed: true
        });
        cloudPath.command = 'aero soar low';
    }

    if (!nexMap.settings.userPreferences.useDuanatharan) {
        highCloudPath = cy.elements().aStar({
            root: `#4882`,
            goal: g,
            weight: function (edge) {
                return edge.data('weight');
            },
            directed: true
        });
        highCloudPath.command = 'aero soar high';
    }

    stratospherePath = cy.elements().aStar({
        root: `#54173`,
        goal: g,
        weight: function (edge) {
            return edge.data('weight');
        },
        directed: true
    });
    stratospherePath.command = 'aero soar stratosphere';

    let optimalCloud = [cloudPath, highCloudPath, stratospherePath].reduce((a, b) => {
        return a?.distance < b?.distance ? a : b;
    });

    // Added +12 to the comparison based on 5 seconds of balance at an assumed rate of 3 rooms per second.
    if (astar.distance > cloudCommands.indexOf(wingRoomId) + optimalCloud.distance + 15) {
        cloudRooms.splice(cloudRooms.indexOf(wingRoomId) + 1);
        cloudCommands.splice(cloudRooms.indexOf(wingRoomId));
        cloudCommands.push(optimalCloud.command);

        optimalCloud.path.nodes().forEach(e => cloudRooms.push(e.data('id')));
        optimalCloud.path.edges().forEach(e => cloudCommands.push(e.data('command')));
    }

    return {
        rooms: cloudRooms,
        commands: cloudCommands
    }
}

nexMap.walker.checkGare = function (astar, target) {
    if (!GMCP.Status.class.includes('Dragon')) {
        return;
    }

    let firstGareRoom = astar.path.nodes().find(e => !nexMap.settings.userPreferences.antiGareAreas.includes(e.data('area')));
    let gareRoomId = firstGareRoom ? firstGareRoom.data('id') : 0;

    if (gareRoomId == 0) {
        return;
    }
    let nmw = nexMap.walker;
    let gareRooms = [...nmw.pathRooms];
    let gareCommands = [...nmw.pathCommands];

    let g = typeof target === 'object' ? target : `#${target}`

    let garePath = cy.elements().aStar({
        root: `#12695`,
        goal: g,
        weight: function (edge) {
            return edge.data('weight');
        },
        directed: true
    });

    // Pierce the veil assumed at 3 seconds equilibrium at 3 rooms per second.
    if (astar.distance > gareCommands.indexOf(gareRoomId) + garePath.distance + 10) {
        gareRooms.splice(gareRooms.indexOf(gareRoomId) + 1);
        gareCommands.splice(gareRooms.indexOf(gareRoomId));
        gareCommands.push('pierce the veil');

        garePath.path.nodes().forEach(e => gareRooms.push(e.data('id')));
        garePath.path.edges().forEach(e => gareCommands.push(e.data('command')));
    }
    
    return {
        rooms: gareRooms,
        commands: gareCommands
    }
}

nexMap.walker.checkClouds = function (astar, target) {
    if (nexMap.logging)
        console.log(`nexMap: nexMap.walker.checkClouds()`);

    if (!nexMap.settings.userPreferences.useDuanathar && !nexMap.settings.userPreferences.useDuanatharan)
        return;

    let firstOutdoorRoom = astar.path.nodes().find(e => e.data().userData.indoors != 'y' && !nexMap.settings.userPreferences.antiWingAreas.includes(e.data('area')));
    let wingRoomId = firstOutdoorRoom ? firstOutdoorRoom.data('id') : 0;

    if (wingRoomId == 0) {
        return;
    }

    let nmw = nexMap.walker;
    let highCloudPath;
    let cloudRooms = [...nmw.pathRooms];
    let cloudCommands = [...nmw.pathCommands];

    let g = typeof target === 'object' ? target : `#${target}`

    let cloudPath = cy.elements().aStar({
        root: `#3885`,
        goal: g,
        weight: function (edge) {
            return edge.data('weight');
        },
        directed: true
    });

    if (nexMap.settings.userPreferences.useDuanatharan) {
        highCloudPath = cy.elements().aStar({
            root: `#4882`,
            goal: g,
            weight: function (edge) {
                return edge.data('weight');
            },
            directed: true
        });
    }

    let cloudType = function (cloud, cmd) {
        if (astar.distance > cloudRooms.indexOf(wingRoomId) + cloud.distance) {
            cloudRooms.splice(cloudRooms.indexOf(wingRoomId) + 1);
            cloudCommands.splice(cloudRooms.indexOf(wingRoomId));
            cloudCommands.push(cmd);

            cloud.path.nodes().forEach(e => cloudRooms.push(e.data('id')));
            cloud.path.edges().forEach(e => cloudCommands.push(e.data('command')));
        }
    }

    if (highCloudPath && cloudPath.distance > highCloudPath.distance)
        cloudType(highCloudPath, nexMap.settings.userPreferences.duanatharanCommand);
    else
        cloudType(cloudPath, nexMap.settings.userPreferences.duanatharCommand);

    return {
        rooms: cloudRooms,
        commands: cloudCommands
    }
}

nexMap.walker.hybridPath = function () {
    if (nexMap.logging)
        console.log(`nexMap: nexMap.walker.hybridPath()`);

    let nmwpc = nexMap.walker.pathCommands;
    let nmwpr = nexMap.walker.pathRooms;

    if (nexMap.logging) {
        console.log(nmwpc);
        console.log(nmwpr);
    }

    let hybCmds = [];
    let hybRm = [nmwpr[0]];
    let pathTrackDistance = 0;
    nmwpc.forEach((e, i) => {
        if (i == 0 && !Object.values(nexMap.shortDirs).includes(e)) {
            hybRm.push(nmwpr[i + 1]);
            hybCmds.push(`path stop${nexMap.settings.userPreferences.commandSeparator}${e}`);
        } else if (!Object.values(nexMap.shortDirs).includes(e)) {
            hybRm.push(nmwpr[i]);
            hybRm.push(nmwpr[i + 1]);
            hybCmds.push(`path track ${nmwpr[i]}`);
            hybCmds.push(`path stop${nexMap.settings.userPreferences.commandSeparator}${e}`);
            pathTrackDistance = i;
        }
        else if (i - pathTrackDistance > 99) {
            pathTrackDistance = i;
            hybCmds.push(`path stop${nexMap.settings.userPreferences.commandSeparator}path track ${nmwpr[i]}`);
            hybRm.push(nmwpr[i]);
        }
    })
    if (Object.values(nexMap.shortDirs).includes(nmwpc[nmwpc.length - 1])) {
        hybRm.push(nmwpr[nmwpr.length - 1]);
        hybCmds.push(`path track ${nmwpr[nmwpr.length - 1]}`);
    }

    if (nexMap.logging) {
        console.log(hybCmds);
        console.log(hybRm);
    }

    nexMap.walker.pathCommands = [...hybCmds];
    nexMap.walker.pathRooms = [...hybRm];
}

nexMap.walker.checkGlide = function(path, target) {
    if (nexMap.logging) {console.log(`nexMap: nexMap.walker.checkDash(${cmd})`)};

    let firstOutdoorRoom = path.rooms.find(e => cy.$id(e).data('userData').indoors != 'y' && !nexMap.settings.userPreferences.antiWingAreas.includes(cy.$id(e).data('area')));
    let firstIndoorRoom = path.rooms.slice(path.rooms.indexOf(firstOutdoorRoom)).find(e => cy.$id(e).data().userData.indoors == 'y');
    let galCmds = [];
    let galRm = [path.rooms[0]];
    let galIndex = -1;
    let len;
    console.log(firstOutdoorRoom);
    console.log(firstIndoorRoom);

    let glidePath = cy.elements().aStar({
        root: `#${firstOutdoorRoom}`,
        goal: `#${firstIndoorRoom}`,
        weight: function (edge) {
            return edge.data('weight');
        },
        directed: true
    });
    glidePath.commands = [];
    glidePath.rooms = [];

    console.log(glidePath);

    glidePath.path.nodes().forEach(e => glidePath.rooms.push(e.data('id')));
    glidePath.path.edges().forEach(e => glidePath.commands.push(e.data('command')));

    glidePath.commands.forEach((e,i)=>{
        if (e != glidePath.commands[i+1]) {
            len = i-galIndex;
            
            if(len==2) {
            	galCmds.push(e);
            	galRm.push(glidePath.rooms[i]);    
            }
            
            galCmds.push(len > 2 ? `glide ${e} ${i-galIndex}` : e);
            galRm.push(len > 2 ? glidePath.rooms[galIndex+len+1] : glidePath.rooms[i+1]);

            galIndex=i;
        }
    })
    
    console.log(galCmds);
    console.log(galRm);
    //nexMap.walker.pathCommands = [...galCmds];
    //nexMap.walker.pathRooms = [...galRm];

}

nexMap.walker.reset = function () {
    if (nexMap.logging)
        console.log('nexMap: nexMap.walker.reset()');

    nexMap.walker.pathing = false;
    cy.$(':selected').unselect();
    nexMap.walker.pathCommands = [];
    nexMap.walker.pathRooms = [];
    nexMap.walker.destination = 0;
    client.echo_input = nexMap.walker.clientEcho;
}

nexMap.walker.stop = function () {
    if (nexMap.logging)
        console.log('nexMap: nexMap.walker.stop()');

    if (nexMap.walker.pathing === true) {
        nexMap.display.notice('Pathing canceled');
        send_direct('path stop');
    }

    nexMap.walker.reset();
}

nexMap.display = {
    pageBreak: 20,
    pageIndex: 0,
    displayCap: {},
    click: {},
    displayEntries: {},
}

nexMap.display.notice = function (txt, html = false) {
    let msg = $('<span></span>', {
        class: "mono"
    });
    $('<span></span>', {
        style: 'color:DodgerBlue'
    }).text('[-').appendTo(msg);
    $('<span></span>', {
        style: 'color:OrangeRed'
    }).text('nexMap').appendTo(msg);
    $('<span></span>', {
        style: 'color:DodgerBlue'
    }).text('-] ').appendTo(msg);

    if (html) {
        txt.appendTo(msg)
    } else {
        $('<span></span>', {
            style: 'color:GoldenRod'
        }).text(txt).appendTo(msg)
    }


    print(msg[0].outerHTML);
}

nexMap.display.generateTable = function (table, entries = false, caption = false) {
    nexMap.display.pageIndex = 0;
    if (table == 'displayTable') {
        console.log('works');
        nexMap.display.displayEntries = entries;
        nexMap.display.displayCap = caption;
        nexMap.display.displayTable();
    } else {
        console.log(table);
        console.log(entries);
        nexMap.display[`${table}`](entries, caption)
    } 
}

nexMap.display.click.room = function (id) {
    if (typeof parseInt(id) !== 'number') {
        console.log(id);
        return;
    }

    cy.$(':selected').unselect();
    cy.$(`#${id}`).select();
}

nexMap.display.click.area = function (id) {
    if (typeof id !== 'number') {
        console.log(id);
        return;
    }

    nexMap.walker.areaWalk(id);
}

nexMap.display.displayTable = function () {
    let entries = nexMap.display.displayEntries;

    let tab = $("<table></table>", {
        class: "mono",
        style: "max-width:100%;border:1px solid GoldenRod;border-spacing:0px"
    });
    if (nexMap.display.pageIndex == 0) {
        let cap = $("<caption></caption>", {
            style: "text-align:left"
        }).appendTo(tab);
        $('<span></span>', {
            style: 'color:DodgerBlue'
        }).text('[-').appendTo(cap);
        $('<span></span>', {
            style: 'color:OrangeRed'
        }).text('nexMap').appendTo(cap);
        $('<span></span>', {
            style: 'color:DodgerBlue'
        }).text('-] ').appendTo(cap);
        $('<span></span>', {
            style: 'color:GoldenRod'
        }).text('Displaying matches for ').appendTo(cap)
        $('<span></span>', {
            style: 'font-weight:bold;color:LawnGreen'
        }).text(nexMap.display.displayCap).appendTo(cap); //fix

        let header = $("<tr></tr>", {
            style: "text-align:left;color:Ivory"
        }).appendTo(tab);
        $("<th></th>", {
            style: 'width:5em'
        }).text('Num').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('Name').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('Area').appendTo(header);
    } else {
        let header = $("<tr></tr>", {
            style: "text-align:left;color:Ivory"
        }).appendTo(tab);
        $("<th></th>", {
            style: 'width:5em'
        }).text('').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('').appendTo(header);
    }

    let startIndex = nexMap.display.pageIndex > 0 ? (nexMap.display.pageIndex * nexMap.display.pageBreak) : 0;
    for (let i = startIndex; i < entries.length && i < startIndex + nexMap.display.pageBreak; i++) {
        let row = $("<tr></tr>", {
            style: 'cursor:pointer;color:dimgrey;'
        }).appendTo(tab);
        $("<td></td>", {
            style: 'color:grey',
            onclick: `nexMap.display.click.room(${JSON.stringify(entries[i].data('id'))});`
        }).text(entries[i].data('id')).appendTo(row);
        $("<td></td>", {
            style: 'color:gainsboro;text-decoration:underline',
            onclick: `nexMap.display.click.room(${JSON.stringify(entries[i].data('id'))});`
        }).text(entries[i].data('name')).appendTo(row);
        $("<td></td>", {
            onclick: `nexMap.display.click.room(${JSON.stringify(entries[i].data('id'))});`
        }).text(entries[i].data('areaName')).appendTo(row);
    }

    print(tab[0].outerHTML);

    let pagination;
    if (Math.ceil(nexMap.display.displayEntries.length / nexMap.display.pageBreak) > nexMap.display.pageIndex + 1) {
        pagination = $("<span></span>", {
            style: 'color:Goldenrod'
        }).text(`Displaying ${startIndex + nexMap.display.pageBreak} of ${nexMap.display.displayEntries.length}.`);
        nexMap.display.pageIndex++;
        $("<span></span>", {
            style: 'color:Goldenrod'
        }).text(' Click for ').appendTo(pagination);
        $('<a></a>', {
            style: 'cursor:pointer;color:Ivory;text-decoration:underline;',
            onclick: 'nexMap.display.displayTable()'
        }).text('MORE').appendTo(pagination);
    } else {
        pagination = $("<span></span>", {
            style: 'color:Goldenrod'
        }).text(`Displaying ${nexMap.display.displayEntries.length} of ${nexMap.display.displayEntries.length}.`);
    }

    print(pagination[0].outerHTML);
}

nexMap.display.landmarkTable = function (marks = false, caption = false) {
    let entries = marks ? marks : nexMap.settings.userPreferences.landmarks;

    let tab = $("<table></table>", {
        class: "mono",
        style: "max-width:100%;border:1px solid GoldenRod;border-spacing:0px"
    });
    if (nexMap.display.pageIndex == 0) {
        let cap = $("<caption></caption>", {
            style: "text-align:left"
        }).appendTo(tab);
        $('<span></span>', {
            style: 'color:DodgerBlue'
        }).text('[-').appendTo(cap);
        $('<span></span>', {
            style: 'color:OrangeRed'
        }).text('nexMap').appendTo(cap);
        $('<span></span>', {
            style: 'color:DodgerBlue'
        }).text('-] ').appendTo(cap);
        $('<span></span>', {
            style: 'color:GoldenRod'
        }).text('Displaying landmarks matching ').appendTo(cap)
        $('<span></span>', {
            style: 'font-weight:bold;color:LawnGreen'
        }).text(caption ? caption : 'All').appendTo(cap); //fix

        let header = $("<tr></tr>", {
            style: "text-align:left;color:Ivory"
        }).appendTo(tab);
        $("<th></th>", {
            style: 'width:5em'
        }).text('').appendTo(header);
        $("<th></th>", {
            style: 'width:5em'
        }).text('Num').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('Name').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('Room').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('Area').appendTo(header);
    } else {
        let header = $("<tr></tr>", {
            style: "text-align:left;color:Ivory"
        }).appendTo(tab);
        $("<th></th>", {
            style: 'width:5em'
        }).text('').appendTo(header);
        $("<th></th>", {
            style: 'width:5em'
        }).text('').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('').appendTo(header);
    }

    let startIndex = nexMap.display.pageIndex > 0 ? (nexMap.display.pageIndex * nexMap.display.pageBreak) : 0;
    for (let i = startIndex; i < entries.length && i < startIndex + nexMap.display.pageBreak; i++) {
        let node = cy.$id(entries[i].roomID);
        let row = $("<tr></tr>", {
            style: 'cursor:pointer;color:dimgrey;'
        }).appendTo(tab);
        $("<td></td>", {
            style:"color:#6b5b95;text-decoration:underline", 
            onclick: `nexMap.settings.removeMark(${JSON.stringify(entries[i].name)});`
        }).text('[X]').appendTo(row);
        $("<td></td>", {
            style: 'color:#878f99',
            onclick: `nexMap.display.click.room(${JSON.stringify(entries[i].roomID)});`
        }).text(i).appendTo(row);
        $("<td></td>", {
            style: 'color:#a2b9bc;text-decoration:underline',
            onclick: `nexMap.display.click.room(${JSON.stringify(entries[i].roomID)});`
        }).text(`"${entries[i].name}"`).appendTo(row);
        $("<td></td>", {
            style: 'color:#b2ad7f',
            onclick: `nexMap.display.click.room(${JSON.stringify(entries[i].roomID)});`
        }).text(`${node.data('name')}(${node.data('id')})`).appendTo(row); // Room name(id)
        $("<td></td>", {
            style: 'color:#b2ad7f',
            onclick: `nexMap.display.click.room(${JSON.stringify(entries[i].roomID)});`
        }).text(`${node.data('userData')['Game Area']}(${node.data('area')})`).appendTo(row);
    }

    print(tab[0].outerHTML);

    let pagination;
    if (Math.ceil(entries.length / nexMap.display.pageBreak) > nexMap.display.pageIndex + 1) {
        pagination = $("<span></span>", {
            style: 'color:Goldenrod'
        }).text(`Displaying ${startIndex + nexMap.display.pageBreak} of ${entries.length}.`);
        nexMap.display.pageIndex++;
        $("<span></span>", {
            style: 'color:Goldenrod'
        }).text(' Click for ').appendTo(pagination);
        $('<a></a>', {
            style: 'cursor:pointer;color:Ivory;text-decoration:underline;',
            onclick: 'nexMap.display.landmarkTable()'
        }).text('MORE').appendTo(pagination);
    } else {
        pagination = $("<span></span>", {
            style: 'color:Goldenrod'
        }).text(`Displaying ${entries.length} of ${entries.length}.`);
    }

    print(pagination[0].outerHTML);
}

nexMap.display.areaTable = function (entries, caption) {
    let tab = $("<table></table>", {
        class: "mono",
        style: "max-width:100%;border:1px solid GoldenRod;border-spacing:0px"
    });
    if (nexMap.display.pageIndex == 0) {
        let cap = $("<caption></caption>", {
            style: "text-align:left"
        }).appendTo(tab);
        $('<span></span>', {
            style: 'color:DodgerBlue'
        }).text('[-').appendTo(cap);
        $('<span></span>', {
            style: 'color:OrangeRed'
        }).text('nexMap').appendTo(cap);
        $('<span></span>', {
            style: 'color:DodgerBlue'
        }).text('-] ').appendTo(cap);
        $('<span></span>', {
            style: 'color:GoldenRod'
        }).text('Displaying possible areas matching ').appendTo(cap)
        $('<span></span>', {
            style: 'font-weight:bold;color:LawnGreen'
        }).text(caption).appendTo(cap); //fix

        let header = $("<tr></tr>", {
            style: "text-align:left;color:Ivory"
        }).appendTo(tab);
        $("<th></th>", {
            style: 'width:5em'
        }).text('Num').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('Area Name').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('Room Count').appendTo(header);
    } else {
        let header = $("<tr></tr>", {
            style: "text-align:left;color:Ivory"
        }).appendTo(tab);
        $("<th></th>", {
            style: 'width:5em'
        }).text('').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('').appendTo(header);
        $("<th></th>", {
            style: 'width:auto'
        }).text('').appendTo(header);
    }

    let startIndex = nexMap.display.pageIndex > 0 ? (nexMap.display.pageIndex * nexMap.display.pageBreak) : 0;
    for (let i = startIndex; i < entries.length && i < startIndex + nexMap.display.pageBreak; i++) {
        let row = $("<tr></tr>", {
            style: 'cursor:pointer;color:dimgrey;'
        }).appendTo(tab);
        $("<td></td>", {
            style: 'color:grey',
            onclick: `nexMap.display.click.area(${JSON.stringify(entries[i].id)});`
        }).text(entries[i].id).appendTo(row);
        $("<td></td>", {
            style: 'color:gainsboro;text-decoration:underline',
            onclick: `nexMap.display.click.area(${JSON.stringify(entries[i].id)});`
        }).text(entries[i].name).appendTo(row);
        $("<td></td>", {
            onclick: `nexMap.display.click.area(${JSON.stringify(entries[i].id)});`
        }).text(entries[i].roomCount).appendTo(row);
    }

    print(tab[0].outerHTML);

    let pagination;
    if (Math.ceil(entries.length / nexMap.display.pageBreak) > nexMap.display.pageIndex + 1) {
        pagination = $("<span></span>", {
            style: 'color:Goldenrod'
        }).text(`Displaying ${startIndex + nexMap.display.pageBreak} of ${entries.length}.`);
        nexMap.display.pageIndex++;
        $("<span></span>", {
            style: 'color:Goldenrod'
        }).text(' Click for ').appendTo(pagination);
        $('<a></a>', {
            style: 'cursor:pointer;color:Ivory;text-decoration:underline;',
            onclick: 'nexMap.display.areaTable()'
        }).text('MORE').appendTo(pagination);
    } else {
        pagination = $("<span></span>", {
            style: 'color:Goldenrod'
        }).text(`Displaying ${entries.length} of ${entries.length}.`);
    }

    print(pagination[0].outerHTML);
}

nexMap.display.userCommands = function () {
    let cmds = [
        {
            cmd: 'nm load',
            txt: 'Initial load of the map. There are a few seconds of degraded performance while the full model is loaded.',
        },
        {
            cmd: 'nm config',
            txt: 'Display all user configuration options.'
        },
        {
            cmd: 'nm save',
            txt: 'Saves the current user configuration settings.'
        },
        {
            cmd: 'nm find <string>',
            txt: 'Replaces the functionality of the mapdb package. Displays all rooms matching the phrase. Clicking any entry on the table will begin pathing.'
        },
        {
            cmd: 'nm area <string>',
            txt: 'Searches for areas matching the provided string. Displays in table format with click to go functionality.'
        },
        {
            cmd: 'nm goto <####>',
            txt: 'Calculates the most efficient path to the target room. Will use wings/wormholes/dash/gallop if enabled by the user in settings.'
        },
        {
            cmd: 'nm goto <string>',
            txt: 'Will path to a nexMap landmark or game area matching the string "nm goto ashtan". If no matches are found, tables of possible matches will be displayed.'
        },
        {
            cmd: 'nm mark <string>',
            txt: 'Creates a landmark for the current room using the string label provided. "nm mark secret place". Pathing to these landmarks uses the goto syntax "nm goto secret place".'
        },
        {
            cmd: 'nm marks',
            txt: 'Displays a list all stored landmarks with click to go functionality as well as a "[X]" click to remove option.'
        },
        {
            cmd: 'nm stop',
            txt: 'Cancels the current pathing.'
        },
        {
            cmd: 'nm zoom',
            txt: 'Manual zoom control of the map. Accepts values between 0.2 - 3.0'
        },
        {
            cmd: 'nm refresh',
            txt: 'Refresh the graphical display of the map. Fail safe for display issues.'
        },
        {
            cmd: 'nm wormholes',
            txt: 'Toggles the use of wormholes for pathing.'
        },
        {
            cmd: 'nm clouds',
            txt: 'Toggles the use of clouds, both high and low, for pathing.'
        },
        {
            cmd: '(map)',
            txt: 'Selecting any room on the map via mouse click will path to the selected room.'
        },
        {
            cmd: '(map)',
            txt: 'A mouse click on the map anywhere other than a room will deselect the current selection and stop any active pathing.'
        }
    ];

    let tab = $("<table></table>", {
        class: "mono",
        style: "max-width:100%;border:1px solid GoldenRod;border-spacing:2px"
    });
    let header = $("<tr></tr>", {
        style: "text-align:left;color:Ivory"
    }).appendTo(tab);
    $("<th></th>", {
        style: 'width:10em'
    }).text('Command').appendTo(header);
    $("<th></th>", {
        style: 'width:auto'
    }).text('Summary').appendTo(header);

    for (let x in cmds) {
        let row = $("<tr></tr>", {
            style: 'color:dimgrey;border-top: 1px solid GoldenRod;border-bottom: 1px solid GoldenRod;'
        }).appendTo(tab);
        $("<td></td>", {
            style: 'color:grey'
        }).text(cmds[x].cmd).appendTo(row);
        $("<td></td>", {
            style: 'color:grey;'
        }).text(cmds[x].txt).appendTo(row);
    }
    nexMap.display.notice('Aliases for user interaction');
    print(tab[0].outerHTML);
}

nexMap.display.configDialog = function () {
    let main = $('<div></div>', {
        id: 'nexMapDialog'
    });
    $('<div></div>').appendTo(main);

    let tab = $("<table></table>", {
        class: "mono nexInput",
        style: "max-width:100%;border-spacing:4x;vertical-align:center"
    });

    let header = $("<tr></tr>", {
        style: "text-align:left;color:Ivory"
    }).appendTo(tab);
    $("<th></th>", {
        style: 'width:auto'
    }).text('Option').appendTo(header);
    $("<th></th>", {
        style: 'width:auto'
    }).text('Setting').appendTo(header);

    let configs = [{
            name: 'Use Wormholes',
            setting: 'useWormholes'
        },
        /*{
            name: 'Show Wormholes',
            setting: 'displayWormholes'
        },*/
        {
            name: 'Vibrating Stick',
            setting: 'vibratingStick'
        },
        {
            name: 'Eagle Wings',
            setting: 'useDuanathar'
        },
        {
            name: 'Atavian Wings',
            setting: 'useDuanatharan'
        }
    ];
    for (let i = 0; i < configs.length; i++) {

        let lab = $('<label></label>', {
            'class': 'nexswitch nexInput'
        });
        $('<input></input>', {
                type: "checkbox",
                'class': 'nexbox nexInput'
            })
            .prop('checked', nexMap.settings.userPreferences[configs[i].setting])
            .on('change', function () {
                nexMap.settings.toggle(configs[i].setting)
            })
            .appendTo(lab);
        $('<span></span>', {
            'class': 'nexslider nexInput'
        }).appendTo(lab);

        let row = $("<tr></tr>", {
            class: 'nexRow',
            style: 'cursor:pointer;color:dimgrey;'
        }).appendTo(tab);
        $("<td></td>", {
            style: 'color:grey'
        }).text(configs[i].name).appendTo(row);
        $("<td></td>", {
            style: 'color:gainsboro;text-decoration:underline'
        }).append(lab).appendTo(row);
    }
    let tin = $('<input></input>', {
        type: 'text',
        'class': 'nexInput',
        id: 'nexCommandSep',
        maxlength: 1,
        width: 24,
        value: nexMap.settings.userPreferences.commandSeparator
    });
    let tinRow = $("<tr></tr>", {
        class: 'nexRow',
        style: 'cursor:pointer;color:dimgrey;'
    }).appendTo(tab);
    $("<td></td>", {
        style: 'color:grey'
    }).text('Command Separator').appendTo(tinRow);
    $("<td></td>", {
        style: 'color:gainsboro;text-decoration:underline'
    }).append(tin).appendTo(tinRow);

    let duanathar = $('<input></input>', {
        type: 'text',
        'class': 'nexInput',
        id: 'nexDuanathar',
        width: 150,
        value: nexMap.settings.userPreferences.duanatharCommand
    });
    let duanatharRow = $("<tr></tr>", {
        class: 'nexRow',
        style: 'cursor:pointer;color:dimgrey;'
    }).appendTo(tab);
    $("<td></td>", {
        style: 'color:grey'
    }).text('Eagle Wings Command(s)').appendTo(duanatharRow);
    $("<td></td>", {
        style: 'color:gainsboro;text-decoration:underline'
    }).append(duanathar).appendTo(duanatharRow);

    let duanatharan = $('<input></input>', {
        type: 'text',
        'class': 'nexInput',
        id: 'nexDuanatharan',
        width: 150,
        value: nexMap.settings.userPreferences.duanatharanCommand
    });
    let duanatharanRow = $("<tr></tr>", {
        class: 'nexRow',
        style: 'cursor:pointer;color:dimgrey;'
    }).appendTo(tab);
    $("<td></td>", {
        style: 'color:grey'
    }).text('Atavian Wing Command(s)').appendTo(duanatharanRow);
    $("<td></td>", {
        style: 'color:gainsboro;text-decoration:underline'
    }).append(duanatharan).appendTo(duanatharanRow);

    let playerShape = $('<select></select>', {
            'class': 'nexInput',
            id: 'nexPlayerShape',
            height: 'auto',
            width: 'auto'
        })
        .on('change', function () {
            nexMap.settings.userPreferences.currentRoomShape = $(this)[0].value;
            cy.style()
                .selector('.currentRoom')
                .style({
                    'shape': $(this)[0].value
                }).update();
        });
    $('<option></option>', {
            value: 'rectangle',
            text: 'Rectangle'
        })
        .prop('selected', nexMap.settings.userPreferences.currentRoomShape == 'rectangle' ? true : false).appendTo(playerShape);
    $('<option></option>', {
            value: 'ellipse',
            text: 'Circle'
        })
        .prop('selected', nexMap.settings.userPreferences.currentRoomShape == 'ellipse' ? true : false).appendTo(playerShape);
    $('<option></option>', {
            value: 'diamond',
            text: 'Diamond'
        })
        .prop('selected', nexMap.settings.userPreferences.currentRoomShape == 'diamond' ? true : false).appendTo(playerShape);
    $('<option></option>', {
            value: 'star',
            text: 'Star'
        })
        .prop('selected', nexMap.settings.userPreferences.currentRoomShape == 'star' ? true : false).appendTo(playerShape);
    $('<option></option>', {
            value: 'vee',
            text: 'Vee'
        })
        .prop('selected', nexMap.settings.userPreferences.currentRoomShape == 'vee' ? true : false).appendTo(playerShape);
    let playerShapeRow = $("<tr></tr>", {
        class: 'nexRow',
        style: 'cursor:pointer;color:dimgrey;'
    }).appendTo(tab);
    $("<td></td>", {
        style: 'color:grey'
    }).text('Current room shape').appendTo(playerShapeRow);
    $("<td></td>", {
        style: 'color:gainsboro;text-decoration:underline'
    }).append(playerShape).appendTo(playerShapeRow);

    let curColor = $('<input></input>', {
            type: 'color',
            'class': 'nexInput',
            id: 'nexPlayerColor',
            width: 100,
            defaultValue: nexMap.settings.userPreferences.currentRoomColor,
            value: nexMap.settings.userPreferences.currentRoomColor
        })
        .on('change', function () {
            nexMap.settings.userPreferences.currentRoomColor = $(this)[0].value;
            cy.style()
                .selector('.currentRoom')
                .style({
                    'border-color': $(this)[0].value
                }).update();
        });
    let curColorRow = $("<tr></tr>", {
        class: 'nexRow',
        style: 'cursor:pointer;color:dimgrey;'
    }).appendTo(tab);
    $("<td></td>", {
        style: 'color:grey'
    }).text('Current Room Color').appendTo(curColorRow);
    $("<td></td>", {
        style: 'color:gainsboro;text-decoration:underline'
    }).append(curColor).appendTo(curColorRow);

    tab.appendTo(main);

    main.dialog({
        title: 'nexMap Configuration',
        width: 400,
        close: function () {
            nexMap.settings.userPreferences.commandSeparator = $('#nexCommandSep')[0].value.toString();
            nexMap.settings.userPreferences.duanatharCommand = $('#nexDuanathar')[0].value.toString();
            nexMap.settings.userPreferences.duanatharanCommand = $('#nexDuanatharan')[0].value.toString();
            nexMap.settings.save();
            nexMap.display.notice('User settings saved to server.');
            $('.nexInput').remove();
            $('.nexMapDialog').parent().remove();
        }
    });
}