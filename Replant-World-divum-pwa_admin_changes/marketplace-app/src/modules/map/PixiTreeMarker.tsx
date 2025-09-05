import { memo, useEffect, useRef } from 'react';
import { FederatedPointerEvent, Sprite } from 'pixi.js';
import { usePixiMap, useSelectedTree } from './hooks';
import { getSpriteFromPool, returnSpriteToPool } from './spritesPool';
import {
  PIN_SCALE,
  PIN_SCALE_SELECTED,
  PIN_TINT_HOVER,
  PIN_TINT,
  PIN_TINT_SELECTED,
} from './const';
import { TreePoint } from './types';

export type PixiTreeMarkerProps = {
  tree: TreePoint;
};

function _PixiTreeMarker({ tree }: PixiTreeMarkerProps) {
  const spriteRef = useRef<Sprite | null>(null);

  const pixiMap = usePixiMap();
  const { setSelectedTree, selectedTree } = useSelectedTree();

  useEffect(() => {
    function selectSprite(sprite: Sprite) {
      sprite.tint = PIN_TINT_SELECTED;
      sprite.zIndex = 10;
      sprite.scale.set(PIN_SCALE_SELECTED);
      pixiMap.selectedSprite = sprite;
    }

    function deselectSprite(sprite: Sprite) {
      sprite.scale.set(PIN_SCALE);
      sprite.tint = PIN_TINT;
      sprite.zIndex = 0;
    }

    function onClick(event: FederatedPointerEvent) {
      if (pixiMap.isDragging) {
        return;
      }
      if (pixiMap.selectedSprite) {
        deselectSprite(pixiMap.selectedSprite);
      }
      const sprite = event.target as Sprite;
      selectSprite(sprite);
      setSelectedTree(tree);
      pixiMap.render();
    }

    function onEnter(event: FederatedPointerEvent) {
      const sprite = event.target as Sprite;
      if (sprite !== pixiMap.selectedSprite) {
        sprite.tint = PIN_TINT_HOVER;
        pixiMap.render();
      }
    }

    function onLeave(event: FederatedPointerEvent) {
      const sprite = event.target as Sprite;
      if (sprite !== pixiMap.selectedSprite) {
        sprite.tint = PIN_TINT;
        pixiMap.render();
      }
    }

    if (!pixiMap.container || !pixiMap.utils) {
      return;
    }

    const sprite = getSpriteFromPool(pixiMap.container);
    sprite.position = pixiMap.utils.latLngToLayerPoint([
      tree.latitude,
      tree.longitude,
    ]);
    spriteRef.current = sprite;

    if (tree.nft_id === selectedTree?.nft_id) {
      selectSprite(sprite);
    }

    sprite.on('pointerup', onClick);
    sprite.on('mouseenter', onEnter);
    sprite.on('pointerout', onLeave);

    return () => {
      const sprite = spriteRef.current;
      if (!sprite) {
        return;
      }

      sprite.off('pointerup', onClick);
      sprite.off('mouseenter', onEnter);
      sprite.off('pointerout', onLeave);
      returnSpriteToPool(sprite);
      spriteRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export const PixiTreeMarker = memo(_PixiTreeMarker);
