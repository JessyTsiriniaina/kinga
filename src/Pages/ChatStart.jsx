import './ChatStart.css';
import ThemeSwitcherButton from '../Components/ThemeSwitherButton';

const ChatStart = ({onStartChat}) => {
    return (
        <div className="start-page">
            <button 
                className="start-page-btn" 
                onClick={onStartChat}>
                Chat
            </button>
            <ThemeSwitcherButton/>
        </div>
    )
}

export default ChatStart;