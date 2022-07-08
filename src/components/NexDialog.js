import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';


export default function NexDialog({controller}) {
  const [open, setOpen] = controller();

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleClickClose = () => {
    setOpen(false);
  }

  return (
    <div>
    <Dialog
      open={open}
      onClose={handleClickClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      'Hello this is a test'
      <DialogActions>
          <Button onClick={handleClickClose}>Cancel</Button>
          <Button onClick={handleClickClose}>Subscribe</Button>
      </DialogActions>
    </Dialog>
    </div>
  )
}