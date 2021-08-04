import express from 'express'
import mongoose, {Model} from 'mongoose'

import todoRoutes from './routes'
const app=express()
const cors = require("cors")

app.use(cors())
var Schema = mongoose.Schema
const PORT: string | number = process.env.PORT || 4000
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use( bodyParser.json() );
app.use(cors())
app.use(todoRoutes)

const numberSchema = new Schema({
    integerOnly: {
        type: Number,
        default: 100,
        // get: (v: number) => Math.round(v),
    }
});
const Number2: any = mongoose.model('Number2', numberSchema);
const doc = new Number2();
// let meetingLen = doc.integerOnly.get();
app.get('/meetingLen',function(req, res) {
    // let num = doc.get();
    try{
    let meetingLen = doc.integerOnly;
    res.status(200).json({meetingLen})
    } catch (error) {
        throw error
    }
    // return num;
});
app.post('/postMeetingLen', urlencodedParser, function(req, res) {
    try{
        let meetingLen = req.body.meetingLen;
        doc.integerOnly = meetingLen;
        // doc.update({integerOnly:req.body.data})
        // let something = 90;
        res.status(200).json(meetingLen)
    } catch (error) {
        throw error
    }
});

const uri: string = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.07m5b.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
const options = { useNewUrlParser: true, useUnifiedTopology: true }
mongoose.set('useFindAndModify', false)

mongoose
    .connect(uri, options)
    .then(() =>
        app.listen(PORT, () =>
            console.log(`Server running on http://localhost:${PORT}`)
        )
    )
    .catch((error) => {
        throw error
    })
