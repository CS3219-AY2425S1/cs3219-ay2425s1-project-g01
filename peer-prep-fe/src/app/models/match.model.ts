import { UserData } from "../../../../message-queue/src/types/index";

export interface MatchRequest {
    userData: UserData;
    key: string; // easy_queue, medium_queue, hard_queue
}

export interface MatchResponse {
    matchedUsers: UserData[]; // 0 or 2 - is an array of UserDatas 
    timeout: boolean;
}

