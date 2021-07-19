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
exports.getTodos2 = exports.deleteTodo = exports.updateTodo = exports.addTodo = exports.getTodos = void 0;
const todo_1 = __importDefault(require("../../models/todo"));
const fs_1 = __importDefault(require("fs"));
const pathFull = "C:\\Users\\Saralin\\IdeaProjects\\fullstack-typescript-mern-todo\\Meeting\\";
const getTodos2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield todo_1.default.find();
        res.status(200).json({ todos });
    }
    catch (error) {
        throw error;
    }
});
exports.getTodos2 = getTodos2;
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = [];
        let namesList = [];
        let todoList = [];
        let otherList = [];
        let interns = ['Daron', 'Srishti', 'Matthew', 'Vikram', 'Saralin', 'Damien', 'Tobias', 'Karthik', 'Michael'];
        let fullTimers = ['Jo', 'Kendra', 'Qian', 'Bon', 'David'];
        let finalWord = ['Fraser', 'Justin'];
        shuffleArray(interns);
        shuffleArray(fullTimers);
        shuffleArray(finalWord);
        let orderList = interns.concat(fullTimers, finalWord);
        for (const file of fs_1.default.readdirSync(pathFull)) {
            if (orderList.includes(file.toString().substring(0, file.toString().length - 4))) {
                namesList.push(file.toString().substring(0, file.toString().length - 4));
                todoList.push(file);
            }
            else {
                otherList.push(file);
            }
        }
        for (let i = 0; i < otherList.length; i++) {
            let file = otherList[i];
            const data = fs_1.default.readFileSync(pathFull + '\\' + file).toString('utf8');
            let todo = createTodo(data, file.toString());
            todos.push(todo);
            // await todo.save()
        }
        for (let i = 0; i < orderList.length; i++) {
            if (namesList.includes(orderList[i])) {
                let file = todoList[namesList.indexOf(orderList[i])];
                const data = fs_1.default.readFileSync(pathFull + '\\' + file).toString('utf8');
                let todo = createTodo(data, file.toString());
                todos.push(todo);
                // await todo.save()
                // todoList.splice(i,1)
            }
        }
        res.status(200).json({ todos });
    }
    catch (error) {
        throw error;
    }
});
exports.getTodos = getTodos;
function createTodo(data, fileName) {
    let timeNum = 5;
    if (data[0] === 'm') {
        timeNum = 10;
    }
    else if (data[0] === 'l') {
        timeNum = 15;
    }
    return new todo_1.default({
        name: fileName.substring(0, fileName.length - 4),
        description: data.substring(2, data.length - 2),
        initTime: timeNum * 1000,
        time: timeNum * 1000,
        nonCompressedTime: timeNum * 1000,
        overtime: 0,
        extra: 0,
    });
}
const addTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const todo = new todo_1.default({
            name: body.name,
            description: body.description,
            time: body.time,
            initTime: body.time,
            nonCompressedTime: body.time,
        });
        // fs.writeFileSync(pathFull + '/'+ body.name + '.txt', addTodoHelper(body.time) + body.description + '^0')
        const newTodo = yield todo.save();
        const allTodos = yield todo_1.default.find();
        res.status(201).json({ message: 'Todo added', todo: newTodo, todos: allTodos });
    }
    catch (error) {
        throw error;
    }
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
