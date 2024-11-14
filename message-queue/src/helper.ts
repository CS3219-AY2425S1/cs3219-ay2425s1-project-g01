import crypto from "crypto"

import { UserData } from "./types"

export const generateSessionId = (user1Id: UserData, user2Id: UserData) => {
  const combinedId = [user1Id.user_id, user2Id.user_id].sort().join("-") // e.g. user1-user2
  const sessionId = crypto.createHash("sha256").update(combinedId).digest("hex")
  return sessionId
}
