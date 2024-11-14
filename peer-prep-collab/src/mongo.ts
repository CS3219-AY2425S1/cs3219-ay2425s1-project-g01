import { connect } from "mongoose"

export default async function connectToDB() {
    let mongoDBUri = process.env.DB_CLOUD_URI
    if (mongoDBUri) {
        await connect(mongoDBUri, {dbName: "peer-prep"})
        console.log("Connected to Mongo")
    } else {
        console.error("MongoDB URI is null. Ensure it exists in .env file")
    }
}




