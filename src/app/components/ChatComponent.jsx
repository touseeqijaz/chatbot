"use client"
import { requestPost, requestPut } from '@/app/actions/server';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner';

const ChatComponent = ({ isSetting, conservationId, conversations, chatChanges, websiteLinks }) => {
    const router = useRouter();
    const chatRef = useRef(null);
    let foundChat = [];
    if (conversations) {
        foundChat = conversations.filter(chat => chat.id === conservationId);
    }
    const [chatHistory, setChatHistory] = useState(foundChat[0]?.chatHistory || []);
    const [chatId, setchatId] = useState(conservationId || "");
    const [message, setMessage] = useState("");
    const [site, setSite] = useState(chatHistory[0]?.site || "");
    const [imgUrl, setImgUrl] = useState([]);
    const [loading, setLoading] = useState({
        btnLoading: false,
        assistantLoading: false,
        upload: false,
    });

    const capitalizeFirstThreeWords = (message) => {
        return message
            .split(' ')
            .slice(0, 3)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
            .join(' ');
    };


    useEffect(() => {
        if (chatChanges) {
            refreshChat();
        }

        if (chatRef.current) {
            setTimeout(() => {
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }, 100);
        }
    }, [chatChanges])


    const refreshChat = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_FRONT}/api/conversations/user/`, {
                cache: 'no-store',
            });
            const data = await res.json();

            let conversations = [];
            if (!data?.error) {
                conversations = data;
            }
            if (conversations) {
                const filterChat = conversations.filter(chat => chat.id === chatId);
                setChatHistory(filterChat[0]?.chatHistory)
                if (chatRef?.current) {
                    setTimeout(() => {
                        chatRef.current.scrollTop = chatRef.current.scrollHeight;
                    }, 1000);
                }
            }


        } catch (error) {
            console.log("chat load error:", error)
        }
    }

    const submitChat = async (role, message, chatId, chatHistory, images, site) => {
        try {
            if (role === "user") {
                setLoading({
                    btnLoading: true,
                    assistantLoading: false,
                    upload: false,
                });
                setImgUrl([]);
            }

            const updatedChatHistory = [
                ...chatHistory,
                { role, message, images, site }
            ];

            if (!chatId) {
                const title = capitalizeFirstThreeWords(message);
                const formData = {
                    title,
                    userId:null,
                    isSetting: isSetting || false,
                    chatHistory: updatedChatHistory
                }
                const res = await requestPost(formData, `${process.env.NEXT_PUBLIC_API_FRONT}/api/conversations`);
                if (res?.chatHistory) {
                    setchatId(res?.id);
                    setChatHistory(res?.chatHistory);
                    if (chatRef.current) {
                        setTimeout(() => {
                            chatRef.current.scrollTop = chatRef.current.scrollHeight;
                        }, 100);
                    }
                    await generateTitle(message, res?.id)
                    await submitAI(message, res?.id, res?.chatHistory, images || [])
                    if (!isSetting) {
                        router.push(`/chatbot/userid/${res?.id}`)
                    }
                }
            }
            else {
                const formData = {
                    chatHistory: updatedChatHistory
                }
                const res = await requestPut(formData, `${process.env.NEXT_PUBLIC_API_FRONT}/api/conversations/${chatId}`);
                if (res?.chatHistory) {
                    setChatHistory(res?.chatHistory)

                    if (chatRef.current) {
                        setTimeout(() => {
                            chatRef.current.scrollTop = chatRef.current.scrollHeight;
                        }, 100);
                    }
                    if (role === "user") {
                        await submitAI(message, res?.id, res?.chatHistory, images || [])
                    }
                }
            }
            setMessage("");
            setLoading({
                btnLoading: false,
                assistantLoading: false,
                upload: false,
            });
        } catch (error) {
            setLoading({
                btnLoading: false,
                assistantLoading: false,
                upload: false,
            });
            console.error(error);
            toast.error("Failed To Update Chat");
        }
    }

    const submitAI = async (message, chatId, chatHistory, images) => {
        try {
            setMessage("");
            const modelFormData = {
                conversationID: chatId,
                userMessage: message,
                isSetting: isSetting || false,
                site,
            }
            setLoading({
                btnLoading: false,
                assistantLoading: true,
                upload: false,
            });
            let callApi = "chat"
            if (isSetting) {
                callApi = "update-system-prompt"
            }
            const resAI = await requestPost(modelFormData, `${process.env.NEXT_PUBLIC_API_CHATBOT}/${callApi}`);
            if (resAI?.response) {
                await submitChat("assistant", resAI?.response, chatId, chatHistory)
            }

        } catch (error) {
            console.log("assistant error", error)
            await submitChat("assistant", "Oops! Something went wrong. Please try again in a moment.", chatId, chatHistory)
        }
    }

    const generateTitle = async (message, chatId) => {
        try {
            setMessage("");
            const modelFormData = {
                message
            }
            setLoading({
                btnLoading: false,
                assistantLoading: true,
                upload: false,
            });
            const resAI = await requestPost(modelFormData, `${process.env.NEXT_PUBLIC_API_CHATBOT}/title`);
            if (resAI?.title) {
                const formData = {
                    title: resAI?.title
                }
                await requestPut(formData, `${process.env.NEXT_PUBLIC_API_FRONT}/api/conversations/${chatId}`);
            }
            else {
                toast.error("Failed To Generate Title!");
            }

        } catch (error) {
            setLoading({
                btnLoading: false,
                assistantLoading: false,
                upload: false,
            });
            toast.error("Failed To Generate Title!");
        }
    }

    return (
        <div className='grid grid-rows-[1fr_70px] md:grid-rows-[1fr_96px] w-full h-full'>
            <div className="p-[20px] lg:p-[32px] flex flex-col w-full overflow-y-auto h-full gap-[24px] scroll-smooth" ref={chatRef}>
                {chatHistory.map((chatMessage, index) => (
                    chatMessage.role === 'assistant' ? (
                        <div key={index} className='max-w-[886px] flex flex-col assistant items-start'>
                            <div className='bg-[#f3f3f3] text-[#333333] p-[8px_16px] rounded-[8px] chat-res' dangerouslySetInnerHTML={{ __html: chatMessage?.message }}></div>
                        </div>
                    ) : (
                        <div key={index} className={`grid grid-cols-[1fr_40px] gap-[16px] w-full max-w-[429px] ml-auto user_message `}>
                            <div className='flex flex-col items-end gap-[8px]'>
                                <p className='p-[8px_15px] rounded-[8px] bg-[#f3f3f3]'>{chatMessage?.message}</p>
                                <span className=" text-[#d30335] text-[12px] font-[400]">{chatMessage?.site}</span>
                            </div>
                            <div className='w-[40px] h-[40px] rounded-[50%] flex overflow-hidden justify-center items-center bg-[#d30335]'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="16px" width="16px" fill='#ffffff'><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z" /></svg>
                            </div>
                        </div>
                    )

                ))}

                {loading?.assistantLoading && <div className='max-w-[886px] flex flex-col assistant items-start'>
                    <div className='bg-[#f3f3f3] p-[8px_16px] rounded-[8px]'><div className="loader"></div></div>
                </div>}
            </div>
            <div className='border-t-1 border-t border-[#f7f7f7] p-[10px_15px] md:p-[24px] grid grid-cols-[1fr] gap-[24px] items-center'>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    submitChat("user", message, chatId, chatHistory, imgUrl, site);
                }} className='grid grid-cols-[120px_1fr] gap-[20px]'>
                    {chatId && !isSetting ? <span className='text-[0.8rem] p-[12px_5px] text-center rounded-[12px] bg-[#0000000d]' alt='to change site, please create new chat'>{site ? site : "not selected"}</span>
                        : <select onChange={(e) => setSite(e.target.value)} value={site} className='text-[0.8rem] p-[12px_5px] text-center rounded-[12px] bg-[#0000000d] cursor-pointer'>
                            <option value="" disabled hidden>Select Website</option>
                            {websiteLinks?.map((link, index) => (
                                <option key={index} value={link}>
                                    {link}
                                </option>
                            ))}
                        </select>}
                    <div className='grid grid-cols-[1fr_24px] p-[12px_20px] rounded-[12px] bg-[#0000000d]'>
                        <input value={message} autoComplete="off" onChange={(e) => setMessage(e.target.value)} className='text-[14px] border-none outline-none bg-transparent w-full' type='text' placeholder="Write Message..." name='usermessage' />
                        <button disabled={!site || !message || loading?.assistantLoading || loading?.btnLoading || loading?.upload} className="disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading?.btnLoading ? <div className="loader"></div> :
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.1401 0.960012L5.11012 3.96001C-0.959883 5.99001 -0.959883 9.30001 5.11012 11.32L7.79012 12.21L8.68012 14.89C10.7001 20.96 14.0201 20.96 16.0401 14.89L19.0501 5.87001C20.3901 1.82001 18.1901 -0.389988 14.1401 0.960012ZM14.4601 6.34001L10.6601 10.16C10.5101 10.31 10.3201 10.38 10.1301 10.38C9.94012 10.38 9.75012 10.31 9.60012 10.16C9.46064 10.0189 9.38242 9.82844 9.38242 9.63001C9.38242 9.43158 9.46064 9.24115 9.60012 9.10001L13.4001 5.28001C13.6901 4.99001 14.1701 4.99001 14.4601 5.28001C14.7501 5.57001 14.7501 6.05001 14.4601 6.34001Z" fill="#d30335" />
                                </svg>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ChatComponent
