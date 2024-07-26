import { create } from "zustand";

interface CascaderState {
  _LABEL: string;
  _VALUE: string;
  _CHILDREN: string;
  virtualHeight: number;
}

const initialState: CascaderState = {
  _LABEL: 'label',
  _VALUE: 'value',
  _CHILDREN: 'children',
  virtualHeight: 200,
}

const useCascaderStore = create(() => ({
  ...initialState
}))

export default useCascaderStore;