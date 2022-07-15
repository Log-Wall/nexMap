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

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Dialog, {
    open: open,
    onClose: handleClickClose
  }, /*#__PURE__*/React.createElement(DialogTitle, null, "Nexmap Configuration Options"), /*#__PURE__*/React.createElement(DialogContent, null, /*#__PURE__*/React.createElement(FormGroup, null, /*#__PURE__*/React.createElement(FormControlLabel, {
    control: /*#__PURE__*/React.createElement(Switch, {
      id: "useWormholes",
      onChange: handleCheck,
      defaultChecked: settings.useWormholes
    }),
    label: "Use Wormholes",
    labelPlacement: "end"
  }), /*#__PURE__*/React.createElement(FormControlLabel, {
    control: /*#__PURE__*/React.createElement(Switch, {
      id: "useSewergrates",
      onChange: handleCheck,
      defaultChecked: settings.useSewergrates
    }),
    label: "Use Sewer Grates",
    labelPlacement: "end"
  }), /*#__PURE__*/React.createElement(FormControlLabel, {
    control: /*#__PURE__*/React.createElement(Switch, {
      id: "useUniverse",
      onChange: handleCheck,
      defaultChecked: settings.useUniverse
    }),
    label: "Use Universe Tarot",
    labelPlacement: "end"
  }), /*#__PURE__*/React.createElement(FormControlLabel, {
    control: /*#__PURE__*/React.createElement(Switch, {
      id: "vibratingStick",
      onChange: handleCheck,
      defaultChecked: settings.vibratingStick
    }),
    label: "Vibrating Stick",
    labelPlacement: "end"
  }), /*#__PURE__*/React.createElement(FormControlLabel, {
    control: /*#__PURE__*/React.createElement(Switch, {
      id: "useDuanathar",
      onChange: handleCheck,
      defaultChecked: settings.useDuanathar
    }),
    label: "Eagle Wings",
    labelPlacement: "end"
  }), /*#__PURE__*/React.createElement(FormControlLabel, {
    control: /*#__PURE__*/React.createElement(Switch, {
      id: "useDuanatharan",
      onChange: handleCheck,
      defaultChecked: settings.useDuanatharan
    }),
    label: "Atavian Wings",
    labelPlacement: "end"
  }), /*#__PURE__*/React.createElement(FormControlLabel, {
    control: /*#__PURE__*/React.createElement(TextField, {
      id: "commandSeparator",
      onChange: handleText,
      defaultValue: settings.commandSeparator,
      size: "small",
      style: {
        width: '10em'
      }
    }),
    label: "Command Separator",
    labelPlacement: "start"
  }), /*#__PURE__*/React.createElement(FormControlLabel, {
    control: /*#__PURE__*/React.createElement(TextField, {
      id: "duanatharCommand",
      onChange: handleText,
      defaultValue: settings.duanatharCommand,
      size: "small",
      style: {
        width: '10em'
      }
    }),
    label: "Eagle Wings Command(s) ",
    labelPlacement: "start"
  }), /*#__PURE__*/React.createElement(FormControlLabel, {
    control: /*#__PURE__*/React.createElement(TextField, {
      id: "duanatharanCommand",
      onChange: handleText,
      defaultValue: settings.duanatharanCommand,
      size: "small",
      style: {
        width: '10em'
      }
    }),
    label: "Atavian Wing Command(s) ",
    labelPlacement: "start"
  }))), /*#__PURE__*/React.createElement(DialogActions, null, /*#__PURE__*/React.createElement(Button, {
    onClick: handleClickClose
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    onClick: handleClickSave
  }, "Save"))));
}

export default NexDialog;