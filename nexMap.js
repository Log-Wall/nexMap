'use strict';
var cy = {};
var nexMap = {
    logging: true,
    mudmap: {},
	cytoscapeLoaded: false,
    mudletMapLoaded: false,
    currentRoom: -99,
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
    wormWarpExits: {},
};

nexMap.findRoom = function(roomNum) {
    if (nexMap.logging) {console.log(`nexMap: nexMap.findRoom(${roomNum})`)};

    let area = nexMap.mudmap.areas.find(e=>e.rooms.find(e2=>e2.id==roomNum))
    
    if (typeof area === 'undefined') {
        console.log(`Room ${roomNum} not mapped`);
        return false;
    }
    
    let rm = area.rooms.find(e3=>e3.id==roomNum);
    if (nexMap.logging) {console.log(rm);}
    return true;
};

nexMap.changeRoom = function(id) {
    if (nexMap.logging) {console.log(`nexMap: nexMap.changeRoom(${id})`)};
    if (!nexMap.findRoom(id)) {return;}
    let room = cy.$id(id);
    cy.startBatch();
	cy.$('.currentRoom').removeClass('currentRoom');
    room.addClass('currentRoom');
    cy.endBatch()
    nexMap.currentRoom = id;
    $('#currentRoomLabel').text(`${room.data('areaName')}: ${room.data('name')}`)
    $('#currentExitsLabel').text(`Exits: ${room.data('exits').join(', ')}`)
    
    nexMap.changeArea(cy.$id(id).data().area, cy.$id(id).position().z);
    cy.center('.currentRoom');
};

nexMap.changeArea = function(area, z) {
    if (nexMap.logging) {console.log(`nexMap: nexMap.changeArea(${area} ${z})`)};
    if (area == nexMap.currentArea && z == nexMap.currentZ) {return;}
    nexMap.currentArea = area;
    nexMap.currentZ = z;
    cy.startBatch();
    cy.$('.areaDisplay').removeClass('areaDisplay');
    cy.$('.pseudo').remove();
    let x = cy.nodes().filter(e =>
        e.data('area') == nexMap.currentArea && e.data('z') == nexMap.currentZ
    );
    x.addClass('areaDisplay');
    nexMap.generateExits();
    cy.center(nexMap.currentRoom);
    cy.endBatch();
};

nexMap.generateExits = function() {
    if (nexMap.logging) {console.log('nexMap: nexMap.generateExits()')};
    let exitIndex = 0;

    let createExit = function(position, cmd, tar) {
        let pos = {...position}
        if (cmd=='s')
            pos.y+=20;
        else if (cmd=='n')
            pos.y+=-20;
        else if (cmd=='e')
            pos.x+=20;
        else if (cmd=='w')
            pos.x+=-20;
        else if (cmd=='se') {
            pos.x+=20;
        	pos.y+=20;
        }
        else if (cmd=='sw') {
            pos.x+=-20;
        	pos.y+=20;
        }
        else if (cmd=='ne') {
            pos.x+=20;
        	pos.y+=-20;
        }
        else if (cmd=='nw') {
            pos.x+=-20;
        	pos.y+=-20;
        }

        let newNode = {
            group: 'nodes',
            data: {
                id: `pseudo${exitIndex}`,
            },
            position: {x: pos.x, y: pos.y, z: pos.z},
            classes: ['pseudo',tar?'areaAdjacent':`pseudo-${cmd}`],
        };

        cy.add(newNode);

        if (tar) {
            cy.add({
                group: 'edges',
                data: {
                    id: `pseudoE${exitIndex}`,
                    source: tar,
                    target: newNode.data.id,
                },
                classes: ['pseudo','areaAdjacentExit'],
            });
        }
        exitIndex++;
    }

    let x = cy.edges().filter(e =>
            e.data('area') == nexMap.currentArea && e.data('z') == nexMap.currentZ
        );

    x.filter(e=>['up','d','in','out'].includes(e.data('command')))
        .forEach(e=>createExit(e.source().position(), e.data('command')));

    let xe = x.filter(e=>['s','n','e','w','ne','nw','se','sw'].includes(e.data('command')));
    xe = xe.filter(e=>e.target().data('area') != nexMap.currentArea || e.target().data('z') != nexMap.currentZ);

    xe.forEach(e=>createExit(e.source().position(), e.data('command'), e.data('source')));
};

nexMap.generateGraph = async function() {
    if (nexMap.logging) {console.log('nexMap: nexMap.generateGraph()')};
    return new Promise((resolve, reject)=> {
        for (let area of nexMap.mudmap.areas) {
            if (area.roomCount) {
                nexMap.mudmap.areas[area.id].rooms.forEach(room => {
                    let xts = [];
                    nexMap.mudmap.areas.find(e=>
                        e.rooms.find(e2=>
                            e2.id==room.id)).rooms.find(e3=>
                                e3.id==room.id).exits.forEach(e=>
                                    xts.push(nexMap.shortDirs[e.name]?nexMap.shortDirs[e.name]:e.name));
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
                        },
                        position: {x: room.coordinates[0]*20, y: room.coordinates[1]*-20, z: room.coordinates[2]},
                        classes: [`environment${room.environment}`],
                        locked: true,
                    };
                    cy.add(newNode)
                });   
            }
        }

        for (let area of nexMap.mudmap.areas) {
            if (area.roomCount) {
                nexMap.mudmap.areas[area.id].rooms.forEach(room => {
                    room.exits.forEach(exit => {
                        let newEdge;
                        let xt = nexMap.shortDirs[exit.name]?nexMap.shortDirs[exit.name]:exit.name;
                        if (cy.$(`#${room.id}-${exit.exitId}`).length==0) {
                            newEdge = {
                                group: 'edges',
                                data: {
                                    id: `${room.id}-${exit.exitId}`,
                                    source: room.id,
                                    target: exit.exitId,
                                    area: area.id,
                                    command: xt,
                                    z: room.coordinates[2]
                                },
                            }

                            if (xt=='in')
                                newEdge.classes = ['inexit'];
                            else if (xt=='out')
                                newEdge.classes = ['outexit'];
                            else if (xt=='up')
                                newEdge.classes = ['upexit'];
                            else if (xt=='d')
                                newEdge.classes = ['downexit'];
                            else if (xt=='worm warp')
                                newEdge.classes = ['wormwarp'];
                            else if (xt=='enter grate')
                                newEdge.classes = ['sewergrate'];

                            cy.add(newEdge);
                        }
                    });
                });   
            }
        }
    
        cy.edges().filter(e=>e.data('command') == 'southeastst').forEach(e=>e.data().command = 'se'); // Mudlet map misspells 'southeast'
        nexMap.wormWarpExits = cy.edges().filter(e=>e.data('command') == 'worm warp');
        if (!nexMap.settings.userPreferences.useWormholes) {nexMap.wormWarpExits.remove();} // removes all worm warp exits.
        
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
    
nexMap.loadDependencies = async function() {
    if (nexMap.logging) {console.log('nexMap: nexMap.loadDependencies()')};
    let preloader = async function() {
        return new Promise((resolve, reject)=>{
            let src  = "https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.18.2/cytoscape.min.js"

            let head = document.getElementsByTagName('head')[0]
            let elem = document.createElement('script')
            elem.src = src + '?' + Math.random()
            elem.onload = ()=>{
                console.log('Loaded ' + src + '.');
                nexMap.cytoscapeLoaded = true;
                resolve();
            }
            elem.onerror = ()=>{
                console.log('Unable to load ' + src + '.');
                reject();
            }

            head.appendChild(elem)
        });
    }
    
    let clone = function(obj) {
        let copy;
        if (null == obj || 'object' != typeof obj) { return obj }
        if (obj instanceof String) { return (' ' + obj).slice(1) } // https://stackoverflow.com/a/31733628
        if (obj instanceof Date) { 
            copy = new Date()
            copy.setTime(obj.getTime())
            return copy }
        if (obj instanceof Array) {
            copy = []
            for (var i = 0, len = obj.length; i < len; i++) { copy[i] = clone(obj[i]) }
            return copy }
        if (obj instanceof Object) {
            copy = {}
            for (var attr in obj) { if (obj.hasOwnProperty(attr)) { copy[attr] = clone(obj[attr]) } }
            return copy }
        throw new Error('Unable to copy object! Type not supported.') 
    }
    
    let restoreMap = function() {
        $('body')
            .on('restoreMap', function(e, _map) {
            console.log(_map)
            window.Map = _map
            $('body').off('restoreMap')
        })

        let f = document.createElement('iframe')
        f.width = 0
        f.height = 0
        f.src = 'about:blank'
        f.onload = function() {
            $('body').trigger('restoreMap', [clone(f.contentWindow.Map)])
            document.body.removeChild(f)
        }
        document.body.appendChild(f)
    }
    
    let loadMap = async function() {
        return new Promise ((resolve, reject)=>{
            $.ajax({
                async: true,
                global: false,
                url: 'https://raw.githubusercontent.com/Log-Wall/AchaeaNexus/main/mudletmap-min.json',
                //url: "https://raw.githubusercontent.com/IRE-Mudlet-Mapping/AchaeaCrowdmap/gh-pages/Map/map.json",
                dataType: "json",
                success: function (data) {
                    nexMap.mudmap = data;
                    nexMap.mudletMapLoaded = true;

                },
                complete: ()=>{
                    if(nexMap.mudletMapLoaded)
                        resolve();
                        console.log('nexMap: mudlet JSON map loaded.');
                },
                error:()=>{reject()}
            });
        });
    }
    
	restoreMap();
    await Promise.all([preloader(),loadMap()]);
    return true;
};

nexMap.initializeGraph = function() {
    if (nexMap.logging) {console.log('nexMap: nexMap.initializeGraph()')};
    if($('#cy').length) {$('#cy').remove()}
    $('<div></div>', {id:'currentRoomLabel'}).appendTo('#tbl_nexmap_map');
    $('<div></div>', {id:'cy'}).appendTo('#tbl_nexmap_map');
    $('<div></div>', {style:'position:absolute;bottom:0px',id:'currentExitsLabel'}).appendTo('#tbl_nexmap_map');
    
    cy = cytoscape({
        container: document.getElementById('cy'),
        layout: 'grid',
        zoom: 1,
        minZoom: 0.25,
        maxZoom: 3,
        boxSelectionEnabled: false,
        selectionType: 'single',

        hideEdgesOnViewport: true,
        textureOnViewport: true,
        motionBlur: true,
        pixelRatio: 'auto',
    });
};

nexMap.startUp = function() {
    if (nexMap.logging) {console.log('nexMap: nexMap.startUp()')};
	
    run_function('nexMap.settings', {}, 'nexmap');
	run_function('nexMap.display', {}, 'nexmap');
	nexMap.display.notice('Loading mapper modules');
    nexMap.loadDependencies().then(()=>{
        nexMap.initializeGraph();
        nexMap.generateGraph().then(()=> {
            run_function('nexMap.styles', {}, 'nexmap');
            run_function('nexMap.walker', {}, 'nexmap');
            nexMap.styles.style();
            nexMap.display.notice('Mapper loaded and ready for use.');
            send_command('ql');
        });
    });
};
