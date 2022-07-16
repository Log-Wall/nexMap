import { TestState } from "./components/TestState";

export const nexmap = {
  evt: new EventTarget(),
  components: {
    Nexmap: TestState,
  },
}

window.nexmap = nexmap;