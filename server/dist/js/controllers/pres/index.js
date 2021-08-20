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
exports.deletePres = exports.addPres = exports.getPresFile = void 0;
const pres_1 = __importDefault(require("../../models/pres"));
const fs_1 = __importDefault(require("fs"));
const pathFull = "C:\\Users\\Saralin\\IdeaProjects\\fullstack-typescript-mern-todo\\Meeting\\";
//add all presenters from txt files (Meeting folder) to database
const getPresFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const file of fs_1.default.readdirSync(pathFull)) {
            const data = fs_1.default.readFileSync(pathFull + '\\' + file).toString('utf8');
            let pres = createPres(data, file.toString());
            yield pres_1.default.deleteMany({ name: pres.name }); //delete any old items with same name
            yield pres.save(); //add new item to database
        }
        const pres = yield pres_1.default.find(); //get updated database
        res.status(200).json({ pres });
    }
    catch (error) {
        throw error;
    }
});
exports.getPresFile = getPresFile;
function createPres(data, fileName) {
    let timeNum = 5;
    if (data[0] === 'm') {
        timeNum = 10;
    }
    else if (data[0] === 'l') {
        timeNum = 15;
    }
    return new pres_1.default({
        name: fileName.substring(0, fileName.length - 4),
        description: data.substring(2, data.length - 2),
        initTime: timeNum,
        time: timeNum,
        nonCompressedTime: timeNum,
        overtime: 0,
        extra: 0,
    });
}
const addPres = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const pres = new pres_1.default({
            name: body.name,
            description: body.description,
            time: body.time,
            initTime: body.time,
            nonCompressedTime: body.time,
            overtime: 0,
            extra: 0,
        });
        // fs.writeFileSync(pathFull + '/'+ body.name + '.txt', addTodoHelper(body.time) + body.description + '^0')
        const newPres = yield pres.save();
        const allPres = yield pres_1.default.find();
        res.status(201).json({ message: 'Presenter added', presenter: newPres, pres: allPres });
    }
    catch (error) {
        throw error;
    }
});
exports.addPres = addPres;
const deletePres = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedPres = yield pres_1.default.findByIdAndRemove(req.params.id);
        if (deletedPres !== null && fs_1.default.existsSync(pathFull + '\\' + deletedPres.name + '.txt')) {
            fs_1.default.unlink(pathFull + '\\' + deletedPres.name + '.txt', function (err) {
                if (err)
                    return console.log(err);
                console.log('file deleted successfully');
            });
        }
        const allPres = yield pres_1.default.find();
        res.status(200).json({
            message: 'Presenter deleted',
            presenter: deletedPres,
            pres: allPres,
        });
    }
    catch (error) {
        throw error;
    }
});
exports.deletePres = deletePres;
