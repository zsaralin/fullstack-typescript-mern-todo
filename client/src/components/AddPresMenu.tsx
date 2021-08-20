import React from 'react'
import './cssFiles/DropdownMenu.css'
import AddPres from "./AddPres";

function AddPresMenu(props: {
    addPresMenu: boolean, toggleAddPresMenu: () => void, bonusActive: boolean,
    handleAddPres: (e: React.FormEvent, formData: IPresenter) => void, presenterWarning: boolean,
}) {
    //returns special case text for addPres functionality
    function dropDownText() {
        if ((props.bonusActive)) {
            return 'Unable to add presenters during bonus time'
        } else {
            return 'Presenter already in meeting!'
        }
    }

    return (
        <div className="dropdownMenu">
            <div className="addPresMenu" style={{display: !props.addPresMenu ? 'none' : ''}}>
                <AddPres addPres={props.handleAddPres}/>
                <button className="xOutSettingsBar" onClick={props.toggleAddPresMenu}>x</button>
            </div>
            <div className='addPresMenu'
                 style={{
                     width: 'fit-content', opacity: !props.presenterWarning ? 0 : '100%',
                     transition: !props.presenterWarning ? 'opacity 5s' : 'opacity 1s'
                 }}> {dropDownText()}</div>
        </div>)
}

export default AddPresMenu
