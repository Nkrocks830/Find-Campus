import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { MapPin } from 'lucide-react'

const CAMPUS_CENTER = [12.9716, 77.5946] // Default: Bengaluru (customize to your campus)

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

const PRESET_LOCATIONS = [
  { name: 'Main Library', lat: 12.9720, lng: 77.5950 },
  { name: 'Student Canteen', lat: 12.9710, lng: 77.5940 },
  { name: 'Gym / Sports Complex', lat: 12.9716, lng: 77.5946 },
  { name: 'Auditorium', lat: 12.9725, lng: 77.5955 },
  { name: 'Block C Classrooms', lat: 12.9715, lng: 77.5948 },
  { name: 'Science Lab Block', lat: 12.9722, lng: 77.5952 },
  { name: 'Computer Lab', lat: 12.9714, lng: 77.5946 },
  { name: 'Main Gate', lat: 12.9705, lng: 77.5935 },
  { name: 'Hostel Block A', lat: 12.9718, lng: 77.5942 },
  { name: 'Sports Ground', lat: 12.9708, lng: 77.5938 },
  { name: 'Admin Block', lat: 12.9712, lng: 77.5943 },
]

export default function LocationPicker({ value, onChange }) {
  const [marker, setMarker] = useState(
    value?.lat ? { lat: value.lat, lng: value.lng } : null
  )
  const [locationName, setLocationName] = useState(value?.name || '')

  const handleMapClick = ({ lat, lng }) => {
    setMarker({ lat, lng })
    onChange({ lat, lng, name: locationName || 'Custom Location' })
  }

  const handlePresetSelect = (loc) => {
    setMarker({ lat: loc.lat, lng: loc.lng })
    setLocationName(loc.name)
    onChange({ lat: loc.lat, lng: loc.lng, name: loc.name })
  }

  const handleNameChange = (name) => {
    setLocationName(name)
    if (marker) onChange({ ...marker, name })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Preset quick select */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
          Quick select campus location
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_LOCATIONS.map(loc => (
            <button
              key={loc.name}
              type="button"
              onClick={() => handlePresetSelect(loc)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: locationName === loc.name
                  ? 'rgba(99,102,241,0.2)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${locationName === loc.name
                  ? 'rgba(99,102,241,0.5)'
                  : 'rgba(255,255,255,0.08)'}`,
                color: locationName === loc.name ? '#818cf8' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <MapPin size={10} />
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom location name */}
      <input
        type="text"
        value={locationName}
        onChange={e => handleNameChange(e.target.value)}
        placeholder="Or type a custom location name..."
        className="input-field"
        style={{ fontSize: '0.875rem' }}
      />

      {/* Map */}
      <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        <MapContainer
          center={CAMPUS_CENTER}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {marker && (
            <Marker position={[marker.lat, marker.lng]}>
              <Popup>{locationName || 'Selected Location'}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <p style={{ color: '#475569', fontSize: '0.75rem' }}>
        💡 Click on the map to pin the exact location, or use the quick select above.
      </p>
    </div>
  )
}
