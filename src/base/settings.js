/* global cy, get_variable, set_variable */
import { nexmap } from './nexmap.js';
import { notice, generateTable } from './display.js';

const get_variable = () => { return false; }

export const userPreferences = {
  intialConfiguration: get_variable('nexMapConfigs')?.initialConfiguration || 0,
  commandSeparator: get_variable('nexMapConfigs')?.commandSeparator || '\\',
  useDuanathar: get_variable('nexMapConfigs')?.useDuanathar || false,
  useDuanatharan: get_variable('nexMapConfigs')?.useDuanatharan || false,
  duanatharCommand: get_variable('nexMapConfigs')?.duanatharCommand || 'say duanathar',
  duanatharanCommand: get_variable('nexMapConfigs')?.duanatharanCommand || 'say duanatharan',
  useSewergrates: get_variable('nexMapConfigs')?.useSewergrates || false,
  useWormholes: get_variable('nexMapConfigs')?.useWormholes || false,
  useUniverse: get_variable('nexMapConfigs')?.useUniverse || false,
  vibratingStick: get_variable('nexMapConfigs')?.vibratingStick || false,
  displayWormholes: get_variable('nexMapConfigs')?.displayWormholes || false,
  currentRoomShape: get_variable('nexMapConfigs')?.currentRoomShape || 'rectangle',
  currentRoomColor: get_variable('nexMapConfigs')?.currentRoomColor || '#ff1493',
  labelDisplay: get_variable('nexMapConfigs')?.labelDisplay || 'name',
  landmarks: get_variable('nexMapConfigs')?.landmarks || [],
  antiWingAreas: get_variable('nexMapConfigs')?.antiWingAreas || [],
  antiGareAreas: get_variable('nexMapConfigs')?.antiGareAreas || [],
  antiUniverseAreas: get_variable('nexMapConfigs')?.antiUniverseAreas || []
}

export const save = () => {
  userPreferences.initialConfiguration = nexmap.version;
  set_variable('nexMapConfigs', userPreferences);
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