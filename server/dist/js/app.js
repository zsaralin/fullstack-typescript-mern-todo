"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const ws_1 = __importDefault(require("ws"));
const app = express_1.default();
var Schema = mongoose_1.default.Schema;
const PORT = process.env.PORT || 4000;
var bodyParser = require('body-parser');
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());
app.use(cors_1.default());
app.use(routes_1.default);
const wss = new ws_1.default.Server({
    port: 8000,
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        // Below options specified as default values.
        concurrencyLimit: 10,
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed.
    }
});
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        wss.clients.forEach(function each(client) {
            if (message.toString() === 'refresh') {
                if (client !== ws && client.readyState === ws_1.default.OPEN) {
                    client.send(message.toString());
                }
            }
            else if (client.readyState === ws_1.default.OPEN) {
                client.send(message.toString());
            }
        });
    });
});
const numberSchema = new Schema({
    integerOnly: {
        type: Number,
        default: 100,
    }
});
const MeetingLen = mongoose_1.default.model('MeetingLen', numberSchema);
const doc = new MeetingLen();
// let meetingLen = doc.integerOnly.get();
app.get('/meeting-len', function (req, res) {
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
app.post('/post-meeting-len', urlencodedParser, function (req, res) {
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
    .then(() => app.listen(process.env.PORT || 4000, () => console.log(`Server running on http://localhost:${PORT}`)))
    .catch((error) => {
    throw error;
});
