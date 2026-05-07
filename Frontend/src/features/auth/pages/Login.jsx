import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate('/portal')
    }

    if (loading) {
        return (<main><h1>Loading.......</h1></main>)
    }


    return (
        <main className="auth-page login-page">
            <section className="login-shell">
                <div className="form-container login-card">
                    <div className="form-heading">
                        <p className="eyebrow">Welcome back</p>
                        <h1>Login to LinkED</h1>
                        <span>Continue your mentoring conversations, requests, and campus network updates.</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                value={email}
                                onChange={(e) => { setEmail(e.target.value) }}
                                type="email" id="email" name='email' placeholder='Enter email address' />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                value={password}
                                onChange={(e) => { setPassword(e.target.value) }}
                                type="password" id="password" name='password' placeholder='Enter password' />
                        </div>
                        <button className='button primary-button' type="submit">Enter Portal</button>
                    </form>

                    <div className="login-divider">
                        <span>JUIT alumni and students</span>
                    </div>

                    <p className="auth-switch">Don't have an account? <Link to={"/register"} >Create one</Link></p>
                </div>

                <aside className="login-showcase">
                    <p className="auth-pill">Mentor Connect</p>
                    <h2>One campus. Many paths. Better guidance.</h2>
                    <p>
                        Find practical answers from people who know the journey from JUIT classrooms
                        to internships, interviews, and full-time roles.
                    </p>
                    <div className="login-metrics" aria-label="Portal benefits">
                        <div>
                            <strong>01</strong>
                            <span>Connect with alumni</span>
                        </div>
                        <div>
                            <strong>02</strong>
                            <span>Plan placement prep</span>
                        </div>
                        <div>
                            <strong>03</strong>
                            <span>Grow with real advice</span>
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    )
}

export default Login
