import './ChatApp.css'
import { ThemeContext } from "../hooks/useTheme";
import { useState, useEffect, useRef, useContext } from 'react'
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm' 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { darcula, base16AteliersulphurpoolLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

const ChatApp = ({onGoBack, chats, setChats, activeChat, setActiveChat, onNewChat}) => {

    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState(chats[0]?.messages || []);
    const [showChatList, setShowChatList] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndREf = useRef(null);
    const {theme, toggleTheme} = useContext(ThemeContext);




    const CodeRenderer = ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || "")
        return !inline && match ? (
            <SyntaxHighlighter
                style={theme === 'light' ? base16AteliersulphurpoolLight : darcula}
                language={match[1]}
                PreTag="div"
                showLineNumbers={true} 
                wrapLongLines={true}  
                {...props}
            >
                {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
        ) : (
            <code className={className} {...props}>
                {children}
            </code>
        )
    }

    const handleShowChatList = () => {
        setShowChatList(true);
    }

    const handleEmojiSelect = (emoji) => {
        setInputValue((prev) => (prev + emoji.native));
    }

    const handleHideChatList = () => {
        setShowChatList(false);
    }

    useEffect(() => {
        const activeChatObj = chats.find((chat) => chat.id == activeChat);
        setMessages(activeChatObj ? activeChatObj.messages : [])
    }, [activeChat, chats])

    useEffect(() => {
        if(activeChat) {
            const storedMessages = JSON.parse(localStorage.getItem(activeChat)) || [];
            setMessages(storedMessages);
        }
    }, [activeChat]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const sendMessage = async () => {
        if(inputValue.trim() === '') return;

        const newMessage = {
            type: "prompt", 
            timestamp: ` ${new Date().toLocaleTimeString()}`,
            text: inputValue
        }

        if(!activeChat) {
            onNewChat(inputValue);
            setInputValue('');
        } else {
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);
            localStorage.setItem(activeChat, JSON.stringify(updatedMessages));
            setInputValue('');

            const updatedChats = chats.map((chat) => {
                if(chat.id === activeChat) {
                    return {...chat, messages: updatedMessages};
                }
                return chat;
            });
            setChats(updatedChats);
            localStorage.setItem('chats', JSON.stringify(updatedChats)); 


            try {
                setIsTyping(true);
                const response = await fetch("/api/gemini", {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json",
                    },
                    body: JSON.stringify({ prompt: newMessage, history: messages })
                });

                let newResponse;
    
                if(!response.ok) {
                    newResponse = {
                        type: 'response',
                        timestamp: ` ${new Date().toLocaleTimeString()}`,
                        text: 'Erreur lors de la requete. Veuillez reessayer plus tard.'
                    }
                }
                else {
                    const data = await response.json();
                    console.log("Reponse", data);
                    const chatResponse = data.text;

                    newResponse = {
                        type: 'response',
                        timestamp: ` ${new Date().toLocaleTimeString()}`,
                        text: chatResponse
                    }
                }

                const updatedMessagesWithResponse = [...updatedMessages, newResponse];
                setMessages(updatedMessagesWithResponse);
                localStorage.setItem(activeChat, JSON.stringify(updatedMessagesWithResponse));
                setIsTyping(false)
    
                const updatedChatsWithResponse = chats.map((chat) => {
                    if(chat.id === activeChat) {
                        return {...chat, messages: updatedMessagesWithResponse};
                    }
                    return chat;
                });
                setChats(updatedChatsWithResponse);
                localStorage.setItem('chats', JSON.stringify(updatedChatsWithResponse));

                if(!response.ok) {
                    throw new Error(`Erreur lors de la requete: ${response.status}`)
                }
            }
            catch(error) {
                console.error("Erreur", error);
            }
            
        }
    }

    const handleKeyDown = (e) => {
        if(e.key == "Enter") {
            e.preventDefault();
            sendMessage();
        }
    }

    const handleSelectedChat = (id) => {
        setActiveChat(id);
    }

    const handleDeleteChat = (id) => {
        const updatedChats = chats.filter((chat) => chat.id !=  id);
        setChats(updatedChats);
        localStorage.setItem('chats', JSON.stringify(updatedChats));
        localStorage.removeItem(id);

        if(id == activeChat) {
            const newActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
            setActiveChat(newActiveChat);
        }
    }

    useEffect(() => {
        chatEndREf.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages])

    return (
        <div className="chat-page">
            <div className={`chat-list ${showChatList ? "show" : ""}`}>
                <div className="chat-list-header">
                    <h2>Chat list</h2>
                    <i onClick={() => onNewChat()} className="fas fa-pen"></i>
                    <i className='fas fa-times' onClick={handleHideChatList}></i>
                </div>

                <div className="chat-list-items">{chats.map((chat) => (
                    <div key={chat.id} 
                    onClick={() => handleSelectedChat(chat.id)}
                    className={`chat-list-item ${chat.id === activeChat ? 'active': ''}`} >
                        <h3>{chat.displayId}</h3>
                        <i className="fas fa-trash" 
                            onClick={
                                (e) =>  {
                                    e.stopPropagation();
                                    handleDeleteChat(chat.id);
                                }
                            }>
                        </i>
                    </div>
                ))}</div>

            </div>
            <div className="chat-window">
                <div className="chat-title">
                    <i className='fas fa-bars' onClick={handleShowChatList}></i>
                    <h3>Kinga</h3>
                    <i onClick={onGoBack} className="fas fa-arrow-right" > </i>
                </div>

                <div className="chat">
                    {
                        messages.map((message, index) => (
                            <div key={index} className={message.type === "prompt"? "prompt":"response"}>
                                {message.type === "response" ? (
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]} 
                                        components={{code: CodeRenderer}}
                                    >
                                        {message.text}
                                    </ReactMarkdown>
                                ) : (
                                    message.text
                                )}
                                <span>{message.timestamp}</span>
                            </div>
                        ))
                    }

                    {isTyping && (<div className="typing">Typing...</div>)}
                    <div ref={chatEndREf}></div>
                </div>
                <form className="message-form" onSubmit={(e) => e.preventDefault()}>
                <i className="fas fa-smile" onClick={() => setShowEmoji((prev) => !prev)}></i>
                {showEmoji && 
                (<div className="picker">
                    <Picker data={data} onEmojiSelect={handleEmojiSelect}></Picker>
                </div>)}
                    <input 
                        type="text" 
                        name="message-input"
                        className='message-input'
                        placeholder='Type a prompt...'
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowEmoji(false)}
                    />
                    <i className="fas fa-paper-plane" onClick={sendMessage}></i>
                </form>
            </div>    
        </div>
    )
}

export default ChatApp