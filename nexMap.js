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

var nexMap.findRoom = function(roomNum) {
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

var nexMap.changeRoom = function(id) {
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
