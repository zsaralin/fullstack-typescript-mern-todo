import axios, {AxiosResponse} from 'axios'

const baseUrl: string = 'http://localhost:4000'

//get presenters
export const getPres = async (): Promise<AxiosResponse<ApiDataType>> => {
  try {
    const pres: AxiosResponse<ApiDataType> = await axios.get(
      baseUrl + '/pres'
    )
    return pres
  } catch (error) {
    throw new Error(error)
  }
}

export const addPres = async (
    formData: IPresenter
): Promise<AxiosResponse<ApiDataType>> => {
  try {
    const presenter: Omit<IPresenter, '_id'> = {
      name: formData.name,
      description: formData.description,
      time: formData.time,
      initTime: formData.time,
      nonCompressedTime: formData.time,
      overtime: 0,
      extra:0,
    }
    return await axios.post(
        baseUrl + '/add-pres',
        presenter
    )
  } catch (error) {
    throw new Error(error)
  }
}

export const getMeetingLen = async (): Promise<AxiosResponse<ApiDataType>> => {
  try {
    return await axios.get(
        baseUrl + '/meeting-len'
    )
  } catch (error) {
    throw new Error(error)
  }
}
export const postMeetingLen = async (meetingLen:number): Promise<void> => {
  try {
    return await axios.post(
        baseUrl + '/post-meeting-len', {meetingLen:meetingLen},
    )
  } catch (error) {
    throw new Error(error)
  }
}
export const deletePres = async (
    _id: string
): Promise<AxiosResponse<ApiDataType>> => {
  try {
    const deletedPres: AxiosResponse<ApiDataType> = await axios.delete(
        `${baseUrl}/delete-pres/${_id}`,
    )
    return deletedPres
  } catch (error) {
    throw new Error(error)
  }
}

export const getPres2 = async (): Promise<AxiosResponse<ApiDataType>> => {
  try {
    const pres: AxiosResponse<ApiDataType> = await axios.get(
        baseUrl + '/get-pres-2'
    )
    return pres
  } catch (error) {
    throw new Error(error)
  }
}