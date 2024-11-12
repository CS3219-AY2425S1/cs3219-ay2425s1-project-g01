import axios from 'axios';
import {config} from '../config/config';
import {Question} from '../models/question.model';
import {Session} from '../models/session.model';
import { QuestionsApiResponse } from '../models/qnresponse.model';
import SessionModel from '../models/session.schema';
import { SessionResponse } from '../models/sessionResponse.model';

export const getQuestion = async (
    difficulty: string,
    category: string
): Promise<Question | null> => {
    try {
        // console.log(`Fetching questions for category: ${category}`);
        // console.log(`Fetching questions for difficulty: ${difficulty}`);   

        if (!category) {
            category = '';
        }

        // fetch questions based on difficulty and category from questions service 
        const response = await axios.get<QuestionsApiResponse>(
            `${config.questionsServiceUrl}/questions?filterBy=question_categories&filterValues=${category}`
        );

        // const response = await axios.get<QuestionsApiResponse>(
        //     `http://localhost:8080/questions?filterBy=question_categories&filterValues=Arrays`
        // );

        // console.log('Raw response data:', response.data);

        const preDifficultyQuestions = response.data.data.data as Question[];

        // console.log('Questions fetched:', preDifficultyQuestions);

        const validQuestions = preDifficultyQuestions.filter((question: Question) => 
            question.question_complexity.toLowerCase() === difficulty.toLowerCase() 
        );

        // console.log('Filtered questions by difficulty:', validQuestions);

        // pick a random question from the filtered list 
        if (validQuestions.length === 0) {
            console.warn('No questions found for the given difficulty and category');
            return null;
        }
        const randomIndex = Math.floor(Math.random() * validQuestions.length);
        return validQuestions[randomIndex];
    } catch (error) {
        console.error('Error fetching question', error);
        return null;
    }
}

export const getSessionDataFromMongo = async (sessionId: string): Promise<SessionResponse | null> => {
    try {
        // return activeSessions[sessionId];
        const result = await SessionModel.find({sessionId: sessionId}).sort({createdAt: -1}).limit(1).exec()

        if (!result) {
            console.error(`No session found with the sessionId: ${sessionId}`)
            return null
        }

        const response: SessionResponse = {
            sessionId: result[0].sessionId,
            users: {
                username1: result[0].matchedUsers.username1,
                username2: result[0].matchedUsers.username2
            },
            userIds: {
                userId1: result[0].matchedUserIds.userId1,
                userId2: result[0].matchedUserIds.userId2
            },
            question: result[0].question,
            docId: result[0].id
        }
        
        return response
    } catch (error) {
        console.error('Error fetching session data', error);
        return null;
    }
}

// note: current implementation doesn't delete the session record from activeSessions