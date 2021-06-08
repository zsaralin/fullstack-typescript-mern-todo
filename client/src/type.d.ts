type TodoProps = {
    todo: ITodo
    active: boolean
    done: boolean
}


type ApiDataType = {
    message: string
    status: boolean
    todos: ITodo[]
    todo?: ITodo
  }

interface ITodo {
    _id: string
    name: string
    description: string
    time: number
    overtime: number
    status: boolean
    createdAt?: string
    updatedAt?: string
}