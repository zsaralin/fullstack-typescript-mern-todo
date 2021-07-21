"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const app = express_1.default();
const socketIO = require("socket.io");
var http = require('http');
const server = http.createServer(app);
const io = socketIO(server);
var Schema = mongoose_1.default.Schema;
const PORT = process.env.PORT || 4000;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());
app.use(cors_1.default());
app.use(routes_1.default);
const numberSchema = new Schema({
    integerOnly: {
        type: Number,
        default: 100,
        // get: (v: number) => Math.round(v),
    }
});
const Number2 = mongoose_1.default.model('Number2', numberSchema);
const doc = new Number2();
// let meetingLen = doc.integerOnly.get();
app.get('/', function (req, res) {
    res.sendFile('C:\\Users\\Saralin\\IdeaProjects\\fullstack-typescript-mern-todo\\client\\public\\index.html');
});
app.get('/meetingLen', function (req, res) {
    // let num = doc.get();
    try {
        let meetingLen = doc.integerOnly;
        res.status(200).json({ meetingLen });
    }
    catch (error) {
        throw error;
    }
    // return num;
});
app.post('/postMeetingLen', urlencodedParser, function (req, res) {
    try {
        let meetingLen = req.body.meetingLen;
        doc.integerOnly = meetingLen;
        // doc.update({integerOnly:req.body.data})
        // let something = 90;
        res.status(200).json(meetingLen);
    }
    catch (error) {
        throw error;
    }
});
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.07m5b.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
const options = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose_1.default.set('useFindAndModify', false);
mongoose_1.default
    .connect(uri, options)
    .then(() => server.listen(PORT, () => console.log(`Listening on port ${PORT}`)))
    .catch((error) => {
    throw error;
});
io.on('connection', function (socket) {
    console.log('A user connected');
    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
});
