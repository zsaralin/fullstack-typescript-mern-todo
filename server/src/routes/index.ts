import {Router} from 'express'
import {getPres, addPres, deletePres, getPres2} from '../controllers/todos'

const router: Router = Router()

router.get('/get-pres', getPres)
router.get('/get-pres-2', getPres2)
router.post('/add-pres', addPres)
router.delete('/delete-pres/:id', deletePres)

export default router
