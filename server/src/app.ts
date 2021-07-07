import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import todoRoutes from './routes'
const app=express()

const PORT: string | number = process.env.PORT || 4000

app.use(cors())
app.use(todoRoutes)
let meetingLen = 60;

app.get('/meetingLen', function(req, res) {
    res.status(200).json({meetingLen})
});
app.post('/postMeetingLen', function(req, res) {
    meetingLen = req.body;
    res.status(200).json({meetingLen})
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
