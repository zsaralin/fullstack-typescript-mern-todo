import {Router} from 'express'
import {getPresFile, getPresDatabase, addPres, deletePres} from '../controllers/pres'

const router: Router = Router()

router.get('/get-pres-file', getPresFile)
router.get('/get-pres-db', getPresDatabase)
router.post('/add-pres', addPres)
router.delete('/delete-pres/:id', deletePres)

export default router
