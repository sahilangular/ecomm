import express from 'express';
import { deleteUser, getAllUser, getUser, newUser } from '../controllers/user.js';
import { adminAccess } from '../middleware/auth.js';

const router = express.Router();

router.post('/new',newUser)

router.get('/all',adminAccess,getAllUser);

router.get('/:id',getUser);

router.delete('/:id',adminAccess,deleteUser);






export default router;