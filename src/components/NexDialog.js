import * as React from 'react';
import { DialogContent, DialogTitle, FormControlLabel, FormGroup, Switch, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const NexDialog = ({evt, settings}) => {
  const [open, setOpen] = React.useState(false);
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
    <ThemeProvider theme={darkTheme}>
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
          <FormControlLabel control={<TextField id="commandSeparator" onChange={handleText} defaultValue={settings.commandSeparator} size="small" style={{width: '10em'}} />} label="Command Separator" labelPlacement="end"/>
          <FormControlLabel control={<TextField id="duanatharCommand" onChange={handleText} defaultValue={settings.duanatharCommand} size="small" style={{width: '10em'}}/>} label="Eagle Wings Command(s) " labelPlacement="end"/>
          <FormControlLabel control={<TextField id="duanatharanCommand" onChange={handleText} defaultValue={settings.duanatharanCommand} size="small" style={{width: '10em'}}/>} label="Atavian Wing Command(s) " labelPlacement="end"/>
        </FormGroup>
      </DialogContent>
      <DialogActions>
          <Button onClick={handleClickClose}>Cancel</Button>
          <Button onClick={handleClickSave}>Save</Button>
      </DialogActions>
    </Dialog>
    </div>
    </ThemeProvider>
  )
}

export default NexDialog;