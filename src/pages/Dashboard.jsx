import MapView from '../components/MapView'

export default function Dashboard({ user, onLogout }) {
    return (
        <div className="dashboard">
            <MapView user={user} onLogout={onLogout} />
        </div>
    )
}
