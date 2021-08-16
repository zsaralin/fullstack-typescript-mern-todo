type ApiDataType = {
    message: string
    pres: IPresenter[]
    presenter?: IPresenter
  }

interface IPresenter {
    _id: string
    name: string
    description: string
    initTime: number
    time: number
    nonCompressedTime: number
    overtime: number
    extra: number
}