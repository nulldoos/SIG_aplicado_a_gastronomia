
import { useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Controla o movimento do mapa e a abertura do popup
function MapController({ selectedPlace, markerRefs }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedPlace) return

    const marker = markerRefs.current[String(selectedPlace.id)]

    if (!marker) return

    const latitude = Number(selectedPlace.latitude)
    const longitude = Number(selectedPlace.longitude)

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return
    }

    // Centraliza o mapa no estabelecimento selecionado
    map.flyTo(
      [latitude, longitude],
      16,
      {
        animate: true,
        duration: 1,
      }
    )

    // Abre o popup do marcador
    marker.openPopup()

  }, [selectedPlace, map, markerRefs])

  return null
}

export default function MapPlaceholder({
  selectedPlace,
  places = [],
  onSelectPlace,
  
}) {
  const markerRefs = useRef({})

  // Normaliza os dados recebidos do ComêMaps e do Google
  const placesWithCoordinates = places
    .filter(
      (place) =>
        place.latitude != null &&
        place.longitude != null &&
        place.latitude !== '' &&
        place.longitude !== ''
    )
    .map((place) => ({
      ...place,
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
      name: place.name || place.nome || 'Estabelecimento sem nome',
      category: place.category || place.categoria || 'Gastronomia',
      address: place.address || place.endereco || 'Endereço não informado',
    }))
    .filter(
      (place) =>
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
        <MapController
          selectedPlace={selectedPlace}
          markerRefs={markerRefs}
        />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {placesWithCoordinates.map((place) => {
          const isSelected =
            String(selectedPlace?.id) === String(place.id)

          return (
            <CircleMarker
              ref={(marker) => {
                const id = String(place.id)

                if (marker) {
                  markerRefs.current[id] = marker
                } else {
                  delete markerRefs.current[id]
                }
              }}
              key={`${place.fonte || 'local'}-${place.id}`}
              eventHandlers={{
                click: () => {
                  onSelectPlace?.(place)
                },
              }}
              center={[
                place.latitude,
                place.longitude,
              ]}
              radius={isSelected ? 12 : 8}
              pathOptions={{
                color: isSelected ? '#7e22ce' : '#f97316',
                fillColor: isSelected ? '#7e22ce' : '#f97316',
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
