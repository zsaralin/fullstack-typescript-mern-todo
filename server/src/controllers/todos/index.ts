import {Response, Request} from 'express'
import {ITodo} from './../../types/todo'
import Todo from '../../models/todo'
import fs from 'fs';
const pathFull = "C:\\Users\\Saralin\\IdeaProjects\\fullstack-typescript-mern-todo\\Meeting\\"

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

        let namesList = [];
        let todoList = [];
        for (const file of fs.readdirSync(pathFull)){
            namesList.push(file.toString().substring(0, file.toString().length - 4));
            todoList.push(file)
        }
        let interns = ['Srishti','Matthew','Vikram','Saralin', 'Damien','Tobias','Karthik','Michael']
        let fullTimers = ['Jo','Kendra', 'Qian', 'Bon', 'David']
        let finalWord = ['Fraser', 'Justin']
        shuffleArray(interns); shuffleArray(fullTimers); shuffleArray(finalWord)
        let orderList = interns.concat(fullTimers, finalWord);
        for(let i=0;i<orderList.length;i++){
            if(namesList.includes(orderList[i])){
                let file = todoList[namesList.indexOf(orderList[i])]
                const data = fs.readFileSync(pathFull + '\\' + file).toString('utf8')
                let timeNum = 5;
                if (data[0] === 'm') {
                    timeNum = 10;
                }
                if (data[0] === 'l') {
                    timeNum = 15;
                }
                const todo: ITodo = new Todo({
                    name: file.toString().substring(0, file.toString().length - 4),
                    description: data.substring(2, data.length - 2),
                    initTime: timeNum * 1000,
                    time: timeNum * 1000,
                    nonCompressedTime: timeNum * 1000,
                    overtime: 0,
                    extra: 0,
                })
                todos.push(todo);
                await todo.save()
            }}

        res.status(200).json({todos})
    } catch (error) {
        throw error
    }
}

const getLongestName = async (req: Request, res: Response): Promise<void> => {
    try {
        let longest = 0;
        for (const file of fs.readdirSync(pathFull)) {
            if (file.toString().length > longest) {
                longest = file.toString().length;
            }
        }
        res.status(200).json({longest})
    } catch (error) {
        throw error
    }
}

function addTodoHelper(time:number): string{
    if(time === 5){
        return 's^';
    }
    else if(time === 10){
        return 'm^';
    }
    else{
        return 'l^';
    }
}
const addTodo = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as Pick<ITodo, 'name' | 'description' | 'time'>
            fs.writeFileSync(pathFull + '/'+ body.name + '.txt', addTodoHelper(body.time) + body.description + '^0')
            res.status(201).json({message: 'Todo added'})
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


export {getTodos, addTodo, updateTodo, deleteTodo, getLongestName}
