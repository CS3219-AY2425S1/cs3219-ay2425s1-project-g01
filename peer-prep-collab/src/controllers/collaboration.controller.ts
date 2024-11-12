import { Request, Response, RequestHandler } from 'express';
import { getQuestion, getSessionDataFromMongo } from '../services/collaboration.services';
import { updateUserService } from '..';
import SessionModel from '../models/session.schema';
import {Session} from '../models/session.model';

export const initiateCollaboration = async (sessionId: string, difficulty: string, category: string, username1: string, username2: string, userId1: string, userId2: string) => {
    try {
        // Get question based on given conditions
        const polledQuestion = await getQuestion(difficulty, category);
        if (!polledQuestion) {
            console.log('No suitable question found for specified difficulty and category');
            return null;
        }

        const session: Session = {
            sessionId,
            users: {username1, username2},
            userIds: {userId1, userId2},
            question: polledQuestion
        }

        const sessionDocument = new SessionModel({ //New entry to add to db
            matchedUsers: session.users,
            matchedUserIds: session.userIds,
            question: session.question,
            sessionId: session.sessionId
        })
        
        sessionDocument.save() //Add to db
            .then(entry => {
                updateUserService({...session, sessionIdentifier: entry.id}); //Send to userservice to update matched pair
            })    
    } catch (error) {
        console.error('Error starting collaboration', error);
    }
}

// Controller to handle fetching session data
export const getCollaborationSession: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params;
    
    if (!sessionId) {
        res.status(400).json({error: 'Session ID is required'});
        return;
    }
    
    try {
        // Call service to retrieve session data
        const sessionResponse = await getSessionDataFromMongo(sessionId);

        if (!sessionResponse) {
            res.status(404).json({error: 'Session not found'});
            return;
        }

        res.status(200).json(sessionResponse);
        return;
    } catch (error) {
        console.error('Error fetching collaboration session', error);
        res.status(500).jsonp('Error fetching collaboration');
        return;
    }
};

export const getDocument: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.documentId
    const doc = await SessionModel.findById({_id: id})
    if (doc) {
        res.status(200).json({
            message: "Request successful",
            code: doc.code
        })
    } else {
        res.status(404).json({
            message: "Could not find code",
            code: ""
        })
    }
}

export const saveCodeToDocument: RequestHandler = async(req: Request, res: Response): Promise<void> => {
    const id = req.body.documentId
    const codeToUpdate = req.body.code
    await SessionModel.findByIdAndUpdate({_id: id}, {code: codeToUpdate})
        .then(data => {
            res.status(200).json({
                message: "Code updated"
            })
        })
        .catch((err) => {
            res.status(400).json({
                message: err.message
            })
        })
}