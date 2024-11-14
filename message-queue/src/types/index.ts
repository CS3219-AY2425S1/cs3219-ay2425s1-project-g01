export interface UserData {
  difficulty: string
  topic: string
  user_id: string
  username: string
}

export type CollabExchangeData = {
  matchedUsers: UserData[]
  sessionId: string
}
