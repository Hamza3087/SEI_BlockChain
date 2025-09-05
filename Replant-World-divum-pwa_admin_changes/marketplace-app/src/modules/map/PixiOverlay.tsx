import { useMap, useMapEvents } from 'react-leaflet';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Container } from 'pixi.js';
import L from 'leaflet';
import 'leaflet-pixi-overlay';
import { SelectedTreeContext, usePixiMap } from './hooks';
import { buildSpritesPool, loadTexture } from './spritesPool';
import { SelectedTree } from './SelectedTree';
import { TreePoint } from './types';

export function PixiOverlay(props: PropsWithChildren) {
  const [selectedTree, setSelectedTree] = useState<TreePoint | null>(null);

  const map = useMap();

  const pixiMap = usePixiMap();

  // Tracking drag to prevent clicking markers while dragging.
  useMapEvents({
    dragstart: () => {
      pixiMap.isDragging = true;
    },
    dragend: () => {
      pixiMap.isDragging = false;
    },
  });

  useEffect(() => {
    function draw(utils: any) {
      pixiMap.utils = utils;

      const container = utils.getContainer();
      container.visible = map.getZoom() > 16;

      utils.getRenderer().render(container);
    }

    const pixiContainer = new Container();
    pixiContainer.sortableChildren = true;

    loadTexture();
    buildSpritesPool(pixiContainer);

    pixiMap.container = pixiContainer;
    const overlay = (L as any).pixiOverlay(draw, pixiContainer, {
      shouldRedrawOnMove: () => true,
    });

    overlay.addTo(map);

    return () => {
      pixiContainer.removeChildren();
    };
  }, [map, pixiMap]);

  return (
    <SelectedTreeContext.Provider value={{ selectedTree, setSelectedTree }}>
      {selectedTree && <SelectedTree tree={selectedTree} />}
      {props.children}
    </SelectedTreeContext.Provider>
  );
}
