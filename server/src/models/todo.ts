import { ITodo } from './../types/todo';
import { model, Schema } from 'mongoose'

const todoSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    initTime: {
        type: Number,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    overtime: {
        type: Number,
        required: true,
        default: 0,
    },
    extra: {
        type: Number,
        required: true,
        default: 0,
    },
    nonCompressedTime: {
        type: Number,
        required: true
    },
}, { timestamps: true })


export default model<ITodo>('Todo', todoSchema)