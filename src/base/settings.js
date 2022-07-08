/* global cy, nexusclient */
import { nexmap } from './nexmap.js';
import { notice, generateTable } from './display.js';

if (typeof nexusclient === 'undefined') {
  window.nexusclient = {
    _variables: {
      get: () => { return false; }
    },
    variables() {
      return this._variables;
    },
    settings() {
      return {
        echo_input: true
      }
    },
    add_html_line(args) {
      console.log(`add_html_line(): ${args}`)
      document.getElementById('htmlTest').innerHTML += args;
    },
    send_commands(args) {
      console.log(`send_commands(): ${args}`)
    }
  }
}


export const userPreferences = {
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
}

export const save = () => {
  userPreferences.initialConfiguration = nexmap.version;
  nexusclient.variables().set('nexMapConfigs', userPreferences);
}

export const toggleWormholes= () => {
  if (userPreferences.useWormholes) {
          nexmap.wormholes.restore();
  } else {
          nexmap.wormholes.remove(); 
  }
}

export const toggleSewergrates = () => {
  if (userPreferences.useSewergrates) {
   nexmap.sewergrates.restore();
  } else {
    nexmap.sewergrates.remove(); 
  }
}

export const toggle = (seting) => {
  if (userPreferences[seting])
      userPreferences[seting] = false;
  else
      userPreferences[seting] = true;

  if (seting === 'useWormholes')
      toggleWormholes();
  else if (seting === 'useSewergrates')
      toggleSewergrates(); 

  save();
}

export const addMark = (str) => {
  if (userPreferences.landmarks.find(e => e.name.toLowerCase() === str.toLowerCase())) {
      notice(`Landmark already exits for "${str}". Please remove existing landmark first.`);
      generateTable('landmarkTable', [userPreferences.landmarks.find(e => e.name.toLowerCase() === str.toLowerCase())], str);
      return;
  }

  let newMark = {}
  newMark.name = str;
  newMark.roomID = cy.$('.currentRoom').data('id');

  userPreferences.landmarks.push(newMark);
  notice(`Added landmark "${str}"`);
  save();
}

export const removeMark = (name) => {
  let i = userPreferences.landmarks.findIndex(e => e.name.toLowerCase() === name.toLowerCase());

  userPreferences.landmarks.splice(i, 1);
  notice(`Removed landmark for "${name}"`);
}