import { Router } from 'express'
import {getTodos, addTodo, deleteTodo, getTodos2} from '../controllers/todos'

const router: Router = Router()

router.get('/todos', getTodos)
router.get('/todos2', getTodos2)

router.post('/add-todo', addTodo)

router.delete('/delete-todo/:id', deleteTodo)

export default router
