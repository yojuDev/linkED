import React, { useCallback, useEffect, useMemo, useState } from 'react'
import "../style/home.scss"
import { useAuth } from '../../auth/hooks/useAuth'
import { getMentors, getMyMentorRequests, getRecommendations, replyToMentorRequest, sendMentorRequest, updateMentorRequestStatus } from '../services/mentorship.api'

const Home = () => {
    const { user, handleLogout } = useAuth()
    const [mentors, setMentors] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [requests, setRequests] = useState([])
    const [messageByMentor, setMessageByMentor] = useState({})
    const [replyByRequest, setReplyByRequest] = useState({})
    const [loading, setLoading] = useState(false)
    const [query, setQuery] = useState("")
    const [branchFilter, setBranchFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    const messageTemplates = [
        "Hi, I would like guidance for placement preparation and interview strategy.",
        "Hi, can you review my current skills and suggest a roadmap?",
        "Hi, I want to learn about your career path after JUIT.",
    ]

    const loadDashboardData = useCallback(async () => {
        if (!user) return
        setLoading(true)
        try {
            const reqData = await getMyMentorRequests()
            setRequests(reqData.requests || [])

            if (user.role === "student") {
                const [mentorData, recommendationData] = await Promise.all([getMentors(), getRecommendations()])
                setMentors(mentorData.mentors || [])
                setRecommendations(recommendationData.recommendations || [])
            }
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        loadDashboardData()
    }, [loadDashboardData])

    const handleRequestMentor = async (mentorId) => {
        const message = messageByMentor[mentorId] || "Hello, I am looking for mentorship guidance."
        await sendMentorRequest({ mentorId, message })
        await loadDashboardData()
    }

    const handleDecision = async (requestId, status) => {
        await updateMentorRequestStatus({ requestId, status })
        await loadDashboardData()
    }

    const handleReply = async (requestId) => {
        const reply = replyByRequest[requestId]
        await replyToMentorRequest({ requestId, reply })
        setReplyByRequest((prev) => ({ ...prev, [requestId]: "" }))
        await loadDashboardData()
    }

    const mentorCards = useMemo(
        () => recommendations
            .filter(({ score }) => score > 30)
            .map(({ mentor, score }) => ({ ...mentor, score, recommended: true })),
        [recommendations]
    )
    const filteredMentors = mentorCards.filter((mentor) => {
        const searchText = `${mentor.name} ${mentor.branch} ${mentor.company || ""} ${(mentor.expertise || []).join(" ")}`.toLowerCase()
        const matchesSearch = searchText.includes(query.toLowerCase())
        const matchesBranch = branchFilter === "all" || mentor.branch === branchFilter
        return matchesSearch && matchesBranch
    })

    const branches = useMemo(() => {
        const values = mentors.concat(mentorCards).map((mentor) => mentor.branch).filter(Boolean)
        return ["all", ...new Set(values)]
    }, [mentors, mentorCards])

    const filteredRequests = requests.filter((request) => statusFilter === "all" || request.status === statusFilter)
    const acceptedRequests = requests.filter((request) => request.status === "accepted").length
    const pendingRequests = requests.filter((request) => request.status === "pending").length
    const rejectedRequests = requests.filter((request) => request.status === "rejected").length
    const topMatch = recommendations[0]?.score || 0

    if (!user) return null

    return (
        <div className='mentor-page'>
            <header className='mentor-header portal-card'>
                <div className='mentor-header__content'>
                    <p className='portal-pill'>AI Powered Mentor Portal</p>
                    <h1>JUIT Mentor Connect</h1>
                    <p>Discover mentors, manage requests, and turn placement confusion into clear next steps.</p>
                </div>
                <div className='mentor-header__meta'>
                    <span>Signed in as</span>
                    <p>{user.name} ({user.role})</p>
                    <button className='button secondary-button' onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <section className='insight-grid' aria-label='Dashboard insights'>
                <article className='insight-card'>
                    <span>Top AI Match</span>
                    <strong>{user.role === "student" ? `${topMatch}%` : `${pendingRequests}`}</strong>
                    <p>{user.role === "student" ? "best recommendation score" : "pending student requests"}</p>
                </article>
                <article className='insight-card'>
                    <span>Active Requests</span>
                    <strong>{acceptedRequests}</strong>
                    <p>accepted mentor connections</p>
                </article>
                <article className='insight-card'>
                    <span>Queue Health</span>
                    <strong>{pendingRequests}</strong>
                    <p>waiting for a decision</p>
                </article>
                <article className='insight-card'>
                    <span>Closed</span>
                    <strong>{rejectedRequests}</strong>
                    <p>rejected or archived requests</p>
                </article>
            </section>

            {loading && <p className='loading-text'>Loading dashboard...</p>}

            {user.role === "student" && (
                <section className='portal-card'>
                    <div className='section-heading'>
                        <div>
                            <p className='eyebrow-text'>Smart discovery</p>
                            <h2>Recommended Mentors</h2>
                            <p className='muted'>Showing mentors with more than 30% match, ranked by branch and skills similarity.</p>
                        </div>
                        <div className='mentor-tools'>
                            <input
                                type='search'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder='Search skills, company, branch'
                            />
                            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                                {branches.map((branch) => (
                                    <option value={branch} key={branch}>{branch === "all" ? "All branches" : branch}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='mentor-grid'>
                        {filteredMentors.map((mentor) => (
                            <article className='mentor-card' key={mentor._id}>
                                <div className='mentor-card__top'>
                                    <div>
                                        <h3>{mentor.name}</h3>
                                        <p>{mentor.branch} | {mentor.company || "Alumni"}</p>
                                    </div>
                                    <span className='match-badge'>{mentor.score}%</span>
                                </div>
                                <p>{mentor.bio || "No bio added yet."}</p>
                                <p className='muted'>Skills: {(mentor.expertise || []).join(", ") || "Not provided"}</p>
                                <div className='template-row'>
                                    {messageTemplates.map((template) => (
                                        <button
                                            type='button'
                                            key={template}
                                            onClick={() => setMessageByMentor((prev) => ({ ...prev, [mentor._id]: template }))}
                                        >
                                            Use template
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    placeholder='Write your message to this mentor'
                                    value={messageByMentor[mentor._id] || ""}
                                    onChange={(e) => setMessageByMentor((prev) => ({ ...prev, [mentor._id]: e.target.value }))}
                                />
                                <button className='button primary-button' onClick={() => handleRequestMentor(mentor._id)}>
                                    Request Guidance
                                </button>
                            </article>
                        ))}
                        {!filteredMentors.length && <p className='empty-state'>No mentor has more than 30% match for your current profile and filters.</p>}
                    </div>
                </section>
            )}

            {user.role === "student" && (
                <section className='portal-card compact-card'>
                    <div className='section-heading'>
                        <div>
                            <p className='eyebrow-text'>Network map</p>
                            <h2>All Alumni Mentors ({mentors.length})</h2>
                        </div>
                    </div>
                    <div className='mentor-list'>
                        {mentors.map((mentor) => (
                            <article key={mentor._id}>
                                <div className='alumni-card__top'>
                                    <strong>{mentor.name}</strong>
                                    <span>{mentor.company || "Alumni"}</span>
                                </div>
                                <p>{mentor.bio || "No bio added yet."}</p>
                                <div className='alumni-meta'>
                                    <span>{mentor.branch || "Branch not provided"}</span>
                                    <span>{mentor.graduationYear || "Graduation year not provided"}</span>
                                </div>
                                <p className='muted'>Skills: {(mentor.expertise || []).join(", ") || "Not provided"}</p>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <section className='portal-card'>
                <div className='section-heading'>
                    <div>
                        <p className='eyebrow-text'>Request manager</p>
                        <h2>{user.role === "student" ? "My Mentor Requests" : "Incoming Student Requests"}</h2>
                    </div>
                    <select className='status-filter' value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value='all'>All status</option>
                        <option value='pending'>Pending</option>
                        <option value='accepted'>Accepted</option>
                        <option value='rejected'>Rejected</option>
                    </select>
                </div>
                <div className='request-grid'>
                {filteredRequests.map((request) => (
                    <article key={request._id} className='request-card'>
                        <div className='request-card__top'>
                            <div>
                                <p><strong>Student:</strong> {request.student?.name}</p>
                                <p><strong>Mentor:</strong> {request.mentor?.name}</p>
                            </div>
                            <span className={`status-badge status-badge--${request.status}`}>{request.status}</span>
                        </div>
                        <p><strong>Message:</strong> {request.message}</p>
                        {request.mentorReply?.message && (
                            <div className='mentor-reply'>
                                <strong>Mentor Reply</strong>
                                <p>{request.mentorReply.message}</p>
                                {request.mentorReply.repliedAt && (
                                    <span>{new Date(request.mentorReply.repliedAt).toLocaleString()}</span>
                                )}
                            </div>
                        )}
                        {user.role === "alumni" && request.status === "pending" && (
                            <div className='request-actions'>
                                <button className='button primary-button' onClick={() => handleDecision(request._id, "accepted")}>Accept</button>
                                <button className='button secondary-button' onClick={() => handleDecision(request._id, "rejected")}>Reject</button>
                            </div>
                        )}
                        {user.role === "alumni" && request.status !== "rejected" && (
                            <div className='reply-box'>
                                <label htmlFor={`reply-${request._id}`}>Reply to student</label>
                                <textarea
                                    id={`reply-${request._id}`}
                                    value={replyByRequest[request._id] ?? request.mentorReply?.message ?? ""}
                                    placeholder='Write guidance, next steps, or availability for a quick call'
                                    onChange={(e) => setReplyByRequest((prev) => ({ ...prev, [request._id]: e.target.value }))}
                                />
                                <button className='button primary-button' onClick={() => handleReply(request._id)}>
                                    {request.mentorReply?.message ? "Update Reply" : "Send Reply"}
                                </button>
                            </div>
                        )}
                    </article>
                ))}
                </div>
                {!filteredRequests.length && <p className='empty-state'>No requests found for this status.</p>}
            </section>
        </div>
    )
}

export default Home
