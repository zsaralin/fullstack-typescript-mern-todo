import { IPresenter } from '../types/pres';
import { model, Schema } from 'mongoose'

const presSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
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
    },
    extra: {
        type: Number,
        required: true,
    },
    nonCompressedTime: {
        type: Number,
        required: true
    },
}, )


export default model<IPresenter>('Pres', presSchema)