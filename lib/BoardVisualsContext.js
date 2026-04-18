import { createContext, useContext } from 'react';

export const BoardVisualsContext = createContext({
  pieceSet: 'cburnett',
  boardTheme: 'brown',
  uiStyle: 'dojo-classic',
  setBoardVisuals: () => {},
});

export function useBoardVisuals() {
  return useContext(BoardVisualsContext);
}
