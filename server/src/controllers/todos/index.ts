import {Request, Response} from 'express'
import {ITodo} from './../../types/todo'
import Todo from '../../models/todo'
import fs from 'fs';

const pathFull = "C:\\Users\\Saralin\\IdeaProjects\\fullstack-typescript-mern-todo\\Meeting\\"
const getTodos2 = async (req: Request, res: Response): Promise<void> => {
    try {
        const todos: ITodo[] = await Todo.find()
        res.status(200).json({ todos })
    } catch (error) {
        throw error
    }
}
function shuffleArray(array:any) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
const getTodos = async (req: Request, res: Response): Promise<void> => {
    try {
        const todos: ITodo[] = [];
        for (const file of fs.readdirSync(pathFull)) {
            const data = fs.readFileSync(pathFull + '\\' + file).toString('utf8')
            let todo = createTodo(data, file.toString())
            todos.push(todo)
            }
        res.status(200).json({todos})
    } catch (error) {
        throw error
    }
}

function createTodo(data: string, fileName: string): ITodo{
    let timeNum = 5;
    if (data[0] === 'm') {
        timeNum = 10;
    }
    else if (data[0] === 'l') {
        timeNum = 15;
    }
    return new Todo({
        name: fileName.substring(0, fileName.length - 4),
        description: data.substring(2, data.length - 2),
        initTime: timeNum * 1000,
        time: timeNum * 1000,
        nonCompressedTime: timeNum * 1000,
        overtime: 0,
        extra: 0,
    });
}

const addTodo = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as Pick<ITodo, 'name' | 'description' | 'time'>
        const todo: ITodo = new Todo({
            name: body.name,
            description: body.description,
            time: body.time,
            initTime: body.time,
            nonCompressedTime: body.time,
            overtime: 0,
            extra: 0,
        })
        // fs.writeFileSync(pathFull + '/'+ body.name + '.txt', addTodoHelper(body.time) + body.description + '^0')
        const newTodo: ITodo = await todo.save()
        const allTodos: ITodo[] = await Todo.find()
        res.status(201).json({message: 'Todo added', todo: newTodo, todos: allTodos})
    } catch (error) {
        throw error
    }
}


const updateTodo = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            params: {id},
            body,
        } = req
        const updateTodo: ITodo | null = await Todo.findByIdAndUpdate(
            {_id: id},
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
            todos: allTodos,
        })
    } catch (error) {
        throw error
    }
}


export {getTodos, addTodo, updateTodo, deleteTodo, getTodos2}
