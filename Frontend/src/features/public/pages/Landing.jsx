import React from "react";
import { Link } from "react-router";
import "../style/landing.scss";
import { useAuth } from "../../auth/hooks/useAuth";

const Landing = () => {
    const { user } = useAuth();
    const highlights = [
        {
            value: "1:1",
            label: "alumni mentorship",
        },
        {
            value: "Career",
            label: "guidance and prep",
        },
        {
            value: "JUIT",
            label: "student network",
        },
    ];

    const features = [
        {
            title: "Find the right alumni",
            text: "Discover mentors who understand your branch, goals, interview path, and placement questions.",
        },
        {
            title: "Ask practical questions",
            text: "Get honest advice on projects, resumes, internships, interviews, and what recruiters really expect.",
        },
        {
            title: "Build campus confidence",
            text: "Turn scattered doubts into focused conversations with people who have already walked the route.",
        },
    ];

    return (
        <main className="landing-page">
            <section className="landing-hero">
                <div className="hero-copy">
                    <p className="pill">JUIT Community Portal</p>
                    <h1>Jaypee University of Information Technology</h1>
                    <p className="tagline">
                        A mentorship space where students meet the right alumni for career guidance,
                        placement preparation, and honest real-world insight.
                    </p>
                    <div className="cta-row">
                        {user ? (
                            <Link className="button primary-button" to="/portal">Go to Portal</Link>
                        ) : (
                            <>
                                <Link className="button primary-button" to="/login">Login</Link>
                                <Link className="button secondary-button" to="/register">Join LinkED</Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="landing-stats" aria-label="Portal highlights">
                {highlights.map((item) => (
                    <article className="stat-card" key={item.label}>
                        <strong>{item.value}</strong>
                        <span>{item.label}</span>
                    </article>
                ))}
            </section>

            <section className="feature-grid" aria-label="How LinkED helps">
                {features.map((feature) => (
                    <article className="feature-card" key={feature.title}>
                        <h2>{feature.title}</h2>
                        <p>{feature.text}</p>
                    </article>
                ))}
            </section>
        </main>
    );
};

export default Landing;
