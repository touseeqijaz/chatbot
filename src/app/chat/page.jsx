import React, { Suspense } from 'react'
import ChatComponent from '../components/ChatComponent'

const ChatPage = () => {
  return (
    <>
    <Suspense>
    <ChatComponent/>
    </Suspense>
    </>
  )
}

export default ChatPage
