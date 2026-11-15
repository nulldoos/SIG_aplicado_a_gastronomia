
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapPlaceholder({ selectedPlace, places = [] }) {
  console.log('Estabelecimentos recebidos no mapa:', places)

  const placesWithCoordinates = places.filter(
    (place) =>
      place.latitude !== null &&
      place.longitude !== null &&
      Number.isFinite(place.latitude) &&
      Number.isFinite(place.longitude)
  )

  const initialCenter = placesWithCoordinates.length > 0
    ? [
        placesWithCoordinates[0].latitude,
        placesWithCoordinates[0].longitude,
      ]
    : [-19.0, -57.0]

  return (
    <div className="map-canvas">
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {placesWithCoordinates.map((place) => {
          const isSelected = selectedPlace?.id === place.id

          return (
            <CircleMarker
              key={place.id}
              center={[place.latitude, place.longitude]}
              radius={isSelected ? 11 : 8}
              pathOptions={{
                color: '#f97316',
                fillColor: '#f97316',
                fillOpacity: isSelected ? 1 : 0.85,
                weight: isSelected ? 4 : 2,
              }}
            >
              <Popup>
                <strong>{place.name}</strong>
                <br />
                {place.category}
                <br />
                {place.address}

                {place.fonte && (
                  <>
                    <br />
                    <small>Fonte: {place.fonte}</small>
                  </>
                )}
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
