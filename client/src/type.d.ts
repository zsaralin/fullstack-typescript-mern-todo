interface TodoProps {
    todo: ITodo
}


type ApiDataType = {
    message: string
    todos: ITodo[]
    todo?: ITodo
  }

interface ITodo {
    _id: string
    name: string
    description: string
    initTime: number
    time: number
    nonCompressedTime: number
    overtime: number
    extra: number
}