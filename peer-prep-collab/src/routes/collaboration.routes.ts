import {Router} from 'express';
import { getCollaborationSession, getDocument, saveCodeToDocument } from '../controllers/collaboration.controller';

const router = Router();

// Route to get an existing collaboration session by sessionId
router.get('/:sessionId', getCollaborationSession);

// Fetch code based on documentId
router.get('/code/:documentId', getDocument);

// Save code based on documentId
router.post('/save/', saveCodeToDocument)

export default router;