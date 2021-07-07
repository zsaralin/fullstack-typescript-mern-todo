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
export const getLongestName = async (): Promise<AxiosResponse<ApiDataType>> => {
  try {
    const longest: AxiosResponse<ApiDataType> = await axios.get(
        baseUrl + '/todos-long'
    )
    return longest
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
export const postMeetingLen = async (meetingLen: number) => {
  try {
    await axios.post(
        baseUrl + '/postMeetingLen', meetingLen
    )
  } catch (error) {
    throw new Error(error)
  }
}