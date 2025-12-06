import express from 'express';
import { addDonar, getDonar } from '../controllers/donar.controller.js';


const router = express.Router();

router.post('/adddonar',addDonar);
router.get('/getAll',getDonar);
//router.delete('/delete/:id',Delete);
//router.put('/updatemember/:id',updateStaff);


export default router;