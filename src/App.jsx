import React from "react"
import { useState , useEffect} from "react"
import ChatStart from "./Pages/ChatStart"
import ChatApp from "./Pages/ChatApp"
import { v4 as uuidV4 } from "uuid"
import { ThemeProvider } from "./hooks/useTheme"



const App = () => {

    const [isChatting, setIsChatting] = useState(false);
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);

    useEffect(() => {
        const storedChats = JSON.parse(localStorage.getItem('chats')) || [];
        setChats(storedChats);
        if(storedChats.length > 0) {
            setActiveChat(storedChats[0].id);
        }
    }, [])

    const startChat = () => {
        setIsChatting(true);

        if(chats.length === 0) {
            createNewChat();
        }
    }

    const backToStart = () => {
        setIsChatting(false);
    }

    const createNewChat = (initialMessage="") => {
        const newChat = {
            id: uuidV4(),
            displayId: `Chat ${new Date().toLocaleDateString('mg-MG')} ${new Date().toLocaleTimeString()}`,
            messages: initialMessage ? [{type: "prompt", text: initialMessage, timestamp: new Date().toLocaleTimeString()}] : [],
        }

        const updatedChats =  [newChat, ...chats];
        setChats(updatedChats);
        localStorage.setItem('chats', JSON.stringify(updatedChats));
        localStorage.setItem(newChat.id, JSON.stringify(newChat.messages));
        setActiveChat(newChat.id);
    }


    return (
        <ThemeProvider>
            <div className="container">
                {
                    isChatting ? 
                    (<ChatApp 
                        onGoBack={backToStart}
                        chats={chats}
                        setChats={setChats}
                        activeChat={activeChat}
                        setActiveChat={setActiveChat}
                        onNewChat={createNewChat}
                    />) :
                    (<ChatStart 
                        onStartChat={startChat}
                    />)
                }
            </div>
        </ThemeProvider>
    )
}

export default App