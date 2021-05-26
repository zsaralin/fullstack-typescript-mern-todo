interface ITodo {
    _id: string
    name: string
    description: string
    time: number
    status: true
    createdAt?: string
    updatedAt?: string
}

type TodoProps = {
    todo: ITodo
    active: boolean
}

type ApiDataType = {
    message: string
    status: string
    todos: ITodo[]
    todo?: ITodo
  }
  