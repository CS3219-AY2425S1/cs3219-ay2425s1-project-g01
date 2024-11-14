import { Question } from './question.model';

export interface QuestionsApiResponse {
    status: number;
    message: string;
    data: {
        data: Question[]; // This represents the actual array of questions
    };
}
