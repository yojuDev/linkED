import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import "../auth.form.scss"

const Register = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
        branch: "",
        graduationYear: "",
        company: "",
        bio: "",
        expertise: ""
    })

    const { loading, handleRegister } = useAuth()
    const [error, setError] = useState("")

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const result = await handleRegister(form)
        if (result?.success) {
            navigate("/portal")
            return
        }
        setError(result?.message || "Unable to register")
    }

    if (loading) {
        return (<main><h1>Loading.......</h1></main>)
    }

    return (
        <main className="auth-page register-page">
            <section className="register-shell">
                <aside className="register-showcase">
                    <p className="auth-pill">LinkED JUIT</p>
                    <h1>Build your mentor profile in minutes.</h1>
                    <p>
                        Join the campus network where students and alumni connect for placement prep,
                        career decisions, projects, and real interview insight.
                    </p>
                    <div className="showcase-grid" aria-label="Registration benefits">
                        <div>
                            <strong>Smart</strong>
                            <span>mentor discovery</span>
                        </div>
                        <div>
                            <strong>Fast</strong>
                            <span>profile setup</span>
                        </div>
                        <div>
                            <strong>Trusted</strong>
                            <span>JUIT community</span>
                        </div>
                    </div>
                </aside>

                <div className="form-container register-card">
                    <div className="form-heading">
                        <p className="eyebrow">Create account</p>
                        <h2>Register</h2>
                        <span>Select your role and tell the community how you want to connect.</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group">
                                <label htmlFor="name">Name</label>
                                <input onChange={handleChange} value={form.name} type="text" id="name" name='name' placeholder='Enter your full name' />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email">Email</label>
                                <input onChange={handleChange} value={form.email} type="email" id="email" name='email' placeholder='Enter email address' />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <input onChange={handleChange} value={form.password} type="password" id="password" name='password' placeholder='Enter password' />
                            </div>
                            <div className="input-group">
                                <label htmlFor="role">Role</label>
                                <select id="role" name="role" value={form.role} onChange={handleChange}>
                                    <option value="student">Student</option>
                                    <option value="alumni">Alumni</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="branch">Branch</label>
                                <input onChange={handleChange} value={form.branch} type="text" id="branch" name='branch' placeholder='CSE, ECE, IT, etc.' />
                            </div>
                            <div className="input-group">
                                <label htmlFor="graduationYear">Graduation Year</label>
                                <input onChange={handleChange} value={form.graduationYear} type="number" id="graduationYear" name='graduationYear' placeholder='2027' />
                            </div>
                            {form.role === "alumni" && (
                                <div className="input-group">
                                    <label htmlFor="company">Company</label>
                                    <input onChange={handleChange} value={form.company} type="text" id="company" name='company' placeholder='Current company' />
                                </div>
                            )}
                            <div className="input-group input-group--wide">
                                <label htmlFor="expertise">Skills / Expertise</label>
                                <input onChange={handleChange} value={form.expertise} type="text" id="expertise" name='expertise' placeholder='DSA, React, ML, Placement prep' />
                            </div>
                            <div className="input-group input-group--wide">
                                <label htmlFor="bio">Short Bio</label>
                                <textarea onChange={handleChange} value={form.bio} id="bio" name='bio' placeholder='Tell others what support you need or can offer' />
                            </div>
                        </div>

                        <button className='button primary-button' type="submit">Create Profile</button>
                    </form>
                    {error && <p className="form-error">{error}</p>}

                    <p className="auth-switch">Already have an account? <Link to={"/login"}>Login</Link></p>
                </div>
            </section>
        </main>
    )
}

export default Register
