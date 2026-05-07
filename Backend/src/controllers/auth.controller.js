const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

function sanitizeExpertise(expertise = "") {
    if (Array.isArray(expertise)) {
        return expertise.map((item) => String(item).trim()).filter(Boolean)
    }

    return String(expertise)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
}

function getPublicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        branch: user.branch,
        graduationYear: user.graduationYear,
        company: user.company,
        bio: user.bio,
        expertise: user.expertise
    }
}

async function registerUserController(req, res) {
    try {
        const { name, email, password, role, branch, graduationYear, company, bio, expertise } = req.body

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Please provide name, email, password and role"
            })
        }

        if (![ "student", "alumni" ].includes(role)) {
            return res.status(400).json({
                message: "role must be student or alumni"
            })
        }

        const isUserAlreadyExists = await userModel.findOne({ email })

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            name,
            email,
            password: hash,
            role,
            branch,
            graduationYear,
            company,
            bio,
            expertise: sanitizeExpertise(expertise)
        })

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token)

        res.status(201).json({
            message: "User registered successfully",
            user: getPublicUser(user)
        })
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(400).json({
                message: "Account already exists with this email address"
            })
        }

        if (err?.name === "ValidationError") {
            return res.status(400).json({
                message: Object.values(err.errors).map((error) => error.message).join(", ")
            })
        }

        console.log(err)
        return res.status(500).json({
            message: "Unable to register right now"
        })
    }

}

async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)
    res.status(200).json({
        message: "User loggedIn successfully.",
        user: getPublicUser(user)
    })
}

async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message: "User details fetched successfully",
        user: getPublicUser(user)
    })

}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
