/* global GMCP */
import { notice } from "./display.js";
import * as Realm from "realm-web";

export let denizenEntries = [];
export let shrineEntries = [];
export let db = {};
let user = {};
const logging = false;

export const collectDenizens = async () => {
    //Area filter
    if (GMCP.CurrentArea.id == null) { return; }

    // Get all denizens in the current room
    let roomDenizens = GMCP.Char.Items.List.items.filter(x => x.attrib === 'm' && !ignoreList.some(rx => rx.test(x.name)));// || x.attrib == 'mx');
    if (roomDenizens.length === 0) { return; }
    
    let newDenizens = [];
    let roamers = [];
    let curRoom = GMCP.Room.Info.num;

    // Remove any denizens that are already in the entries
    newDenizens = roomDenizens.filter(x => !denizenEntries.find(y => x.id === y.id));
    if (logging) { console.log('newDenizens:');console.log(newDenizens); }
    
    // Find denizens that already have entries, but are in a new room.
    roamers = roomDenizens.filter(x => denizenEntries.find(y => x.id === y.id && !y.room.includes(curRoom)));
    if (logging) { console.log('roamers:');console.log(roamers); }

    db.collectionName = 'denizens';
    for(let denizen of newDenizens) {
        denizen.id = parseInt(denizen.id);
        denizen.room = [curRoom];
        denizen.area = {name: GMCP.Room.Info.area, id: GMCP.CurrentArea.id};
        denizen.time = window.Date();
        denizen.user = {
            id: user.id,
            name: GMCP.Status.name
        }
        denizenEntries.push({id: denizen.id, room: denizen.room});
        await db.insertOne(denizen);           
    }

    for(let denizen of roamers) {
        denizenEntries.find(e => e.id === denizen.id).rooom = [curRoom];
        await db.updateOne({id:denizen.id}, {$set:{room:[curRoom], id:parseInt(denizen.id)}})
    }   
    /*  ORIGINAL CODE FOR TRACKING ROAMERS. Commented out after I proved I am not smart and collected
        the wrong room numbers for all 15k entries. Work around will now be to UPDATE all entries with
        the correct room number as they are found. This will erase all roamers room numbers. At some point
        in the future we will reenable roaming room collection.
        for(let denizen of roamers) {
            let denizenUpdate = this.entries.find(x => x.id == denizen.id)
            denizenUpdate.room.push(curRoom);
            this.db.updateOne({id:denizenUpdate.id}, {$set:{room:denizenUpdate.room}})
        }
    } */   
}

export const collectShrines = async () => {
    //Area filter
    if (GMCP.CurrentArea.id == null) { return; }

    // Get all denizens in the current room
    let roomShrine = GMCP.Char.Items.List.items.find(x => x.icon === 'shrine');
    let existingShrine = shrineEntries.find(e => e.room === GMCP.Room.Info.num);

    // There is no shrine here, and there never was.
    if (!roomShrine && !roomShrine) { return; }
    
    // Set to work with the shrines collection. All other conditions will interact with Mongo.
    db.collectionName = 'shrines';

    // There used to be a shrine here, but now it is gone.
    if (existingShrine && !roomShrine) {
        await db.deleteOne({"room": existingShrine.room});
        return;
    }

    // The shrine already on record is still here. Nothing to do here.
    if (existingShrine?.id === roomShrine.id) { return; }

    roomShrine.id = parseInt(roomShrine.id);
    roomShrine.room = GMCP.Room.Info.num;
    roomShrine.area = {name: GMCP.Room.Info.area, id: parseInt(GMCP.CurrentArea.id)};
    roomShrine.time = window.Date();
    roomShrine.user = {
        id: user.id,
        name: GMCP.Status.name
    }

    // There used to be a shrine here, but it was replaced with a different one.
    // Update local entry with the new ID or add a new entry to the local array. 
    if (existingShrine && existingShrine?.id !== roomShrine.id) {
        existingShrine.id = roomShrine.id;
    } else {
        shrineEntries.push({id: roomShrine.id, room: roomShrine.room});
    }

    // We know there is either a new shrine to be added, or the existing shrine changed. Upsert to mongo.
    await db.updateOne({"room": GMCP.Room.Info.num}, roomShrine, {upsert:true});  
    return true;   
}

export const initialize = async () => {
    console.log('Mongo startup called');

    if (!Realm) {
        console.log('Mongo startup cancelled. Realm not loaded.');
        return;
    }

    const app = new Realm.App({ id: "nexmap-izeal" });
    const apiKey = "pE7xABGhoWjv2XvSLvON4D2oOSF8WcmEwXkLoKzE2bqlIX1HpkxQIJTLUbr0qhPw"; // Provided API key
    const credentials = await Realm.Credentials.apiKey(apiKey);
    user = await app.logIn(credentials)
    user.id = app.currentUser.id;
    const mongodb = app.currentUser.mongoClient("mongodb-atlas");
    db = mongodb.db('nexMap').collection('denizens')
    denizenEntries = await db.find({}, {projection: {_id: 0, id: 1, room: 1}});
    db.collectionName = 'shrines';
    shrineEntries = await db.find({}, {projection: {_id: 0, id: 1, room: 1}});
    console.log('MongoDB loaded');
    notice(`Denizen database loaded with ${denizenEntries.length} NPC entries.`);
}

export const ignoreList = [
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
    /a red admiral butterfly/,
    /a baby rat/,
    /a young rat/,
    /a rat/,
    /an old rat/,
    /a black rat/
]