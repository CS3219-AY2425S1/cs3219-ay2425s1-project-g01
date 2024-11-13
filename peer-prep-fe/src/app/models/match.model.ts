import { UserData } from "../../types/userdata";

export interface MatchRequest {
    userData: UserData;
    key: string; // easy_queue, medium_queue, hard_queue
}

export interface MatchRequestCancel {
    user_id: string
}

export interface MatchResponse {
    matchedUsers: UserData[]; // 0 or 2 - is an array of UserDatas 
    sessionId: string;
    timeout: boolean;
}

export interface MatchRequestCancelResponse {
    message: string
}
