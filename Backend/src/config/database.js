const mongoose = require("mongoose")

async function prepareUserCollection() {
    const users = mongoose.connection.db.collection("users")
    const indexes = await users.indexes()
    const hasOldUsernameIndex = indexes.some((index) => index.name === "username_1")

    await users.updateMany(
        { name: { $exists: false }, username: { $exists: true } },
        [{ $set: { name: "$username" } }]
    )

    if (hasOldUsernameIndex) {
        await users.dropIndex("username_1")
        console.log("Removed old username unique index")
    }
}



async function connectToDB() {

    try {
        await mongoose.connect(process.env.MONGO_URI)
        await prepareUserCollection()

        console.log("Connected to Database")
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = connectToDB
