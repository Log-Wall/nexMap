/* global nexusclient, React */
import Button from '@mui/material/Button';

export const TestState = () => {
  const [open, setOpen] = nexusclient.platform().React.useState(false);

  return (
    <div>
      Hello, my name is {open}
      <Button>Rawr</Button>
    </div>
  );
}