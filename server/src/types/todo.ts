import { Document } from 'mongoose'

export interface ITodo extends Document {
    name: string
    description: string
    status: boolean
    index: number
    overtime: number
    extra: number
}