import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

export default function MapView({ user, onLogout }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [rondaActiva, setRondaActiva] = useState(false)
  const [ubicacion, setUbicacion] = useState([-33.561502, -70.711210])
  const [status, setStatus] = useState('DISPONIBLE')
  const [menuOpen, setMenuOpen] = useState(false)
  const [locatingStatus, setLocatingStatus] = useState('')

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current).setView(ubicacion, 16)
      
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles © Esri'
      }).addTo(map)

      const locateControl = L.control({ position: 'topright' })
      locateControl.onAdd = () => {
        const div = L.DomUtil.create('div', 'locate-control')
        div.innerHTML = '<button class="locate-btn" title="Mi ubicación"><i class="fas fa-crosshairs"></i></button>'
        div.addEventListener('click', () => {
          setLocatingStatus('Obteniendo ubicación...')
          console.log('Iniciando geolocalización...')
          
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude, accuracy } = pos.coords
                console.log('✅ Ubicación obtenida:', latitude, longitude, 'Precisión:', accuracy)
                setLocatingStatus('✅ Ubicación obtenida')
                
                setUbicacion([latitude, longitude])
                map.setView([latitude, longitude], 18)
                
                if (markerRef.current) {
                  map.removeLayer(markerRef.current)
                }
                
                markerRef.current = L.marker([latitude, longitude], {
                  icon: L.icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    shadowSize: [41, 41],
                    iconAnchor: [12, 41],
                    shadowAnchor: [12, 41],
                    popupAnchor: [1, -34]
                  })
                }).addTo(map).bindPopup(`<b>Tu Ubicación</b><br>Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}<br>Precisión: ${Math.round(accuracy)}m`)
                
                markerRef.current.openPopup()
                setTimeout(() => setLocatingStatus(''), 3000)
              },
              (error) => {
                console.error('❌ Error de geolocalización:', error.code, error.message)
                let mensaje = 'Error desconocido'
                
                if (error.code === error.PERMISSION_DENIED) {
                  mensaje = 'Permisos denegados. Verifica los permisos de ubicación del navegador.'
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                  mensaje = 'Ubicación no disponible. Intenta en exterior o con GPS activado.'
                } else if (error.code === error.TIMEOUT) {
                  mensaje = 'Tiempo agotado. Intenta de nuevo.'
                }
                
                setLocatingStatus(`❌ ${mensaje}`)
                console.error(mensaje)
                alert(mensaje)
                setTimeout(() => setLocatingStatus(''), 5000)
              },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            )
          } else {
            alert('Geolocalización no disponible en este navegador')
            setLocatingStatus('❌ Geolocalización no disponible')
          }
        })
        return div
      }
      locateControl.addTo(map)

      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords
            setUbicacion([latitude, longitude])
            if (!rondaActiva) {
              map.setView([latitude, longitude], 16)
            }
          },
          (error) => {
            console.error('Error en watchPosition:', error)
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      }

      mapInstanceRef.current = map
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    }
  }, [rondaActiva])

  const toggleRonda = () => {
    const newState = !rondaActiva
    setRondaActiva(newState)
    setStatus(newState ? 'EN RONDA' : 'DISPONIBLE')
    
    const timestamp = new Date().toISOString()
    console.log(`[${newState ? 'RONDA INICIADA' : 'RONDA FINALIZADA'}] Usuario: ${user?.name} - ${timestamp} - Coord: ${ubicacion}`)
  }

  const handleCamera = (event) => {
    const file = event.target.files[0]
    if (file) {
      const timestamp = new Date().toISOString()
      const evidencia = {
        usuario: user?.name,
        rut: user?.rut,
        fechaHora: timestamp,
        coordenadas: ubicacion,
        imagen: file
      }
      console.log('Evidencia capturada:', evidencia)
      alert('Foto guardada con metadatos de geolocalización.')
      event.target.value = ''
    }
  }

  const handleLogout = () => {
    setMenuOpen(false)
    onLogout()
  }

  return (
    <>
      <div className="app-header">
        <div className="app-title">GPSGuard ®</div>
        <div className="app-status">
          <span className="status-badge">{user?.name}</span>
        </div>
      </div>

      {locatingStatus && (
        <div className="locating-toast">
          {locatingStatus}
        </div>
      )}

      <nav className="navbar">
        <div className="navbar-actions">
          <button className={`btn-action ${rondaActiva ? 'end' : 'start'}`} onClick={toggleRonda}>
            {rondaActiva ? 'Terminar' : 'Iniciar Ronda'}
          </button>
          
          <input type="file" id="camera-input" accept="image/*" capture="environment" style={{display: 'none'}} onChange={handleCamera} />
          <label htmlFor="camera-input" className="cam-label" title="Tomar foto de novedad">
            <i className="fas fa-camera"></i>
          </label>

          <div className="menu-hamburger">
            <button className="btn-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <i className="fas fa-bars"></i>
            </button>
            {menuOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div ref={mapRef} id="map"></div>
    </>
  )
}
