import React, {useState} from 'react'
import './cssFiles/ToggleButton.css'

const ToggleButton = () => {
    const [toggle, setToggle] = useState(false);
    const triggerToggle = () => {
        setToggle( !toggle )
    }
    return(
        <div onChange={triggerToggle} className={`wrg-toggle ${toggle ? 'wrg-toggle--checked' : ''}`}>
            <div className="wrg-toggle-container">
                <div className="wrg-toggle-check">
                    <span>ON</span>
                </div>
                <div className="wrg-toggle-uncheck">
                    <span>OFF</span>
                </div>
            </div>
            <div className="wrg-toggle-circle"></div>
            <input className="wrg-toggle-input" type="checkbox" aria-label="Toggle Button" />
        </div>
    )
}

export default ToggleButton;