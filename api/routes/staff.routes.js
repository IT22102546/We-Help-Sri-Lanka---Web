import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { add, adminsignin ,Delete,getStaff,signout, updateStaff } from '../controllers/staff.controller.js';


const router = express.Router();

router.post('/add',add);
router.get('/getAll',getStaff);
router.delete('/delete/:id',Delete);
//router.get('/getmember/:id',Getmember);
router.put('/updatemember/:id',updateStaff);
//router.put('/updatememberprofile/:id',updatestaffprofile);
router.post('/login',adminsignin);
router.get('/signout',signout);
//router.put("/assignmanager/:id" , verifyToken , assignManager);
//router.put("/resignmanager/:id" , verifyToken , resignManager);
//

export default router;