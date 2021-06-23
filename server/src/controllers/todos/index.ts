import { Response, Request } from 'express'
import { ITodo } from './../../types/todo'
import Todo from '../../models/todo'
import fs from 'fs';
const pathFull = "C:\\Users\\Saralin\\IdeaProjects\\fullstack-typescript-mern-todo\\Meeting\\"

const getTodos = async (req: Request, res: Response): Promise<void> => {
    try {
        const todos: ITodo[] = [];
        for (const file of fs.readdirSync(pathFull)) {
            const data = fs.readFileSync(pathFull + '\\' + file).toString('utf8')
            let timeNum = 1;
            if(data[0]==='m'){
                timeNum = 10;
            }
            if(data[0]==='l'){
                timeNum = 15;
            }
            const todo: ITodo = new Todo({
                name: file.toString().substring(0, file.toString().length - 4),
                description: data.substring(2, data.length - 2),
                initTime: timeNum,
                time: timeNum,
                overtime: 0,
                extra: 0,
            })
            todos.push(todo);
            await todo.save()
        }

        res.status(200).json({ todos })
    } catch (error) {
        throw error
    }
}

const getLongestName = async (req: Request, res: Response): Promise<void> => {
    try {
        let longest = 0;
        for (const file of fs.readdirSync(pathFull)) {
            if(file.toString().length > longest){
                longest = file.toString().length;
            }
        }
        res.status(200).json({ longest })
    } catch (error) {
        throw error
    }
}

const getSize = async (req: Request, res: Response): Promise<void> => {
    try {
        let sizeArr = 0;
        for (const file of fs.readdirSync(pathFull)) {
            sizeArr ++;
            }
        res.status(200).json({ sizeArr })
    } catch (error) {
        throw error
    }
}

const addTodo = async (req: Request, res: Response): Promise<void> => {
    // try {
    //         const body = req.body as Pick<ITodo, 'name' | 'description' | 'status'>
    //
    //         const todo: ITodo = new Todo({
    //             name: body.name,
    //             description: body.description,
    //             status: body.status,
    //         })
    //
    //         const newTodo: ITodo = await todo.save()
    //         const allTodos: ITodo[] = await Todo.find()
    //
    //         res.status(201).json({message: 'Todo added', todo: newTodo, todos: allTodos})
    //
    // } catch (error) {
    //     throw error
    // }
}

const updateTodo = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            params: { id },
            body,
        } = req
        const updateTodo: ITodo | null = await Todo.findByIdAndUpdate(
            { _id: id },
            body
        )
        const allTodos: ITodo[] = await Todo.find()
        res.status(200).json({
            message: 'Todo updated',
            todo: updateTodo,
            todos: allTodos,
        })
    } catch (error) {
        throw error
    }
}

const deleteTodo = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedTodo: ITodo | null = await Todo.findByIdAndRemove(
            req.params.id
        )
        const allTodos: ITodo[] = await Todo.find()
        res.status(200).json({
            message: 'Todo deleted',
            todo: deletedTodo,
            todos:allTodos,
        })
    } catch (error) {
        throw error
    }
}

export { getTodos, addTodo, updateTodo, deleteTodo , getLongestName, getSize}
