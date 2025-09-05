/**
 * This module optimizes creating tree markers by preallocating a buffer (pool) of sprites. That way, when we have to display a few thousands of markers, we don't have to create all of them in a single tick which is a very expensive operation. Instead, we use the preallocated sprites. It's a technique taken from gamedev - objects pooling.
 */

import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { PIN_SCALE, PIN_TINT } from './const';

const POOL_SIZE = 5_000;

const SPRITES_PER_TICK = 10;

const SPRITES_POOL: Sprite[] = [];

let TEXTURE: Texture | null = null;

export async function loadTexture() {
  TEXTURE = await Assets.load(getDefaultIcon());
}

export async function buildSpritesPool(container: Container) {
  loadTexture();
  while (SPRITES_POOL.length < POOL_SIZE) {
    const promise = new Promise<void>((resolve) => {
      setTimeout(() => {
        extendSpritesPool(container);
        resolve();
      });
    });
    await promise;
  }
}

export function getSpriteFromPool(container: Container): Sprite {
  if (!SPRITES_POOL.length) {
    extendSpritesPool(container, 100);
  }
  const sprite = SPRITES_POOL.pop()!;
  return sprite;
}

export function returnSpriteToPool(sprite: Sprite) {
  sprite.scale.set(PIN_SCALE);
  sprite.tint = PIN_TINT;
  SPRITES_POOL.push(sprite);
}

function extendSpritesPool(container: Container, quantity = SPRITES_PER_TICK) {
  for (let i = 0; i < quantity; i++) {
    const sprite = new Sprite(TEXTURE!);
    sprite.anchor.set(0.5, 1);
    sprite.scale.set(PIN_SCALE);
    sprite.cursor = 'crosshair';
    sprite.tint = PIN_TINT;
    sprite.eventMode = 'static';
    container.addChild(sprite);
    SPRITES_POOL.push(sprite);
  }
}

function getDefaultIcon() {
  const svgIcon = `<svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_1279_3554)"> <path d="M14.1425 7.07184C14.1425 3.1657 10.9768 0 7.07184 0C3.16686 0 0 3.1657 0 7.07184C0 10.4705 2.39861 13.3082 5.59444 13.9873V18.5678C5.59444 19.3592 6.23523 20 7.02665 20H7.13326C7.92468 20 8.56547 19.3592 8.56547 18.5678V13.9826C11.7532 13.2966 14.1425 10.4635 14.1425 7.07068V7.07184Z" fill="#1D3E32"/> <path d="M7.07226 0.853271C3.62498 0.853271 0.830078 3.64817 0.830078 7.09661C0.830078 10.2832 3.21942 12.9112 6.30401 13.2901L6.47087 11.5636L4.37585 9.03983L6.54155 10.837L7.06994 5.35849L7.50447 9.78838L9.98419 7.73044L7.58674 10.6192L7.84862 13.2901C10.9309 12.9089 13.3179 10.282 13.3179 7.09661C13.3179 3.64933 10.523 0.853271 7.07457 0.853271H7.07226Z" fill="#F7FAF4"/> <path d="M6.31543 14.0674H7.84614V18.4532C7.84614 18.875 7.50315 19.218 7.08136 19.218C6.65958 19.218 6.31659 18.875 6.31659 18.4532V14.0674H6.31543Z" fill="#F7FAF4"/> </g> <defs> <clipPath id="clip0_1279_3554"> <rect width="14.1425" height="20" fill="white"/> </clipPath> </defs> </svg>
  `;
  return getEncodedIcon(svgIcon);
}

function getEncodedIcon(svg: string) {
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}
