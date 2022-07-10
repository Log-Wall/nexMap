import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Switch, DialogContent, DialogTitle, FormControlLabel, FormGroup, TextField } from '@mui/material';


class NexDialogClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tempSettings: this.props.settings,
      open: true,
    };
    props.evt.addEventListener('nexmap-config-dialog', ({detail}) => {this.setState({open: detail});});
    console.log(this.state);
  }

  handleClickClose() {
    this.setState({open: false});
  }

  handleClickSave() {
    window.nexmap.settings.userPreferences = {...this.state.tempSettings};
    //window.nexmap.settings.save();
    this.setState({open: false});
  }
  
  handleCheck(e) {
    let name = e.target.id;

    this.setState({tempSettings: {...this.state.tempSettings, [name]: !this.state.tempSettings[name]}});
  }

  handleText(e) {
    let val = e.target.value;
    let name = e.target.id;
    this.setState({tempSettings: {...this.state.tempSettings, [name]: val}});
  }

  render() {
    return (
      <div>
      <Dialog open={this.state.open} onClose={this.handleClickClose}>
        <DialogTitle>
          Nexmap Configuration Options
        </DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel control={<Switch id="useWormholes" onChange={this.handleCheck.bind(this)} defaultChecked={this.state.tempSettings.useWormholes}/>} label="Use Wormholes" labelPlacement="end"/>
            <FormControlLabel control={<Switch id="useSewergrates" onChange={this.handleCheck.bind(this)} defaultChecked={this.state.tempSettings.useSewergrates}/>} label="Use Sewer Grates" labelPlacement="end"/>
            <FormControlLabel control={<Switch id="useUniverse" onChange={this.handleCheck.bind(this)} defaultChecked={this.state.tempSettings.useUniverse}/>} label="Use Universe Tarot" labelPlacement="end"/>
            <FormControlLabel control={<Switch id="vibratingStick" onChange={this.handleCheck.bind(this)} defaultChecked={this.state.tempSettings.vibratingStick}/>} label="Vibrating Stick" labelPlacement="end"/>
            <FormControlLabel control={<Switch id="useDuanathar" onChange={this.handleCheck.bind(this)} defaultChecked={this.state.tempSettings.useDuanathar}/>} label="Eagle Wings" labelPlacement="end"/>
            <FormControlLabel control={<Switch id="useDuanatharan" onChange={this.handleCheck.bind(this)} defaultChecked={this.state.tempSettings.useDuanatharan}/>} label="Atavian Wings" labelPlacement="end"/>
            <FormControlLabel control={<TextField id="commandSeparator" onChange={this.handleText.bind(this)} defaultValue={this.state.tempSettings.commandSeparator} size="small" style={{width: '10em'}} />} label="Command Separator" labelPlacement="start"/>
            <FormControlLabel control={<TextField id="duanatharCommand" onChange={this.handleText.bind(this)} defaultValue={this.state.tempSettings.duanatharCommand} size="small" style={{width: '10em'}}/>} label="Eagle Wings Command(s) " labelPlacement="start"/>
            <FormControlLabel control={<TextField id="duanatharanCommand" onChange={this.handleText.bind(this)} defaultValue={this.state.tempSettings.duanatharanCommand} size="small" style={{width: '10em'}}/>} label="Atavian Wing Command(s) " labelPlacement="start"/>
          </FormGroup>
        </DialogContent>
        <DialogActions>
            <Button onClick={this.handleClickClose.bind(this)}>Cancel</Button>
            <Button onClick={this.handleClickSave.bind(this)}>Save</Button>
        </DialogActions>
      </Dialog>
      </div>
    )
  }
}

export default NexDialogClass;