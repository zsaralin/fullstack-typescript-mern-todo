import { Document } from 'mongoose'

export interface IPresenter extends Document {
    name: string
    description: string
    time: number
    initTime: number
    nonCompressedTime: number
    overtime: number
    extra: number
}