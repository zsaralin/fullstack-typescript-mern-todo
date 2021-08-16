import { Document } from 'mongoose'

export interface ITodo extends Document {
    name: string
    description: string
    time: number
    initTime: number
    nonCompressedTime: number
    overtime: number
    extra: number
}