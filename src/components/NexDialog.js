/* global nexusclient */

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Switch, DialogContent, DialogTitle, FormControlLabel, FormGroup, TextField } from '@mui/material';
const React = nexusclient.platform().React;

const NexDialog = ({evt, settings}) => {
  console.log('NexDialog: evt');
  console.log(evt);
  console.log('NexDialog: settings');
  console.log(settings);
  const [open, setOpen] = React.useState(false);
  console.log('NexDialog: open')
  console.log(open)
  const [tempSettings, setTempSettings] = React.useState(settings);

  evt.addEventListener('nexmap-config-dialog', ({detail}) => {setOpen(detail)})

  const handleClickClose = () => {
    setOpen(false);
  }

  const handleClickSave =  () => {
    window.nexmap.settings.userPreferences = {...tempSettings};
    window.nexmap.settings.save();
    setOpen(false);
  }
  
  const handleCheck = (e) => {
    let name = e.target.id;
    setTempSettings({...tempSettings, [name]: !tempSettings[name]});
  }

  const handleText = (e) => {
    let val = e.target.value;
    let name = e.target.id;
    setTempSettings({...tempSettings, [name]: val});
  }

  return (
    <div>
    <Dialog open={open} onClose={handleClickClose}>
      <DialogTitle>
        Nexmap Configuration Options
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel control={<Switch id="useWormholes" onChange={handleCheck} defaultChecked={settings.useWormholes}/>} label="Use Wormholes" labelPlacement="end"/>
          <FormControlLabel control={<Switch id="useSewergrates" onChange={handleCheck} defaultChecked={settings.useSewergrates}/>} label="Use Sewer Grates" labelPlacement="end"/>
          <FormControlLabel control={<Switch id="useUniverse" onChange={handleCheck} defaultChecked={settings.useUniverse}/>} label="Use Universe Tarot" labelPlacement="end"/>
          <FormControlLabel control={<Switch id="vibratingStick" onChange={handleCheck} defaultChecked={settings.vibratingStick}/>} label="Vibrating Stick" labelPlacement="end"/>
          <FormControlLabel control={<Switch id="useDuanathar" onChange={handleCheck} defaultChecked={settings.useDuanathar}/>} label="Eagle Wings" labelPlacement="end"/>
          <FormControlLabel control={<Switch id="useDuanatharan" onChange={handleCheck} defaultChecked={settings.useDuanatharan}/>} label="Atavian Wings" labelPlacement="end"/>
          <FormControlLabel control={<TextField id="commandSeparator" onChange={handleText} defaultValue={settings.commandSeparator} size="small" style={{width: '10em'}} />} label="Command Separator" labelPlacement="start"/>
          <FormControlLabel control={<TextField id="duanatharCommand" onChange={handleText} defaultValue={settings.duanatharCommand} size="small" style={{width: '10em'}}/>} label="Eagle Wings Command(s) " labelPlacement="start"/>
          <FormControlLabel control={<TextField id="duanatharanCommand" onChange={handleText} defaultValue={settings.duanatharanCommand} size="small" style={{width: '10em'}}/>} label="Atavian Wing Command(s) " labelPlacement="start"/>
        </FormGroup>
      </DialogContent>
      <DialogActions>
          <Button onClick={handleClickClose}>Cancel</Button>
          <Button onClick={handleClickSave}>Save</Button>
      </DialogActions>
    </Dialog>
    </div>
  )
}

export default NexDialog;