'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ChatInterface() {
    const [messages, setMessages] = useState([]);

    const router = useRouter();
    const [input, setInput] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!input.trim()) return;
      router.push(`/chat?message=${encodeURIComponent(input)}`);
    };

    const predefinedQuestions = [
        'How long does shipping take?',
        'What payment methods do you accept?',
        'Can I modify my order?'
    ];

    return (
        <div className="max-w-4xl w-full m-auto p-4 pt-0 rounded-xl">
        <div className='flex justify-between items-center border-b pb-[20px] mb-[30px] border-[#181818]'> 
            <span></span>
            <span className='w-[40px] h-[40px] rounded-[50%] bg-[#181818] flex justify-center items-center'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="12px" fill='#ffffff'><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>
            </span>
        </div>
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-[2rem] font-[500] text-white">Good Morning!</h1>
                <p className="text-[#aaaaaa] text-[1rem]">Alex Williamson</p>
            </div>

            {/* Service Boxes */}
            <h2 className='text-[1.2rem] mt-[40px] font-[500] text-white mb-[10px]'>Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div onClick={()=> router.push(`/chat?message=Hello`)} className="p-6 bg-[#0c0c0c] rounded-xl transition cursor-pointer">
                    <h3 className="text-[1.1rem] font-[600] text-white">Get Quote</h3>
                    <p className="text-sm text-[#bdbdbd] mt-2">Request a personalized quote</p>
                </div>
                <div onClick={()=> router.push(`/chat?message=How do I track my order?`)} className="p-6 bg-[#0c0c0c] rounded-xl transition cursor-pointer">
                    <h3 className="text-[1.1rem] font-[600] text-white">Track Order</h3>
                    <p className="text-sm text-[#bdbdbd] mt-2">Check your order status</p>
                </div>
                <div onClick={()=> router.push(`/chat?message=Show me products`)} className="p-6 bg-[#0c0c0c] rounded-xl transition cursor-pointer">
                    <h3 className="text-[1.1rem] font-[600] text-white">Products</h3>
                    <p className="text-sm text-[#bdbdbd] mt-2">Browse our catalog</p>
                </div>
            </div>

            {/* Chat Container */}
            <div className="rounded-xl">
                {/* Messages Area */}
                <div className="overflow-y-auto mb-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] p-4 rounded-lg ${msg.isBot ? 'bg-white' : 'bg-blue-100'}`}>
                                <p className={msg.isBot ? 'text-white' : 'text-blue-800'}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Large Chat Input */}
                <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_40px] items-center bg-[#141414] p-[5px_20px] rounded-[30px]">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message here..."
                        className="text-[#fdfdfd] placeholder:opacity-60 bg-transparent w-full outline-none border-none border rounded-lg resize-none h-[30px] text-[14px] pl-[10px]"
                    />
                    <button
                        type="submit"
                        className="h-[40px] flex justify-center items-center text-white rounded-lg transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height={"20px"} fill='#ffffff' viewBox="0 0 512 512"><path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/></svg>
                    </button>
                </form>

                {/* Predefined Questions */}
                <div className="flex justify-center flex-wrap items-center gap-2 mt-4">
                    {predefinedQuestions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => setInput(question)}
                            className="p-[10px_20px] text-sm bg-[#131313] rounded-[30px] text-center text-white"
                        >
                            {question}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}