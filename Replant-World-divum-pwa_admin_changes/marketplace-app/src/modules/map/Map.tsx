import { LayersControl, MapContainer, TileLayer } from 'react-leaflet';
import { HomeButton } from './HomeButton';
import { MapMarkers } from './MapMarkers';
import { PixiOverlay } from './PixiOverlay';
import { PixiOverlayContext } from './PixiOverlayContext';

export function Map() {
  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      minZoom={2}
      scrollWheelZoom={true}
      style={{ height: '100dvh' }}
      maxBounds={[
        [-90, -180],
        [90, 180],
      ]}
    >
      <HomeButton />
      <LayersControl position='bottomleft'>
        <LayersControl.BaseLayer name='Streets'>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name='Satellite' checked>
          <TileLayer
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">MapBox</a> &copy; <a href="http://www.openstreetmap.org/about/">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback"><b>Improve this map</b></a>'
            url='https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.webp?access_token=pk.eyJ1IjoicGhpbGlwZGlja2Vuc29uIiwiYSI6ImNsdXI0bHNxOTA0NW4ycW1vdzd1a25kZnkifQ.RbohcnvVovQHF1OGNooCvg'
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <PixiOverlayContext>
        <PixiOverlay>
          <MapMarkers />
        </PixiOverlay>
      </PixiOverlayContext>
    </MapContainer>
  );
}
