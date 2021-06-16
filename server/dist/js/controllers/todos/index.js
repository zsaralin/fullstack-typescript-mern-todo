"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSize = exports.getLongestName = exports.deleteTodo = exports.updateTodo = exports.addTodo = exports.getTodos = void 0;
const todo_1 = __importDefault(require("../../models/todo"));
const fs_1 = __importDefault(require("fs"));
const pathFull = "C:\\Users\\Saralin\\IdeaProjects\\fullstack-typescript-mern-todo\\Meeting\\";
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = [];
        for (const file of fs_1.default.readdirSync(pathFull)) {
            const data = fs_1.default.readFileSync(pathFull + '\\' + file).toString('utf8');
            let timeNum = 5;
            if (data[0] === 'm') {
                timeNum = 10;
            }
            if (data[0] === 'l') {
                timeNum = 15;
            }
            const todo = new todo_1.default({
                name: file.toString().substring(0, file.toString().length - 4),
                description: data.substring(2, data.length - 2),
                initTime: timeNum,
                time: timeNum,
                status: false,
                lessThan: false,
                overtime: 0,
                extra: 0,
            });
            todos.push(todo);
            yield todo.save();
        }
        res.status(200).json({ todos });
    }
    catch (error) {
        throw error;
    }
});
exports.getTodos = getTodos;
const getLongestName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let longest = 0;
        for (const file of fs_1.default.readdirSync(pathFull)) {
            if (file.toString().length > longest) {
                longest = file.toString().length;
            }
        }
        res.status(200).json({ longest });
    }
    catch (error) {
        throw error;
    }
});
exports.getLongestName = getLongestName;
const getSize = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let sizeArr = 0;
        for (const file of fs_1.default.readdirSync(pathFull)) {
            sizeArr++;
        }
        res.status(200).json({ sizeArr });
    }
    catch (error) {
        throw error;
    }
});
exports.getSize = getSize;
const addTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.addTodo = addTodo;
const updateTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { params: { id }, body, } = req;
        const updateTodo = yield todo_1.default.findByIdAndUpdate({ _id: id }, body);
        const allTodos = yield todo_1.default.find();
        res.status(200).json({
            message: 'Todo updated',
            todo: updateTodo,
            todos: allTodos,
        });
    }
    catch (error) {
        throw error;
    }
});
exports.updateTodo = updateTodo;
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedTodo = yield todo_1.default.findByIdAndRemove(req.params.id);
        const allTodos = yield todo_1.default.find();
        res.status(200).json({
            message: 'Todo deleted',
            todo: deletedTodo,
            todos: allTodos,
        });
    }
    catch (error) {
        throw error;
    }
});
exports.deleteTodo = deleteTodo;
