import {Router} from 'express'
import {getPresFile, addPres, deletePres} from '../controllers/pres'

const router: Router = Router()

router.get('/get-pres-file', getPresFile)
router.post('/add-pres', addPres)
router.delete('/delete-pres/:id', deletePres)

export default router
