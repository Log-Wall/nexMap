'use strict';
var cy = {};
var nexMap = {
    version: '2.2.3',
    nxsVersion: 1.4,
    logging: false,
    loggingTime: '',
    mudmap: {},
    cytoscapeLoaded: false,
    mudletMapLoaded: false,
    currentRoom: GMCP?.Room?.Info?.num ? GMCP?.Room?.Info?.num : -99,
    currentArea: -99,
    currentZ: -99,
    wormholes: {},
    sewergrates: {},
    universeRooms: {
        azdun: 1772,
        bitterfork: 25093,
        blackrock: 10573,
        brasslantern: 30383,
        caerwitrin: 17678,
        genji: 10091,
        manara: 9124,
        mannaseh: 1745,
        manusha: 8730,
        mhojave: 39103,
        newhope: 25581,
        newthera: 20386,
        shastaan: 2855,
        thraasi: 35703
    },
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
    areaContinents: {
        Outer:[297,209,207,162,351,191,194,314,193,192,294,206,181,396,317,225],
        Western_Isles:[209,162,207],
        Eastern_Isles:[191,180,181,192],
        Arcadia:[150,153,154],
        North:[73,74,99,101,108,147,197,199,200,202,204,212,213,214,242,243,244,246,261,262,301,306,307,308,352,353,383,385,109],
        Northern_Isles:[194,206,294,351],
        Off:[6,35,105,150,153,154,162,163,166,168,169,170,171,176,180,181,183,190,191,192,193,194,206,207,109,225,245,248,249,252,253,266,271,288,294,297,298,314,317,321,324,351,355,358,359,366,371,382,396,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,45,184],
        Main:[2,3,4,5,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,36,37,38,40,41,42,43,44,46,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,68,69,70,71,72,75,76,77,78,79,80,81,82,83,84,85,87,89,90,95,96,102,103,104,106,107,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,142,144,145,148,149,151,152,155,156,157,158,159,160,167,173,174,175,178,179,182,185,186,187,196,198,201,203,205,208,211,235,238,259,263,264,265,267,268,269,270,272,273,274,275,278,279,280,281,290,291,292,293,295,296,299,300,302,303,309,310,311,312,315,316,318,319,320,323,326,346,347,348,349,350,357,361,362,364,365,367,368,372,374,375,376,377,378,379,380,381,384,386,387,388,389,390,391,392,393,394,395,397,398,400,401,402,461,463,105,298],
        Meropis:[39,67,141,210,215,217,218,256,282,284,285,286,305,322,325,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,399,445],
        Arena:[228,229,230,231,232,233,369],
        Island:[91,92,93,94,97,98,100,161,164,165,195,224,240,464],
    },
    environments: {
        urban: 8,
        'constructed underground': 2,
        'natural underground': 3,
        desert: 6,
        road: 12,
        path: 11,
        grasslands: 7,
        river: 10,
        garden: 21,
        hills: 9,
        mountains: 14,
        trees: 28,
        ruins: 32,
        freshwater: 22,
        forest: 4,
        ocean: 20,
        beach: 5,
        jungle: 17,
        blighted: 29,
    },

    crowdMapRevisions() {
        nexMap.mudmap.areas[343].rooms.find(e=>e.id == 29081).exits.find(e=>e.exitId == 30864).name = `pull rubble${nexMap.settings.userPreferences.commandSeparator}east`;
        nexMap.mudmap.areas[343].rooms.find(e=>e.id == 30136).exits.find(e=>e.exitId == 30469).name = `push bones${nexMap.settings.userPreferences.commandSeparator}east`;
        nexMap.mudmap.areas[343].rooms.find(e=>e.id == 30469).exits.find(e=>e.exitId == 30437).name = `pull shield81739${nexMap.settings.userPreferences.commandSeparator}northeast`;
        nexMap.mudmap.areas[343].rooms.find(e=>e.id == 30523).exits.find(e=>e.exitId == 30631).name = `pull roots${nexMap.settings.userPreferences.commandSeparator}south`;
        nexMap.mudmap.areas[343].rooms.find(e=>e.id == 31099).exits.find(e=>e.exitId == 23239).name = `pull mucus${nexMap.settings.userPreferences.commandSeparator}northeast`;

        nexMap.mudmap.areas[477].rooms.find(e=>e.id == 58509).exits.push({exitId:58881,name:"northeast"})
        nexMap.mudmap.areas[477].rooms.push(JSON.parse('{"coordinates":[3,2,-1],"environment":2,"exits":[{"exitId":58509,"name":"west"},{"exitId":58306,"name":"northeast"}],"id":58881,"name":"A narrow, sandy tunnel","userData":{"Game Area":"the Ghezavat Commune","indoors":"y"}}'));
        nexMap.mudmap.areas[477].rooms.push(JSON.parse('{"coordinates":[4,3,-1],"environment":2,"exits":[{"exitId":58881,"name":"southwest"}],"id":58306,"name":"A landscape of shifting sand","userData":{"Game Area":"the Ghezavat Commune","indoors":"y"}}'));
    },
    
    onGMCP(method, args) {
        switch(method) {
            case 'Room.Info':
                GMCP.Room.Info = args;
                if (args.ohmap) {
                    nexMap_tab.deactivate();
                    return;
                } else if (!nexMap_tab.active) {
                    nexMap_tab.activate();
                    nexMap.styles.refresh();
                    cy.center();
                }
                nexMap.changeRoom(GMCP.Room.Info.num);
                
                if (this.mongo.entries.length > 0 && typeof Realm != 'undefined' && GMCP.Char.Items.List.location == "room" && GMCP.Char.Items.List.items.length > 0) {
                    this.mongo.collect();
                }

                if(nexMap.walker.pathing)
                    nexMap.walker.step();
                break;
            case 'Char.Items.List':
                GMCP.Char.Items.List = args;
                break;
            case 'Char.Status':    
                if ((args.class == 'Serpent' || nexMap.settings.vibratingStick) && !nexMap.settings.useWormhole)
                    nexMap.settings.toggle('useWormholes');
                break;
        }
    },
    farseeLocal(target, room) {
        let tar = cy.nodes().find(n => n.data('name') == room).data('id')
        let path = nexMap.walker.determinePath(nexMap.currentRoom, tar);
        let msg = $('<span></span>',{id:'farsee'});
        $('<span>You see that </span>').appendTo(msg);
        $('<span></span>', {style:"color:goldenrod"}).text(target).appendTo(msg);
        $('<span> is at </span>').appendTo(msg);
        $('<span></span>',{
            id:'farsee', 
            style:'color:White;text-decoration:underline;cursor:pointer',
            onclick:`nexMap.walker.speedWalk(${nexMap.currentRoom}, ${tar})`
            })
            .text(`"${room}"`)
            .appendTo(msg);
        $('<span></span>').text(` (${path.rawPath.length} steps)`).appendTo(msg);
        //print(msg[0].outerHTML)
        //print($('<span></span>').text(`[${nexMap.walker.determinePath(nexMap.currentRoom, tar).rawPath.join(', ')}]`)[0].outerHTML);
    
        return true;
    },
    farseeArea(target, area) {
        let areas = nexMap.findArea(`${area}`);
    
        if(!areas.length) {
            console.log(`${area}`);
            return false;
        }
    
        let msg = $('<span></span>',{id:'farsee'});
        $('<span>Though too far away to accurately perceive details, you see that </span>').appendTo(msg);
        $('<span></span>', {style:"color:goldenrod"}).text(target).appendTo(msg);
        $(`<span> is in </span>`).appendTo(msg);
        let link = $('<span></span>',{
            id:'farsee', 
            style:'color:White;text-decoration:underline;cursor:pointer',
            onclick: `nexMap.display.click.area(${JSON.stringify(areas[0].id)});`
            })        
            .text(`"${area}"`)
    
        if (areas.length>1) {
            $(`<span>${area}</span>`).appendTo(msg);
            //print(msg[0].outerHTML)
            nexMap.display.generateTable('areaTable', areas, area);
        }
        else if (areas.length == 1) {    
            link.appendTo(msg);
            //print(msg[0].outerHTML)
        }
        else {
            $(`<span>${area}</span>`).appendTo(msg);
            //print(msg[0].outerHTML)
            nexMap.display.notice('nothing found');    
        }
    
        return true;
    },
    stopWatch() {
        let t = (new Date() - nexMap.loggingTime) / 1000;
    
        if (nexMap.logging)
            console.log(`${t}s`);
    
        return t;
    },
    findRoom(roomNum) {
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
        //print(JSON.stringify(rm));
        return true;
    },
    // Returns a collection of Nodes matching the room NAME
    findRooms(search) {
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
    },
    // Returns a collection of JSON area objects.
    // JSON areas have custom names that do not always match the GMCP area names.
    // The GMCP area names are stored as userData in the room objects. Searches all user data for exact matches,
    // then returns the area containing the matched room.
    findArea(search) {
        let areas = nexMap.mudmap.areas.filter(e => e.rooms.find(e2 => e2?.userData?.['Game Area']?.toLowerCase() == search.toLowerCase()))

        if (typeof areas === 'undefined') {
            console.log(`Area not found`);
            return false;
        }

        return areas;
    },
    // Filters for possible matching areas rather than exact matches.
    findAreas(search) {
        let areas = nexMap.mudmap.areas.filter(e => e.rooms.find(e2 => e2?.userData?.['Game Area']?.toLowerCase().includes(search.toLowerCase())));

        if (typeof areas === 'undefined') {
            console.log(`Area not found`);
            return false;
        }

        return areas;
    },
    async changeRoom(id) {
        if (nexMap.logging)
            console.log(`nexMap: nexMap.changeRoom(${id})`);
        
        if (id == nexMap.currentRoom)
            return;

        if (cy.$id(id).hasClass('currentRoom') || !cy.$id(id).length)
            return;
    
        let room = cy.$id(id);
    
       cy.startBatch();
            cy.$('.currentRoom').removeClass('currentRoom'); //remove the class from the previous room.
            room.addClass('currentRoom');
    
            await nexMap.changeArea(cy.$id(id).data('area'), cy.$id(id).position().z); 
              
        cy.endBatch();
        cy.center(`#${id}`); 
        $('#currentRoomLabel').text(`${room.data('areaName')}: ${room.data('name')} (${GMCP.Room.Info.num})`)
        //$('#currentRoomLabel').text(`${room.data('areaName')}: ${room.data('name')} (${GMCP.Room.Info.num})`)
        //$('#currentExitsLabel').text(`Exits: ${room.data('exits').join(', ')}`)
    
        $('.clickableExitSpace').remove();
        $('.clickableExit').remove();
        cy.$id(GMCP.Room.Info.num).data('exits').forEach((e, i) => {
            $('<span></span>', {class: 'clickableExit', style: 'text-decoration:underline;cursor:pointer'})
                .text(`${e}`)
                .on('click', function() {nexusclient.send_commands(this.innerText)})
                .appendTo('#currentExitsLabel');
            $('<span></span>', {class: 'clickableExitSpace'})
                .text(`${i == cy.$id(GMCP.Room.Info.num).data('exits').length - 1 ? '' : ', '}`)
                .appendTo('#currentExitsLabel');
        });
    
        nexMap.currentRoom = id;
    },
    async changeArea(area, z, override = false) {
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
        cy.center(`#${GMCP.Room.Info.num}`);
        return true;
    },
    generateExits() {
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
    },
    async generateGraph() {
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
                                else if (xt.includes('sendAll') && !xt.includes('if')) {
                                    newEdge.data.command = xt.substr(xt.indexOf("(")+1, xt.indexOf(")") - xt.indexOf("(") - 1)
                                            .replace(/["']/g, '')
                                                .replace(/,\s?/g, nexMap.settings.userPreferences.commandSeparator);
                                } else if (xt.includes('send(') && !xt.includes('if')) {
                                    newEdge.data.command = xt.substr(xt.indexOf("(")+1, xt.indexOf(")") - xt.indexOf("(") - 1)
                                            .replace(/["']/g, '');
                                }
    
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
    
                        if (room?.symbol?.text && ['S', 'F', 'G', 'C', 'N', 'M', '$', 'L', 'H', 'W', 'A', 'P', 'B'].includes(room.symbol.text)) {
                            newNode.classes.push('backgroundImageRoom');
                            newNode.data.image = nexMap.styles.generateSVG(room.symbol.text);
                        }
    
                        if (xts.includes('worm warp')) {
                            newNode.classes.push('wormholeRoom');
                        }
    
                        nexGraph.push(newNode);
                    });
                }
            });

            // Universe Tarot Node and Exits
            let newNode = {
                group: 'nodes',
                data: {
                    id: 'universe',
                    area: 'universe',
                    areaName: 'universe',
                    environment: 'Skies',
                    name: 'Universe Tarot',
                    userData: {indoors: 'y'},
                    z: 1,
                },
                position: {
                    x: 1 * 20,
                    y: 1 * -20,
                    z: 1
                },
                classes: [`environmentskies`],
                locked: true,
            }
            nexGraph.push(newNode);
            for(let e of Object.keys(nexMap.universeRooms))
            {
                let newEdge = {
                    group: 'edges',
                    data: {
                        id: `universe-${nexMap.universeRooms[e]}`,
                        source: 'universe',
                        target: nexMap.universeRooms[e],
                        weight: 6,
                        area: 'universe',
                        command: `outd universe${nexMap.settings.userPreferences.commandSeparator}fling universe at ground`,
                        universe: e,
                        door: false,
                        z: 1
                    },
                    classes: ['sewergrate']
                }
                nexGraph.push(newEdge);
            }
    
            cy.batch( () => {
                cy.add(nexGraph);
                nexMap.wormholes = cy.$('.wormhole');
                nexMap.sewergrates = cy.$('.sewergrate');
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
    },
    async loadDependencies() {
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
                    //url: 'https://cdn.jsdelivr.net/gh/IRE-Mudlet-Mapping/AchaeaCrowdmap/Map/map_mini.json',
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
    },
    initializeGraph() {
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
    },
    sevenTruths(num) {
        let truths = [
            `Truth One: What is called evil is simply the drive for advancement, for greatness. We seek, through discipline and pain, to spur the advancement of nothing less than sentient life.`,
            `Truth Two: Cruelty - the application of pain - is the method by which one weeds out the weak and feeble-minded from the population.`,
            `Truth Three: Weakness must be eliminated in all its forms: Physical, Mental, and Spiritual.`,
            `Truth Four: The enemies of strength are those who trumpet the effeminate values of forgiveness, tolerance, and laxity of discipline.`,
            `Truth Five: The body may be made stronger through combat.`,
            `Truth Six: The mind may be made stronger through the elimination of conscience. One does this by inflicting pain on others.`,
            `Truth Seven: The spirit may be made stronger by enduring hardships, both self-imposed and externally imposed.`
        ]
    
        if (num > truths.length) {
            return truths[truths.length * Math.random() | 0];
        } else {
            return truths[num];
        }
    },
    nxsUpdates() {
        /*if (typeof reflex_find_by_name("trigger", "Universe Tarot", false, false, "nexMap") === 'undefined') {
            reflex_create(client.packages[client.packages.findIndex(e => e.name == 'nexmap')].items[5],'New Tarot','trigger','nexmap');
            Object.assign(reflex_find_by_name("trigger", "Universe Tarot", false, false, "nexMap"), {
                matching: 'exact',
                text: 'A shimmering, translucent image rises up before you, its glittering surface displaying the verdant grasslands, soaring mountains, sprawling settlements and deep blue seas of Sapience.',
                actions: [JSON.parse("{\"action\":\"script\",\"script\":\"if (nexMap.walker.universeTarget) {\\n\\tnexusclient.send_commands(`queue addclear eqbal touch ${nexMap.walker.universeTarget}`);\\n    nexMap.walker.universeTarget = false;\\n}\"}")]
            });
        }

        reflex_find_by_name('function', 'onLoad', false, false, 'nexMap').code = `GMCP.Room = {};
GMCP.Char = {
    Items: {}
};
$.getScript("https://unpkg.com/realm-web@1.2.0/dist/bundle.iife.js");
$.getScript('https://cdn.jsdelivr.net/gh/Log-Wall/nexMap/nexMap.min.js');
console.log('called nexMap CDN');
reflex_disable(reflex_find_by_name(\"group\", \"Aliases\", false, false, \"nexMap\"));
reflex_disable(reflex_find_by_name(\"group\", \"Triggers\", false, false, \"nexMap\"));`*/
    },
    startUp() {
        if (nexMap.logging) 
            console.log('nexMap: nexMap.startUp()');
    
        nexMap.loggingTime = new Date();
        nexMap.stopWatch();
        nexusclient.reflexes().run_function('nexMap.settings', {}, 'nexmap');
        nexMap.stopWatch();        
        nexusclient.reflexes().run_function('nexMap.display', {}, 'nexmap');
        nexMap.stopWatch();
        nexMap.display.notice('Loading mapper modules. May take up to 10 seconds.');
        //print($('<p></p>', {style:'color:cyan'}).text(
        //    'nexMap default location does not place well with nexGui. If you wish to use nexMap with nexGui you must change the tab location in Functions>customTabs to "container_1".'
        //   )[0].outerHTML);
        
        nexMap.loadDependencies().then(() => {
            nexMap.mongo.startUp();
            nexMap.stopWatch();
            nexMap.crowdMapRevisions();
            nexMap.initializeGraph();
            nexMap.stopWatch();
            nexMap.generateGraph().then(() => {
                nexMap.stopWatch();
                
                nexMap.styles.style();
                nexMap.stopWatch();
                
                nexMap.display.notice(`Use "nm" for summary of user commands`);
    
                cy.once('render', () => {
                    nexMap.display.notice(`nexMap ${nexMap.version} loaded and ready for use. ${nexMap.stopWatch()}s`);
                    //print($('<img></img>', {
                    //    src: 'https://tenor.com/view/daddys-home2-daddys-home2gifs-jon-lithgow-reunion-waiting-gif-9683398.gif',
                    //    width: "35%"
                    //})[0].outerHTML);
                    nexusclient.send_commands('ql');
                    nexMap.styles.refresh();
                    if (nexusclient.variables().get('nexMapConfigs')?.initialConfiguration != nexMap.version) {
                        this.nxsUpdates();
                        console.log(`Config error checking:`);
                        console.log(nexusclient.variables().get('nexMapConfigs')?.initialConfiguration);
                        console.log(nexMap.settings.userPreferences.initialConfiguration);
                        console.log(nexMap.version);
                        nexusclient.send_commands('nm config');
                    }
                });
            });
        });       
    },
    settings: {
        userPreferences: {
            intialConfiguration: nexusclient.variables().get('nexMapConfigs')?.initialConfiguration || 0,
            commandSeparator: nexusclient.variables().get('nexMapConfigs')?.commandSeparator || '\\',
            useDuanathar: nexusclient.variables().get('nexMapConfigs')?.useDuanathar || false,
            useDuanatharan: nexusclient.variables().get('nexMapConfigs')?.useDuanatharan || false,
            duanatharCommand: nexusclient.variables().get('nexMapConfigs')?.duanatharCommand || 'say duanathar',
            duanatharanCommand: nexusclient.variables().get('nexMapConfigs')?.duanatharanCommand || 'say duanatharan',
            useSewergrates: nexusclient.variables().get('nexMapConfigs')?.useSewergrates || false,
            useWormholes: nexusclient.variables().get('nexMapConfigs')?.useWormholes || false,
            useUniverse: nexusclient.variables().get('nexMapConfigs')?.useUniverse || false,
            vibratingStick: nexusclient.variables().get('nexMapConfigs')?.vibratingStick || false,
            displayWormholes: nexusclient.variables().get('nexMapConfigs')?.displayWormholes || false,
            currentRoomShape: nexusclient.variables().get('nexMapConfigs')?.currentRoomShape || 'rectangle',
            currentRoomColor: nexusclient.variables().get('nexMapConfigs')?.currentRoomColor || '#ff1493',
            labelDisplay: nexusclient.variables().get('nexMapConfigs')?.labelDisplay || 'name',
            landmarks: nexusclient.variables().get('nexMapConfigs')?.landmarks || [],
            antiWingAreas: nexusclient.variables().get('nexMapConfigs')?.antiWingAreas || [],
            antiGareAreas: nexusclient.variables().get('nexMapConfigs')?.antiGareAreas || [],
            antiUniverseAreas: nexusclient.variables().get('nexMapConfigs')?.antiUniverseAreas || []
        },
        save() {
            nexMap.settings.userPreferences.initialConfiguration = nexMap.version;
            nexusclient.variables().set('nexMapConfigs', nexMap.settings.userPreferences);
        },
        toggleWormholes() {
            if (nexMap.settings.userPreferences.useWormholes) {
                    nexMap.wormholes.restore();
            } else {
                    nexMap.wormholes.remove(); 
            }
        },
        toggleSewergrates() {
            if (nexMap.settings.userPreferences.useSewergrates) {
                    nexMap.sewergrates.restore();
            } else {
                    nexMap.sewergrates.remove(); 
            }
        },
        toggle(seting) {
            if (nexMap.settings.userPreferences[seting])
                nexMap.settings.userPreferences[seting] = false;
            else
                nexMap.settings.userPreferences[seting] = true;
        
            if (seting == 'useWormholes')
                nexMap.settings.toggleWormholes();
            else if (seting == 'useSewergrates')
                nexMap.settings.toggleSewergrates(); 
        
            nexMap.settings.save();
        },
        addMark(str) {
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
        },
        removeMark(name) {
            let i = nexMap.settings.userPreferences.landmarks.findIndex(e => e.name.toLowerCase() == name.toLowerCase());
        
            nexMap.settings.userPreferences.landmarks.splice(i, 1);
            nexMap.display.notice(`Removed landmark for "${name}"`);
        }
    },
    styles: {
        style() {
            if (nexMap.logging) {
                console.log('nexMap: nexMap.style()')
            };
            $('#cy').css({
                id: 'cy',
                //'background-image': ' url(/includes/images/windows/map-background.jpg)',
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
            cy.on('zoom', evt => {
                cy.style().selector('.displayLabel').style({
                    'font-size': `${12 * (1 / cy.zoom())}px`
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
                if (nexusclient.settings().css_style != 'standard')
                    nexMapCSS += '#tab_nexmap_map::before {content: "\\f2ae";}';
        
                inject(nexMapCSS);
            };
            generateStyle();
        },
        generateSVG(txt) {
            let svg_pin = $('<svg width="100" height="100" viewBox="0 0 100 100" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"></svg>')
            let svg_text = $('<text></text>', {
                x: "50",
                y: "60",
                'font-size': '90px',
                'dominant-baseline': 'middle',
                'text-anchor': 'middle',
                fill: "black",
                /*stroke: "black",
                'stroke-width': '5px',
                'stroke-linecap': 'butt',
                'stroke-linejoin': 'miter',*/
                'font-family': "Arial, monospace",
                'text-align': 'center',
                'font-weight': 'bold'
            }).text(txt);
        
            svg_text.appendTo(svg_pin)
        
            let svgpin_Url = encodeURI("data:image/svg+xml;utf-8," + svg_pin[0].outerHTML);
        
            return svgpin_Url;
        },
        refresh() {
            if (typeof cy.unmount !== 'function') {
                nexMap.display.notice(`nexMap not loaded. Please run "nm load".`);
                return;
            }
            setTimeout(function(){
                nexMap.changeRoom(nexMap.currentRoom);
                nexMap.changeArea(nexMap.currentArea, nexMap.currentZ, true)
            }, 500);  
        },
        stylesheet: []
    },
    walker: {
        pathing: false,
        pathRooms: [],
        pathCommands: [],
        pathRawCommands: [],
        pathRawRooms: [],
        delay: false,
        destination: 0,
        stepCommand: '',
        universeTarget: false,
        clientEcho: nexusclient.settings().echo_input,
        speedWalk(s, t) {
            if (nexMap.logging) {
                console.log('nexMap: nexMap.walker.speedwalk()')
            };
        
            nexMap.walker.pathingStartTime = new Date();
            nexMap.walker.clientEcho = nexusclient.settings().echo_input;
            nexusclient.settings().echo_input = false;
            nexMap.walker.determinePath(s, t);
            nexMap.walker.step();
        },
        //nexMap.walker.speedWalk(nexMap.currentRoom, cy.$(`[area = ${id}]`))
        // The aStar pathing to a collection of Nodes in an area does not seem to always path to the closest Node in the collection.
        // this is a work around.
        areaWalk(areaID) {
            let target = cy.elements().aStar({
                root: `#${nexMap.currentRoom}`,
                goal: cy.$(`[area = ${areaID}]`),
                weight: function (edge) {
                    return edge.data('weight');
                },
                directed: true
            }).path.nodes().find(n => n.data('area') == areaID).data('id')
    
            nexMap.walker.speedWalk(nexMap.currentRoom, target)
        },
        goto(str) {
            if (typeof str === 'number') {
                str = str.toString();
            } else if (typeof str !== 'string') {
                return;
            }
            console.log(`str: ${str}`);
            let findMark = nexMap.settings.userPreferences.landmarks.find(e => e.name.toLowerCase() == str.toLowerCase());
            if (findMark) {
                nexMap.walker.speedWalk(nexMap.currentRoom, findMark.roomID);
                return;
            }
            console.log(`findMark: ${findMark}`);
            let areas = nexMap.findArea(str);
            console.log(`areas: ${areas}`);
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
            console.log(`closestArea: ${closestArea}`);
        
            nexMap.walker.areaWalk(closestArea.id);
        },
        step() {
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
            if (nexMap.logging) {console.log(nmw.stepCommand)};
            nexusclient.send_commands(`${nmw.stepCommand}`);
        },
        determinePath(s, t) {
            if (nexMap.logging) {
                console.log(`nexMap: nexMap.walker.determinePath(${s}, ${t})`)
            };
            let source = s ? s : GMCP.Room.Info.num;
            let target = t ? t : cy.$(':selected').data('id');

            if(source == target) {
                nmw.pathing = false;
                nmw.reset();
                nexMap.display.notice(`Pathing complete. You're already there!`);
                return;
            }

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
            let universe = nmw.checkUniverse(astar, target);
            let base = {
                astar: astar,
                rooms: nmw.pathRooms,
                commands: nmw.pathCommands,
                distanceModifier: 0
            }

            let optimalPath = [gare, universe, base].reduce((a, b) => {
                if (typeof a == 'undefined') {return b};
                if (typeof b == 'undefined') {return a};
                return (a?.commands?.length + a?.distanceModifier) < (b?.commands?.length + b?.distanceModifier) ? a : b;
            });

            // We are checking the clouds/air after the others. there are situations where the universe/gare
            // path would provide a quicker outdoor exit that the clouds could then utilize. An example
            // is deep in azdun, the universe+cloud combo typically is faster.
            let cloud = nmw.checkClouds(optimalPath, target);
            let cloudBase = nmw.checkClouds(base, target);
            let air = nmw.checkAirlord(optimalPath, target);
            optimalPath = [cloud, air, cloudBase, optimalPath].reduce((a, b) => {
                if (typeof a == 'undefined') {return b};
                if (typeof b == 'undefined') {return a};
                return (a?.commands?.length + a?.distanceModifier) < (b?.commands?.length + b?.distanceModifier) ? a : b;
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
        },
        checkAirlord(optimalPath, target) {
            if (nexMap.logging) {
                console.log(`nexMap: nexMap.walker.checkAirlord(${optimalPath}, ${target})`)
            };

            if (!GMCP.Status.class.toLowerCase().includes('air')) {
                return;
            }
        
            let firstOutdoorRoom = optimalPath.astar.path.nodes().find(e => e.data().userData.indoors != 'y' && !nexMap.settings.userPreferences.antiWingAreas.includes(e.data('area')));
            let wingRoomId = firstOutdoorRoom ? firstOutdoorRoom.data('id') : 0;
            
            if (wingRoomId == 0) {
                return;
            }
        
            let cloudRooms = [...optimalPath.rooms];
            let cloudCommands = [...optimalPath.commands];
            let cloudPath = {astar: {}, command: ''};
            let highCloudPath = {astar: {}, command: ''};
            let stratospherePath = {astar: {}, command: ''};
            let g = typeof target === 'object' ? target : `#${target}`
        
            cloudPath.astar = cy.elements().aStar({
                root: `#3885`,
                goal: g,
                weight: function (edge) {
                    return edge.data('weight');
                },
                directed: true
            });
            cloudPath.command = 'aero soar low';
        
            highCloudPath.astar = cy.elements().aStar({
                root: `#4882`,
                goal: g,
                weight: function (edge) {
                    return edge.data('weight');
                },
                directed: true
            });
            highCloudPath.command = 'aero soar high';
        
            stratospherePath.astar = cy.elements().aStar({
                root: `#54173`,
                goal: g,
                weight: function (edge) {
                    return edge.data('weight');
                },
                directed: true
            });
            stratospherePath.command = 'aero soar stratosphere';
        
            let optimalCloud = [cloudPath, highCloudPath, stratospherePath].reduce((a, b) => {
                return a?.astar?.distance < b?.astar?.distance ? a : b;
            });
        
            // Added +12 to the comparison based on 4 seconds of balance at an assumed rate of 3 rooms per second.
            if (optimalPath.astar.distance > cloudCommands.indexOf(wingRoomId) + optimalCloud.astar.distance + 15) {
                cloudRooms.splice(cloudRooms.indexOf(wingRoomId) + 12);
                cloudCommands.splice(cloudRooms.indexOf(wingRoomId));
                cloudCommands.push(optimalCloud.command);
        
                optimalCloud.astar.path.nodes().forEach(e => cloudRooms.push(e.data('id')));
                optimalCloud.astar.path.edges().forEach(e => cloudCommands.push(e.data('command')));
            }
        
            return {
                astar: optimalCloud,
                rooms: cloudRooms,
                commands: cloudCommands,
                distanceModifier: 12 //4 second balance
            }
        },
        checkGare(astar, target) {
            if (nexMap.logging) {
                console.log(`nexMap: nexMap.walker.gare(${astar}, ${target})`)
            };

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
                astar: garePath,
                rooms: gareRooms,
                commands: gareCommands,
                distanceModifier: 10
            }
        },
        checkClouds(optimalPath, target) {
            if (nexMap.logging)
                console.log(`nexMap: nexMap.walker.checkClouds()`);
        
            if (!nexMap.settings.userPreferences.useDuanathar && !nexMap.settings.userPreferences.useDuanatharan)
                return;
        
            let firstOutdoorRoom = optimalPath.astar.path.nodes().find(e => e.data().userData.indoors != 'y' && !nexMap.settings.userPreferences.antiWingAreas.includes(e.data('area')));
            let wingRoomId = firstOutdoorRoom ? firstOutdoorRoom.data('id') : 0;

            if (wingRoomId == 0) {
                return;
            }
        
            let highCloudPath;
            let cloudRooms = [...optimalPath.rooms];
            let cloudCommands = [...optimalPath.commands];
        
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
                if (optimalPath.astar.distance > cloudRooms.indexOf(wingRoomId) + cloud.distance) {
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
                commands: cloudCommands,
                distanceModifier: 0
            }
        },
        checkUniverse(astar, target) {
            if (!nexMap.settings.userPreferences.useUniverse) {
                return;
            }

            if (!['Jester', 'Occultist'].includes(GMCP.Status.class)) {
                return;
            }

            if (nexMap.settings.userPreferences.antiUniverseAreas.includes(nexMap.currentArea)) {
                return;
            }

            let universeRooms = [];
            let universeCommands = [];

            let g = typeof target === 'object' ? target : `#${target}`

            let universePath = cy.elements().aStar({
                root: `#universe`,
                goal: g,
                weight: function (edge) {
                    return edge.data('weight');
                },
                directed: true
            });
            console.log(astar.distance);
            console.log(universePath);
            if (astar.distance > universePath.distance + 9) {       
                universePath.path.nodes().forEach(e => universeRooms.push(e.data('id')));
                universePath.path.edges().forEach(e => universeCommands.push(e.data('command')));
                universeRooms.shift();
                universeRooms.unshift(GMCP.Room.Info.num);
                nexMap.walker.universeTarget = Object.entries(nexMap.universeRooms).find(e => e[1] == universeRooms[1])[0];
            } else {return;}
            
            return {
                astar: universePath,
                rooms: universeRooms,
                commands: universeCommands,
                distanceModifier: 9 //3 second balance.
            }
        },
        hybridPath() {
            if (nexMap.logging)
                console.log(`nexMap: nexMap.walker.hybridPath()`);
        
            let nmwpc = nexMap.walker.pathCommands;
            let nmwpr = nexMap.walker.pathRooms;
        
            if (nexMap.logging) {
                console.log('nexMap.walker.hybridPath() nmwpc, nmwpr');
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
                    if (Object.values(nexMap.shortDirs).includes(nmwpc[i-1])) {
                        hybRm.push(nmwpr[i]);
                        hybCmds.push(`path track ${nmwpr[i]}`);
                    }
                    hybRm.push(nmwpr[i + 1]);
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
                console.log('nexMap.walker.hybridPath() hybCmds, hybRm');
                console.log(hybCmds);
                console.log(hybRm);
            }
        
            nexMap.walker.pathCommands = [...hybCmds];
            nexMap.walker.pathRooms = [...hybRm];
        },
        // IN DEVELOPMENT Not currently used for anything
        checkGlide(path, target) {
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
        
        },
        reset() {
            if (nexMap.logging)
                console.log('nexMap: nexMap.walker.reset()');

            nexMap.walker.universeTarget = false;
            nexMap.walker.pathing = false;
            cy.$(':selected').unselect();
            nexMap.walker.pathCommands = [];
            nexMap.walker.pathRooms = [];
            nexMap.walker.destination = 0;
            nexMap.walker.stepCommand = '';
            nexMap.walker.delay = false;
            nexusclient.settings().echo_input = nexMap.walker.clientEcho;
        },
        stop() {
            if (nexMap.logging)
                console.log('nexMap: nexMap.walker.stop()');
        
            if (nexMap.walker.pathing === true) {
                nexMap.display.notice('Pathing canceled');
                nexusclient.send_commands('path stop');
            }
        
            nexMap.walker.reset();
        }
    },
    display: {
        pageBreak: 20,
        pageIndex: 0,
        displayCap: {},
        click: {},
        displayEntries: {},
        notice(txt, html = false) {
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
        
        
            //print(msg[0].outerHTML);
        },
        versionNotice(ver) {
            if (nexMap.nxsVersion == ver) {
                return;
            }
            
            let msg = $("<span></span>", {
                style: 'color:GoldenRod'
            }).text(`Download the newest version ${nexMap.nxsVersion} `);
            $("<a></a>", {
                href: 'https://sites.google.com/view/nexmap/home',
                target: '_blank',
                style: 'color:white;text-decoration:underline'
            }).text(`HERE`)
                .appendTo(msg);
            $("<span></span>", {
                style: 'color:GoldenRod'
            }).text(` for the latest features/fixes.`)
                .appendTo(msg);
    
            nexMap.display.notice(`You are running nxs package version ${ver}.`);
            nexMap.display.notice(msg, true);
        },
        generateTable(table, entries = false, caption = false) {
            nexMap.display.pageIndex = 0;
            /*if (table == 'displayTable') {
                console.log('works');
                nexMap.display.displayEntries = entries;
                nexMap.display.displayCap = caption;
                nexMap.display.displayTable();
            } else {
                console.log(table);
                console.log(entries);
                nexMap.display[`${table}`](entries, caption)
            }*/ 
            nexMap.display.displayEntries = entries;
            nexMap.display.displayCap = caption;
            nexMap.display[`${table}`](entries, caption)
        },
        click: {
            room(id) {
                if (typeof parseInt(id) !== 'number') {
                    console.log(id);
                    return;
                }
            
                cy.$(':selected').unselect();
                cy.$(`#${id}`).select();
            },
            area(id) {
                if (typeof id !== 'number') {
                    console.log(id);
                    return;
                }
            
                nexMap.walker.areaWalk(id);
            },
            denizen(id) {
                let den = nexMap.display.displayEntries.find(e => e.id == id);
                console.log(den)
                let rm = den.room;
                let idx = rm.indexOf(nexMap.currentRoom);
                cy.$(':selected').unselect();
                if (idx == -1) {
                    cy.$(`#${rm[0]}`).select();
                } else {
                    cy.$(`#${rm[idx+1]}`).select();
                }
            },
            denizenRemove(id) {
                let msg = nexMap.display.displayEntries.find(e => e.id == id);
                console.log(`Denizen Remove table click: ${msg}`);
                return msg;
            }

        },
        displayTable() {
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
        
            //print(tab[0].outerHTML);
        
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
        
            //print(pagination[0].outerHTML);
        },
        landmarkTable(marks = false, caption = false) {
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
        
            //print(tab[0].outerHTML);
        
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
        
            //print(pagination[0].outerHTML);
        },
        areaTable() {
            let entries = nexMap.display.displayEntries;
            let caption = nexMap.display.displayCap;
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
        
            //print(tab[0].outerHTML);
        
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
        
            //print(pagination[0].outerHTML);
        },
        denizenTable() {
            let entries = nexMap.display.displayEntries;
            let caption = nexMap.display.displayCap;

            let tab = $("<table></table>", {
                class: "mono",
                style: "table-layout:fixed;max-width:100%;border:1px solid GoldenRod;border-spacing:0px;padding:0 3px 0 3px"
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
                }).text('Displaying denizens matching ').appendTo(cap)
                $('<span></span>', {
                    style: 'font-weight:bold;color:LawnGreen'
                }).text(caption ? caption : 'All').appendTo(cap); //fix
        
                let header = $("<tr></tr>", {
                    style: "text-align:left;color:Ivory"
                }).appendTo(tab);
                $("<th></th>", {
                    style: 'width:5ch'
                }).text('').appendTo(header);
                $("<th></th>", {
                    style: 'width:8ch'
                }).text('ID').appendTo(header);
                $("<th></th>", {
                    //style: 'width:25%'
                }).text('Name').appendTo(header);
                $("<th></th>", {
                    //style: 'padding:0 10px 0 0'
                }).text('Room').appendTo(header);
                $("<th></th>", {
                    style: 'width:25%;padding:0 0 0 10px'
                }).text('Area').appendTo(header);
            } else {
                let header = $("<tr></tr>", {
                    style: "text-align:left;color:Ivory"
                }).appendTo(tab);
                $("<th></th>", {
                    style: 'width:5ch'
                }).text('').appendTo(header);
                $("<th></th>", {
                    style: 'width:8ch'
                }).text('').appendTo(header);
                $("<th></th>", {
                    //style: 'width:25%'
                }).text('').appendTo(header);
                $("<th></th>", {
                    //style: 'padding:0 0 0 10px'
                }).text('').appendTo(header);
                $("<th></th>", {
                    style: 'width:25%;padding:0 0 0 10px'
                }).text('').appendTo(header);
            }
        
            let startIndex = nexMap.display.pageIndex > 0 ? (nexMap.display.pageIndex * nexMap.display.pageBreak) : 0;
            for (let i = startIndex; i < entries.length && i < startIndex + nexMap.display.pageBreak; i++) {
                let row = $("<tr></tr>", {
                    style: 'cursor:pointer;color:dimgrey;'
                }).appendTo(tab);
                $("<td></td>", {
                    style:"color:#6b5b95;text-decoration:underline", 
                    onclick: `nexMap.settings.click.removeDenizen(${JSON.stringify(entries[i].id)});`
                }).text('[X]').appendTo(row);
                $("<td></td>", {
                    style: 'color:#878f99',
                    onclick: `nexMap.display.click.denizen(${JSON.stringify(entries[i].id)});`
                }).text(`${entries[i].id}`).appendTo(row);
                $("<td></td>", {
                    style: 'color:#a2b9bc;text-decoration:underline',
                    onclick: `nexMap.display.click.denizen(${JSON.stringify(entries[i].id)});`
                }).text(`${entries[i].name}`).appendTo(row);
                $("<td></td>", {
                    style: 'color:#b2ad7f;overflow:hidden;white-space:nowrap',
                    onclick: `nexMap.display.click.denizen(${JSON.stringify(entries[i].id)});`
                }).text(`${entries[i].room}`).appendTo(row); // Room name(id)
                $("<td></td>", {
                    style: 'color:#b2ad7f;width 25%;padding:0 0 0 10px',
                    onclick: `nexMap.display.click.denizen(${JSON.stringify(entries[i].id)});`
                }).text(`${entries[i].area.name}`).appendTo(row);
            }
        
            //print(tab[0].outerHTML);
        
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
                    onclick: 'nexMap.display.denizenTable()'
                }).text('MORE').appendTo(pagination);
            } else {
                pagination = $("<span></span>", {
                    style: 'color:Goldenrod'
                }).text(`Displaying ${entries.length} of ${entries.length}.`);
            }
        
            //print(pagination[0].outerHTML);
        },
        userCommands() {
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
                    cmd: 'nm npc <string>',
                    txt: 'Searches for NPCs matching the provided string. Displays in table format with click to go functionality.'
                },
                {
                    cmd: 'nm info',
                    txt: 'Displays the current rooms GMCP information.'
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
            //print(tab[0].outerHTML);
        },
        configDialog() {
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
                {
                    name: 'Use Sewer Grates',
                    setting: 'useSewergrates'
                },
                {
                    name: 'Use Universe Tarot',
                    setting: 'useUniverse'
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
                maxlength: 2,
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
    },
    aliases: {
        call: function (alias, args = false) {
            if (!Object.keys(nexMap.aliases).includes(alias)) {
                nexMap.display.notice(`"nm  ${alias}" is not a valid command.`);
                return;
            }
    
            nexMap.aliases[alias](args);
        },
        config: function () {
            nexMap.display.configDialog();
        },
        save: function () {
            nexMap.settings.save();
        },
        find: function (args) {
            if (!/^[a-zA-z\s]+$/g.test(args)) {
                return;
            }
            
            nexMap.display.generateTable('displayTable', nexMap.findRooms(args), args.toLowerCase());
        },
        area: function (args) {
            if (!/^[a-zA-z'-\s]+$/g.test(args)) {
                return;
            }
    
            nexMap.display.generateTable('areaTable', nexMap.findAreas(args), args);
        },
        info: function () {
            nexMap.display.notice('Room.Info');
            //print(`Name: 		${GMCP.Room.Info.name}`);
            //print(`Number: 		${GMCP.Room.Info.num}`);
            //print(`Area: 		${GMCP.Room.Info.area}`);
            //print(`Area ID: 		${GMCP.CurrentArea.id}`);
            //print(`Environment: 	${GMCP.Room.Info.environment}`);
            //print(`Coordinates: 	${GMCP.Room.Info.coords}`);
            //print(`Details: 		${GMCP.Room.Info.details}`);
        },
        goto: function (args) {
            if (/^[0-9]+$/g.test(args)) {
                cy.$(':selected').unselect()
                cy.$(`#${args}`).select()
            } else if (/^[a-zA-z'-\s]+$/g.test(args)) {
                nexMap.walker.goto(args);
            }
        },
        mark: function (args) {
            if (!/^[a-zA-z\s]+$/g.test(args)) {
                return;
            }
            nexMap.settings.addMark(args);
        },
        marks: function () {
            nexMap.display.generateTable('landmarkTable');
        },
        stop: function () {
            nexMap.walker.stop();
        },
        zoom: function (args) {
            if (!/^\d(?:.\d\d?)?$/g.test(args)) {
                return;
            }
            if(args>3)
                cy.zoom(3);
            else if (args<0.2)
                cy.zoom(0.2);
            else
                cy.zoom(parseFloat(args));
        },
        fit: function () {
            cy.fit();
        },
        refresh: function () {
            nexMap.styles.refresh();
        },
        wormholes: function () {
            nexMap.settings.toggle('useWormholes');
        },
        clouds: function () {
            nexMap.settings.toggle('useDuanathar');
            nexMap.settings.toggle('useDuanatharan');
        },
        walkto: function() {
            
        },
        npc: function(text) {
            let qry = text.toLowerCase();
            let table = async function(rr) {
                let re = new RegExp(`${rr}`, 'i');
                let results = await nexMap.mongo.db.aggregate([{$match: {name:re}}, {$sort: {name:1,area:1}}]);
                nexMap.display.generateTable('denizenTable', results, qry);
            }
            table(qry);
        }
    },

    mongo: {
        entries: [],
        collect() {
            //Area filter
            if (GMCP.CurrentArea.id == null) {return;}
            // Get all denizens in the current room
            let roomDenizens = GMCP.Char.Items.List.items.filter(x => x.attrib == 'm' && !this.ignoreList.some(rx => rx.test(x.name)));// || x.attrib == 'mx');
            let newDenizens = [];
            let roamers = [];
            let curRoom = GMCP.Room.Info.num;

            if(roomDenizens.length>0) {
                for(let denizen of roomDenizens) {
                    denizen.room = [curRoom];
                    denizen.area = {name: GMCP.Room.Info.area, id: GMCP.CurrentArea.id};
                    denizen.time = Date();
                    denizen.user = {
                        id: this.user.id,
                        name: GMCP.Status.name
                    }
                    //this.entries.push(denizen);
                    this.db.updateOne({'id':denizen.id}, denizen);
                }
            }
            /*  ORIGINAL CODE FOR TRACKING ROAMERS. Commented out after I proved I am not smart and collected
                the wrong room numbers for all 15k entries. Work around will now be to UPDATE all entries with
                the correct room number as they are found. This will erase all roamers room numbers. At some point
                in the future we will reenable roaming room collection.
            
            if(roomDenizens.length>0) {
                // Remove any denizens that are already in the entries
                newDenizens = roomDenizens.filter(x => !this.entries.find(y => x.id == y.id));
                if (this.logging) {console.log('newDenizens:');console.log(newDenizens);}
                // Find denizens that already have entries, but are in a new room.
                roamers = roomDenizens.filter(x => this.entries.find(y => x.id == y.id && !y.room.includes(curRoom)));
                if (this.logging) {console.log('roamers:');console.log(roamers);}
            }
            else
                return;
    
            // Add room number and area to each denizen object
            for(let denizen of newDenizens) {
                denizen.room = [curRoom];
                denizen.area = {name: GMCP.Room.Info.area, id: GMCP.CurrentArea.id};
                denizen.time = client.Date();
                denizen.user = {
                    id: this.user.id,
                    name: GMCP.Status.name
                }
                this.entries.push(denizen);
                this.db.insertOne(denizen);           
            }
    
            for(let denizen of roamers) {
                let denizenUpdate = this.entries.find(x => x.id == denizen.id)
                denizenUpdate.room.push(curRoom);
                this.db.updateOne({id:denizenUpdate.id}, {$set:{room:denizenUpdate.room}})
            }   
            */
        },
        async startUp() {
            console.log('Mongo startup called');

            if (!Realm) {
                console.log('Mongo startup cancelled. Realm not loaded.');
                return;
            }

            this.app = new Realm.App({ id: "nexmap-izeal" });
            this.apiKey = "pE7xABGhoWjv2XvSLvON4D2oOSF8WcmEwXkLoKzE2bqlIX1HpkxQIJTLUbr0qhPw"; // Provided API key
            this.credentials = await Realm.Credentials.apiKey(this.apiKey);
            this.user = await this.app.logIn(this.credentials)
            this.user.id === this.app.currentUser.id;
            this.mongodb = this.app.currentUser.mongoClient("mongodb-atlas");
            this.db = this.mongodb.db('nexMap').collection('denizens')
            this.entries = await this.db.find({}, {projection: {area:1, attrib:1, icon:1, id:1, name:1, room:1}});
            console.log('MongoDB loaded');
            nexMap.display.notice(`Denizen database loaded with ${this.entries.length} NPC entries.`);
        },
        ignoreList: [
            /a dervish/,
            /a sharp-toothed gremlin/,
            /a chaos orb/,
            /a bloodleech/,
            /a minion of chaos/,
            /a worm/,
            /a green slime/,
            /a soulmaster/,
            /a humbug/,
            /a chimera/,
            /a bubonis/,
            /a chaos storm/,
            /a chaos hound/,
            /a withered crone/,
            /a pathfinder/,
            /a doppleganger/,
            /an ethereal firelord/,
            /a simpering sycophant/,
            /a water weird/,
            /an eldritch abomination/,
            /Khaseem/,
            /a guardian angel/,
            /a diminutive homunculus/,
            /a Baalzadeen/,
            /shipmate/,
            /a squad of/,
            /swashbuckler/,
            /a red admiral butterfly/
        ]
    }
};
// Had to populate stylesheet array outside of the nexMap object. Using the object properties as
// part of the array was causing issues with how Javascript loads Objects on declaration.
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
        "shape": nexMap?.settings?.userPreferences?.currentRoomShape,
        "border-color": nexMap?.settings?.userPreferences?.currentRoomColor,
        "border-width": "2px"
    }
}
];

/* PUSHING UPDATES TO THE NXS FILE DIRECTLY
reflex_find_by_name('function', 'onLoad', false, false, 'nexMap').code = `GMCP.Room = {};
GMCP.Char = {
    Items: {}
};
$.getScript("https://unpkg.com/realm-web@1.2.0/dist/bundle.iife.js");
$.getScript('https://cdn.jsdelivr.net/gh/Log-Wall/nexMap/nexMap.min.js');
console.log('called nexMap CDN');
reflex_disable(reflex_find_by_name(\"group\", \"Aliases\", false, false, \"nexMap\"));
reflex_disable(reflex_find_by_name(\"group\", \"Triggers\", false, false, \"nexMap\"));`

reflex_create(client.packages[client.packages.findIndex(e => e.name == 'nexmap')].items[5],null,'trigger','nexmap')

client.packages[client.packages.findIndex(e => e.name == 'nexmap')]


if (typeof reflex_find_by_name("trigger", "New Tarot", false, false, "nexMap") === 'undefined') {
    reflex_create(client.packages[client.packages.findIndex(e => e.name == 'nexmap')].items[5],'New Tarot','trigger','nexmap');
    Object.assign(reflex_find_by_name("trigger", "New Tarot", false, false, "nexMap"), {
        matching: 'exact',
        text: 'A shimmering, translucent image rises up before you, its glittering surface displaying the verdant grasslands, soaring mountains, sprawling settlements and deep blue seas of Sapience.',
        actions: [JSON.parse("{\"action\":\"script\",\"script\":\"if (nexMap.walker.universeTarget) {\\n\\tnexusclient.send_commands(`queue addclear eqbal touch ${nexMap.walker.universeTarget}`);\\n    nexMap.walker.universeTarget = false;\\n}\"}")]
    });
}
reflex_find_by_name("trigger", "Universe Tarot", false, false, "nexMap").matching = 'exact';
reflex_find_by_name("trigger", "Universe Tarot", false, false, "nexMap").actions = [JSON.parse("{\"action\":\"script\",\"script\":\"if (nexMap.walker.universeTarget) {\\n\\tnexusclient.send_commands(`queue addclear eqbal touch ${nexMap.walker.universeTarget}`);\\n    nexMap.walker.universeTarget = false;\\n}\"}")]
"{\"action\":\"script\",\"script\":\"if (nexMap.walker.universeTarget) {\\n\\tnexusclient.send_commands(`queue addclear eqbal touch ${nexMap.walker.universeTarget}`);\\n    nexMap.walker.universeTarget = false;\\n}\"}"
*/