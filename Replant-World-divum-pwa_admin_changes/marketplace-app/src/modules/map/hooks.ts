import { createContext, useContext } from 'react';
import { Sprite, type Container } from 'pixi.js';
import { TreePoint } from './types';

export type PixiMapContextType = {
  container: Container | null;
  utils: any;
  selectedSprite: Sprite | null;
  isDragging: boolean;
  render: () => void;
};

export const PixiMapContext = createContext<PixiMapContextType>(null as any);

export function usePixiMap() {
  return useContext<PixiMapContextType>(PixiMapContext);
}

export type SelectedTreeContextType = {
  selectedTree: TreePoint | null;
  setSelectedTree: (tree: TreePoint | null) => void;
};

export const SelectedTreeContext = createContext<SelectedTreeContextType>(
  null as any
);

export function useSelectedTree() {
  return useContext<SelectedTreeContextType>(SelectedTreeContext);
}
