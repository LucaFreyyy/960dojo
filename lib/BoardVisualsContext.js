import { createContext, useContext } from 'react';

export const BoardVisualsContext = createContext({
  pieceSet: 'cburnett',
  boardTheme: 'brown',
  setBoardVisuals: () => {},
});

export function useBoardVisuals() {
  return useContext(BoardVisualsContext);
}
