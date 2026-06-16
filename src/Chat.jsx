import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db, auth } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ActionIcon, Alert, Avatar, Box, Group, Paper, ScrollArea, Text, TextInput, Title, Center, Button } from '@mantine/core';
import { IconAlertCircle, IconArrowRight, IconUser, IconRobot } from '@tabler/icons-react';

// Get the API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let initialGenAI = null;
let initialModel = null;

if (GEMINI_API_KEY) {
  try {
    initialGenAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    initialModel = initialGenAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  } catch (e) {
    console.error("Failed to initialize Gemini with env key", e);
  }
}

function Chat({ currentConversationId, onSelectConversation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const viewport = useRef(null);
  


  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  };



  // Set up a listener for real-time chat updates from Firestore
  useEffect(() => {
    if (!currentConversationId || !auth.currentUser) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'conversations', currentConversationId, 'messages'),
      orderBy('createdAt')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMessages(msgs);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Could not connect to the chat service. Please check your Firestore setup and security rules.");
    });

    return () => unsubscribe();
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (input.trim() === '' || loading) return;
    if (!auth.currentUser) return;
    
    if (!initialModel) {
      setError('Server configuration error: AI model is not initialized.');
      return;
    }

    const userMessage = {
      text: input,
      sender: 'user',
      createdAt: serverTimestamp(),
    };

    setLoading(true);
    const currentInput = input;
    setInput('');
    setError(null);

    let convId = currentConversationId;
    if (!convId) {
      try {
        const newConvRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'conversations'), {
          title: currentInput.substring(0, 30) + (currentInput.length > 30 ? '...' : ''),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        convId = newConvRef.id;
        if (onSelectConversation) {
          onSelectConversation(convId);
        }
      } catch (err) {
        console.error('Error creating new conversation:', err);
        setError('Could not create a new conversation.');
        setLoading(false);
        return;
      }
    }

    const messagesRef = collection(db, 'users', auth.currentUser.uid, 'conversations', convId, 'messages');

    try {
      await addDoc(messagesRef, userMessage);

      // Format the chat history for context
      const promptContext = messages
        .filter(m => m.text) // Ensure no empty messages
        .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
        .join('\n');
        
      const fullPrompt = promptContext.length > 0 
        ? `Here is the conversation history:\n${promptContext}\n\nUser: ${currentInput}\nAI:` 
        : currentInput;

      const result = await initialModel.generateContent(fullPrompt);
      const response = await result.response;
      const text = await response.text();

      const botMessage = {
        text,
        sender: 'bot',
        createdAt: serverTimestamp(),
      };

      await addDoc(messagesRef, botMessage);

    } catch (err) {
      console.error('Error sending message or getting response:', err);
      
      let userFriendlyMessage = "Sorry, something went wrong. Please try again later.";
      
      // Check for common API token or quota errors
      const errorMsgLower = (err.message || "").toLowerCase();
      if (errorMsgLower.includes('429') || errorMsgLower.includes('quota') || errorMsgLower.includes('exhausted')) {
        userFriendlyMessage = "API token limit exceeded. Please wait a moment and try again, or check your Gemini API quota.";
      } else if (errorMsgLower.includes('api key') || errorMsgLower.includes('unauthorized')) {
        userFriendlyMessage = "API token error. Please check your Gemini API key configuration.";
      }

      const errorMessage = {
        text: userFriendlyMessage,
        sender: 'bot',
        createdAt: serverTimestamp(),
      };
      
      try {
        await addDoc(messagesRef, errorMessage);
      } catch (dbErr) {
        console.error('Error saving error message to db:', dbErr);
      }
      
    } finally {
      setLoading(false);
    }
  };



  return (
    <>


      <Box
        className="chat-container-glass"
        style={{
          height: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Notice" color="red" radius="md" m="md" style={{ background: 'rgba(250, 82, 82, 0.1)', backdropFilter: 'blur(10px)' }}>
            {error}
          </Alert>
        )}
        <ScrollArea style={{ flexGrow: 1 }} viewportRef={viewport} p="lg">
          {messages.length === 0 && !loading && (
            <Center style={{ height: '100%' }}>
              <Text c="dimmed">This is the start of your conversation.</Text>
            </Center>
          )}
          {messages.map((msg, index) => (
            <Box key={msg.id} className="message-enter" mb="md">
              <Group gap="sm" align="flex-end" wrap="nowrap" style={{ flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar
                  size="md"
                  radius="xl"
                  color={msg.sender === 'user' ? 'ocean-blue' : 'gray'}
                  className="glass-avatar"
                >
                  {msg.sender === 'user' ? <IconUser size="1.2rem"/> : <IconRobot size="1.2rem"/>}
                </Avatar>
                <Paper
                  className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}
                  p="md"
                  radius="xl"
                  style={{
                    color: 'white',
                    maxWidth: '85%',
                    borderBottomRightRadius: msg.sender === 'user' ? 4 : 'xl',
                    borderBottomLeftRadius: msg.sender === 'bot' ? 4 : 'xl',
                  }}
                >
                  <Text size="sm">{msg.text}</Text>
                </Paper>
              </Group>
            </Box>
          ))}
          {loading && (
            <Box className="message-enter" mb="md">
               <Group gap="sm" align="flex-end" wrap="nowrap">
                 <Avatar size="md" radius="xl" color="gray" className="glass-avatar"><IconRobot size="1.2rem"/></Avatar>
                 <Paper className="chat-bubble-bot" p="md" radius="xl" style={{ borderBottomLeftRadius: 4 }}>
                   <Text size="sm" className="typing-indicator">...</Text>
                 </Paper>
               </Group>
            </Box>
          )}
        </ScrollArea>
        <Group p="md" gap="sm" className="chat-input-glass">

          <TextInput
            style={{ flexGrow: 1 }}
            placeholder="Message OCG AI..."
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            onKeyPress={(event) => event.key === 'Enter' && sendMessage()}
            disabled={loading}
            radius="xl"
            size="md"
            classNames={{ input: 'glass-input' }}
          />
          <ActionIcon 
            variant="gradient" 
            gradient={{ from: 'ocean-blue', to: 'cyan' }} 
            size="lg" 
            radius="xl" 
            onClick={sendMessage} 
            loading={loading}
            className="glass-send-btn"
          >
            <IconArrowRight size="1.2rem" />
          </ActionIcon>
        </Group>
      </Box>
    </>
  );
}

export default Chat;
