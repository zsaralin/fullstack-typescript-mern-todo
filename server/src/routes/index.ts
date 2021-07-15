import { Router } from 'express'
import {getTodos, addTodo, updateTodo, deleteTodo, getLongestName, getTodos2} from '../controllers/todos'

const router: Router = Router()

router.get('/todos', getTodos)
router.get('/todos2', getTodos2)

router.get('/todos-long', getLongestName)

router.post('/add-todo', addTodo)

router.put('/edit-todo/:id', updateTodo)

router.delete('/delete-todo/:id', deleteTodo)

export default router
