import React from 'react'
import './BonusItem.css'

class BonusItem extends React.Component{
    render() {
        return(
        <div className="bottom-panel" >
            <div className="bonus" style={{paddingBottom:8/2 + '%', transition: 8+'s'}}> Bonus Time </div>
            <div className="bonus-time">
                <div className="set-time">
                    8 min</div>
                <div className="real-time">
                    - min</div>
            </div>
        </div>
        )}
}

export default BonusItem