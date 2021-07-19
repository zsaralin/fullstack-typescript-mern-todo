import axios, {AxiosResponse} from 'axios'

const baseUrl: string = 'http://localhost:4000'

export const getTodos = async (): Promise<AxiosResponse<ApiDataType>> => {
  try {
    const todos: AxiosResponse<ApiDataType> = await axios.get(
      baseUrl + '/todos'
    )
    return todos
  } catch (error) {
    throw new Error(error)
  }
}

export const addTodo = async (
    formData: ITodo
): Promise<AxiosResponse<ApiDataType>> => {
  try {
    const todo: Omit<ITodo, '_id'> = {
      name: formData.name,
      description: formData.description,
      time: formData.time*1000,
      initTime: formData.time*1000,
      nonCompressedTime: formData.time*1000,
      overtime: 0,
      extra:0,
    }
    return await axios.post(
        baseUrl + '/add-todo',
        todo
    )
  } catch (error) {
    throw new Error(error)
  }
}

export const getMeetingLen = async (): Promise<AxiosResponse<ApiDataType>> => {
  try {
    return await axios.get(
        baseUrl + '/meetingLen'
    )
  } catch (error) {
    throw new Error(error)
  }
}
export const postMeetingLen = async (meetingLen:number): Promise<void> => {
  try {
    return await axios.post(
        baseUrl + '/postMeetingLen', {meetingLen:meetingLen},
    )
  } catch (error) {
    throw new Error(error)
  }
}
export const deleteTodo = async (
    _id: string
): Promise<AxiosResponse<ApiDataType>> => {
  try {
    const deletedTodo: AxiosResponse<ApiDataType> = await axios.delete(
        `${baseUrl}/delete-todo/${_id}`,
    )
    return deletedTodo
  } catch (error) {
    throw new Error(error)
  }
}

export const getTodos2 = async (): Promise<AxiosResponse<ApiDataType>> => {
  try {
    const todos: AxiosResponse<ApiDataType> = await axios.get(
        baseUrl + '/todos2'
    )
    return todos
  } catch (error) {
    throw new Error(error)
  }
}