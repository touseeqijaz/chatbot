// pages/chat.js
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const dummyResponses = {
    hello: `**Welcome to Adriana!** 👋  \n\nI'm Adriana, your assistant. Here’s what I can do for you:  \n\n✅ **Order Tracking** – Check your order status in seconds.  \n✅ **Quote Generation** – Get a price estimate for your order.  \n✅ **Browse Products** – Browse products, customize design and place order?  \n\nLet me know how I can assist you today. 😊`,
    default: "Thank you for your question. Our team will respond shortly.",
    shipping: "Standard shipping takes 3-5 business days. Express options available.",
    payment: "We accept credit cards, PayPal, and bank transfers.",
    products: "Here are our catgory of our products, which one you want to customized.",
    quote: "We'll prepare your quote within 24 hours.",
    image: "Thank you for sharing the image! We've received it.",
    quantity: "Sure! How many mugs do you need?",
    color: "Got it! Do you have any color preferences?",
    wantLogo: "Would you like to add a logo?",
    uploadLogo: "please upload your logo!",
    logoPast: "Logo received! Where should the logo be placed?",
    calculate: "Based on your choices, the price is $3.50 per mug. Your total comes to $700. Would you like a detailed quote?",
    giveEmail: "Sending it to your email. Please confirm your email address",
    track_order: "Please provide tracking Id which you want to track!",
    dummy_track: "Your order are pending, Please conform your order by visiting your email"

};

const suggestedQuestions = {
    hello: ['Quote Generation', 'Order Tracking', 'Browse Products'],
    shipping: ['What are shipping costs?', 'International shipping?', 'Track my package'],
    payment: ['Is payment secure?', 'Do you accept crypto?', 'Payment plans?'],
    products: ['Cup', 'Mug'],
    quantity: ["50", "100", "200"],
    color: ['Red', 'Blue', "Green"],
    logoPast: ['Front', 'Back', "Both"],
    wantLogo: ['Yes', 'No, Without Image'],
    calculate: ['Yes, I want detailed quote', 'No'],
    track_order:["1741097191", "1741097213"]
};

const productCategories = {
    category: [
        { id: 1, name: "Cup", price: "$1499", color: ["red", "blue", "green"] },
        { id: 2, name: "Mug", price: "$1299", color: ["red", "yellow", "green"] }
    ]
};

export default function ChatComponent() {
    const router = useRouter();
    const searchParams = useSearchParams()
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const initialized = useRef(false);
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const messageParam = searchParams.get('message')
    const [orderDetails, setOrderDetails] = useState({
        product: '',
        color: '',
        quantity: '',
        logo: null,
        logoPlacement: '',
        email: '',
        pricePerUnit: null,
    });

    useEffect(() => {
        if (!initialized.current && messageParam) {
            initialized.current = true;
            handleNewMessage(messageParam);
        }
    }, [messageParam]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleNewMessage = (message) => {
        const newMessage = {
            text: message,
            isBot: false,
            image: selectedImage,
            products: []
        };

        setMessages(prev => [...prev, newMessage]);

        setTimeout(() => {
            const botResponse = getBotResponse(message);
            const botMessage = {
                ...botResponse,
                isBot: true
            };

            setMessages(prev => [...prev, botMessage]);
            setSuggestions(botResponse.suggestions);
        }, 1000);

        setSelectedImage(null);
        setInput('');
    };

    const getBotResponse = (message) => {
        const lowerMsg = message.toLowerCase();
        const response = { text: '', suggestions: [], products: [] };

        switch (true) {
            case lowerMsg === 'hello':
                response.text = dummyResponses.hello;
                response.suggestions = suggestedQuestions.hello;
                break;
            case lowerMsg.includes('shipping'):
                response.text = dummyResponses.shipping;
                response.suggestions = suggestedQuestions.shipping;
                break;
            case lowerMsg.includes('payment'):
                response.text = dummyResponses.payment;
                response.suggestions = suggestedQuestions.payment;
                break;
            case lowerMsg.includes('track'):
                response.text = dummyResponses.track_order;
                response.suggestions = suggestedQuestions.track_order;
                break;
            case lowerMsg.includes('1741097191') || lowerMsg.includes('1741097213'):
                response.text = dummyResponses.dummy_track;
                break;
            case lowerMsg.includes('product') || lowerMsg.includes('show'):
                response.text = dummyResponses.products;
                response.products = productCategories[lowerMsg.includes('category') ? 'category' : 'category'];
                response.suggestions = suggestedQuestions.products;
                break;
            case lowerMsg.includes('cup') || lowerMsg.includes('mug'):
                const selectedProduct = productCategories.category.find(p =>
                    p.name.toLowerCase() === message.toLowerCase()
                );

                if (selectedProduct) {
                    setOrderDetails(prev => ({
                        ...prev,
                        product: message,
                        pricePerUnit: selectedProduct.price // Store the price
                    }));
                }
                response.text = dummyResponses.quantity;
                response.suggestions = suggestedQuestions.quantity;
                break;

            case lowerMsg.includes('50') || lowerMsg.includes('100') || lowerMsg.includes('200'):
                setOrderDetails(prev => ({ ...prev, quantity: message }));
                response.text = dummyResponses.color;
                response.suggestions = suggestedQuestions.color;
                break;

            case lowerMsg.includes('red') || lowerMsg.includes('blue') || lowerMsg.includes('green'):
                setOrderDetails(prev => ({ ...prev, color: message }));
                response.text = dummyResponses.wantLogo;
                response.suggestions = suggestedQuestions.wantLogo;
                break;

            case lowerMsg === 'yes':
                response.text = dummyResponses.uploadLogo;
                break;

            case lowerMsg === 'yes, i want detailed quote':
                response.text = dummyResponses.giveEmail;
                break;

            case lowerMsg.includes('logo'):
                response.text = dummyResponses.logoPast;
                response.suggestions = suggestedQuestions.logoPast;
                break;

            case lowerMsg === 'front' || lowerMsg === 'back' || lowerMsg === 'both' || lowerMsg === 'no, without image':
                setOrderDetails(prev => ({ ...prev, logoPlacement: message }));
                const quantity = parseInt(orderDetails.quantity, 10) || 1;
                const pricePerUnit = parseFloat(orderDetails.pricePerUnit.replace("$", "")) || 0;
                response.text = `Based on your choices, the price is $${(pricePerUnit).toFixed(2)} per ${orderDetails.product}. Your total comes to $${pricePerUnit * quantity}.`;;
                response.suggestions = suggestedQuestions.calculate;
                break;

            // Add email validation case
            case /\S+@\S+\.\S+/.test(lowerMsg):
                (async () => {
                    const updatedOrderDetails = {
                        ...orderDetails,
                        email: message
                    };

                    setOrderDetails(updatedOrderDetails);

                    // Prepare request payload
                    const payload = {
                        product_name: updatedOrderDetails.product,
                        quantity: updatedOrderDetails.quantity,
                        color: updatedOrderDetails.color,
                        logo_added: updatedOrderDetails.logo ? "Yes" : "No",
                        logo_placement: updatedOrderDetails.logoPlacement,
                        price_per_unit: updatedOrderDetails.pricePerUnit,
                        total_price: (parseFloat(updatedOrderDetails.pricePerUnit) || 0) * (parseInt(updatedOrderDetails.quantity) || 1)
                    };

                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_CHATBOT}/place-order/`, {
                            method: "POST",
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(payload)
                        });

                        const data = await res.json();
                        console.log("Order placed successfully:", data);

                        response.text = "Thank you! Your order has been placed successfully. 🎉";

                    } catch (error) {
                        console.error("Error placing order:", error);
                        response.text = "Oops! Something went wrong while placing your order. Please try again.";
                    }
                    setOrderDetails(prev => ({ ...prev }));
                })();
                response.text = "Order placed successfully";
                break;

            default:
                response.text = dummyResponses.default;
        }

        return response;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
                setOrderDetails(prev => ({
                    ...prev,
                    logo: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() && !selectedImage) return;
        handleNewMessage(input || "Here is the Logo");
    };

    return (
        <div className="h-screen bg-[#000000] md:p-[20px]">
            <div className="w-full grid gap-[20px] grid-rows-[61px_1fr_56px] h-full mx-auto">
                <div className='flex justify-between items-center border-b pb-[20px] border-[#181818]'>
                    <button
                        onClick={() => router.push('/')}
                        className="text-white hover:text-gray-300 flex items-center gap-[10px]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width={'15px'} fill='#ffffff'><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" /></svg>
                        Back
                    </button>
                    <span className='w-[40px] h-[40px] rounded-[50%] bg-[#181818] flex justify-center items-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="12px" fill='#ffffff'><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" /></svg>
                    </span>
                </div>

                <div className="h-full p-[20px] overflow-y-auto mb-6 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] p-4 rounded-lg ${msg.isBot ? 'bg-[#252525]' : 'bg-[#141414]'
                                }`}>
                                {msg.image && (
                                    <img
                                        src={msg.image}
                                        alt="Uploaded"
                                        className="mb-2 rounded-lg max-h-40 object-cover"
                                    />
                                )}
                                <p className="text-white">
                                    {msg.text.split("\n").map((line, index) => (
                                        <p key={index}>
                                            {line}
                                            <br />
                                        </p>
                                    ))}
                                </p>

                                {msg.products?.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {msg.products.map(product => (
                                            <div key={product.id} className="p-4 bg-[#181818] rounded-lg">
                                                <div className="h-32 bg-[#252525] rounded-lg mb-2"></div>
                                                <h3 className="text-white font-bold">{product.name}</h3>
                                                <p className="text-gray-400 text-sm">{product.specs}</p>
                                                <p className="text-blue-400 mt-2">{product.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {msg.suggestions?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {msg.suggestions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleNewMessage(q)}
                                                className="px-3 py-1 text-sm bg-[#181818] text-white rounded-full hover:bg-[#252525]"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2 bg-[#141414] p-2 rounded-full">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedImage ? 'bg-[#000000]' : 'bg-[#181818] hover:bg-[#252525]'
                            }`}
                    >
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent text-white px-4 outline-none"
                    />

                    <button
                        type="submit"
                        className="w-10 h-10 bg-[#2c2c2c] rounded-full flex items-center justify-center hover:bg-blue-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-white">
                            <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}