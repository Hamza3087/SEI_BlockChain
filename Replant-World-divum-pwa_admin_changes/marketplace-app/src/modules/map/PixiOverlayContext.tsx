import { PropsWithChildren } from 'react';
import { PixiMapContext, PixiMapContextType } from './hooks';

export function PixiOverlayContext(props: PropsWithChildren) {
  const pixiMapContextData: PixiMapContextType = {
    container: null,
    utils: null,
    selectedSprite: null,
    isDragging: false,
    render: function () {
      if (this.container && this.utils) {
        this.utils.getRenderer().render(this.container);
      }
    },
  };

  return (
    <PixiMapContext.Provider value={pixiMapContextData}>
      {props.children}
    </PixiMapContext.Provider>
  );
}
