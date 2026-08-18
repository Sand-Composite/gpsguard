import { useState } from 'react'
import '../assets/styles/login.css'

export default function LoginPage({ onLogin }) {
  const [showRegister, setShowRegister] = useState(false)
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', user: '', pass: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm(prev => ({ ...prev, [name]: value }))
  }

  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setRegisterForm(prev => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!loginForm.user.trim() || !loginForm.pass.trim()) {
      setError('Completa usuario y contraseña.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const savedUserStr = localStorage.getItem('gpsguard_user')
      
      if (!savedUserStr) {
        setError('No hay usuarios registrados. Regístrate primero.')
        setLoading(false)
        return
      }

      const savedUser = JSON.parse(savedUserStr)
      if ((loginForm.user === savedUser.user || loginForm.user === savedUser.rut) && loginForm.pass === savedUser.pass) {
        onLogin(savedUser)
      } else {
        setError('Usuario o contraseña incorrectos.')
      }
      
      setLoading(false)
    }, 300)
  }

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!registerForm.name.trim() || !registerForm.rut.trim() || !registerForm.user.trim() || !registerForm.pass.trim()) {
      setError('Completa todos los campos.')
      return
    }

    if (registerForm.pass.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const userData = {
        name: registerForm.name.trim(),
        rut: registerForm.rut.trim(),
        user: registerForm.user.trim(),
        pass: registerForm.pass
      }
      
      localStorage.setItem('gpsguard_user', JSON.stringify(userData))
      alert('¡Usuario registrado! Ahora inicia sesión.')
      setShowRegister(false)
      setRegisterForm({ name: '', rut: '', user: '', pass: '' })
      setLoginForm({ user: '', pass: '' })
      setError('')
      setLoading(false)
    }, 300)
  }

  if (showRegister) {
    return (
      <div className="login-wrapper">
        <form className="login-container" onSubmit={handleRegisterSubmit}>
          <h1>GPSGuard ®</h1>
          <h3>Crear Cuenta</h3>

          <input type="text" name="name" placeholder="Nombre y Apellido" value={registerForm.name} onChange={handleRegisterChange} required />
          <input type="text" name="rut" placeholder="usuario@email.com" value={registerForm.rut} onChange={handleRegisterChange} required />
          <input type="text" name="user" placeholder="Nuevo Usuario" value={registerForm.user} onChange={handleRegisterChange} required />
          <input type="password" name="pass" placeholder="Nueva Contraseña" value={registerForm.pass} onChange={handleRegisterChange} required />

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>

          <p className="auth-link">¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(false); setError('') }}>Inicia sesión</a></p>
        </form>
      </div>
    )
  }

  return (
    <div className="login-wrapper">
      <form className="login-container" onSubmit={handleLoginSubmit}>
        <h1>GPSGuard ®</h1>
        <h3>Iniciar Sesión</h3>

        <input type="text" name="user" placeholder="Usuario" value={loginForm.user} onChange={handleLoginChange} autoComplete="username" required />
        <input type="password" name="pass" placeholder="Contraseña" value={loginForm.pass} onChange={handleLoginChange} autoComplete="current-password" required />

        {error ? <p className="login-error">{error}</p> : null}

        <button type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Iniciar sesión'}</button>

        <p className="auth-link">¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true); setError('') }}>Regístrate aquí</a></p>
      </form>
    </div>
  )
}
