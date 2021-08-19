import React, {useState} from 'react'

type Props = {
    addPres: (e: React.FormEvent, formData: IPresenter | any) => void
}

const AddPres: React.FC<Props> = ({addPres}) => {
    const [options] = React.useState([
        {value: 0, label: ""},
        {value: 5, label: "5"},
        {value: 10, label: '10'},
        {value: 15, label: '15'},
    ]);
    const [formData, setFormData] = useState<IPresenter | {}>()
    const [name, setName] = useState<string>();
    const [description, setDescription] = useState<string>()
    const [time, setTime] = useState<number>();

    //handles text input (name and description)
    const handleInput = (e: React.FormEvent<HTMLInputElement>): void => {
        if (e.currentTarget.id === 'name') {
            setName(e.currentTarget.value)
            setFormData({
                ...formData,
                [e.currentTarget.id]: e.currentTarget.value,
            })
        } else if (e.currentTarget.id === 'description') {
            setDescription(e.currentTarget.value)
            setFormData({
                ...formData,
                [e.currentTarget.id]: e.currentTarget.value,
            })
        }
    }

    //handles option input (time)
    const handleOption = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        setTime(parseInt(e.target.value, 10));
        setFormData({
            ...formData,
            "time": parseInt(e.target.value, 10),
        })
    }

    function onSubmitFn(e: React.FormEvent, formData: {} | IPresenter | undefined) {
        addPres(e, formData);
        setName('')
        setDescription('')
        setTime(0)
    }

    return (
        <form className='Form' onSubmit={(e) => onSubmitFn(e, formData)}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <div>
                    <label htmlFor='name'>Name: </label>
                    <input className='inputMeetingLen' style={{width: '150px'}} value={name}
                           onChange={handleInput} type='text' id='name'/>
                </div>
                <div style={{marginLeft: '10px',}}>
                    <label htmlFor='description'>Description: </label>
                    <input className='inputMeetingLen' style={{width: '400px'}} onChange={handleInput}
                           value={description} type='text' id='description'/>
                </div>
                <div style={{marginLeft: '10px'}}>
                    <label htmlFor='time'>Time: </label>
                    <select style={{backgroundColor: 'rgba(200,200,200,.5)', marginRight: '2px'}}
                            onChange={handleOption} value = {time}>
                        {options.map(item => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select> min
                </div>
                <button className="submitButton" //enable add presenter button once all sections have been filled
                        disabled={name === undefined || description === undefined || time === undefined || time === 0}>Add Presenter
                </button>
            </div>
        </form>
    )
}

export default AddPres
