import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ActionIcon, Alert, Avatar, Box, Group, Paper, ScrollArea, Text, TextInput, useMantineTheme } from '@mantine/core';
import { IconAlertCircle, IconArrowRight, IconUser, IconRobot } from '@tabler/icons-react';

// Get the API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI;
let model;

// Initialize the Generative AI client only if the API key is available
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

function Chat() {
  const theme = useMantineTheme();
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
    if (!GEMINI_API_KEY) {
      setError('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
      return;
    }

    const q = query(collection(db, 'chats'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMessages(msgs);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Could not connect to the chat service. Please check your Firestore setup and security rules.");
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '' || loading) return;

    const userMessage = {
      text: input,
      sender: 'user',
      createdAt: serverTimestamp(),
    };

    setLoading(true);
    setInput('');

    try {
      await addDoc(collection(db, 'chats'), userMessage);

      const result = await model.generateContent(input);
      const response = await result.response;
      const text = await response.text();

      const botMessage = {
        text,
        sender: 'bot',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'chats'), botMessage);

    } catch (err) {
      console.error('Error sending message or getting response:', err);
      const errorMessage = {
        text: `Sorry, something went wrong. Error: ${err.message}`,
        sender: 'bot',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'chats'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" radius="md">
        {error}
      </Alert>
    );
  }

  return (
    <Box
      style={{
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: theme.colors['deep-space'][8],
        borderRadius: theme.radius.md,
        boxShadow: theme.shadows.xl,
      }}
    >
      <ScrollArea style={{ flexGrow: 1 }} viewportRef={viewport} p="lg">
        {messages.map((msg, index) => (
          <Box key={msg.id} className="message-enter">
            <Group gap="sm" align="flex-start" wrap="nowrap" style={{ flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
              <Avatar
                size="lg"
                radius="xl"
                color={msg.sender === 'user' ? theme.primaryColor : 'gray'}
              >
                {msg.sender === 'user' ? <IconUser /> : <IconRobot />}
              </Avatar>
              <Paper
                shadow="lg"
                p="md"
                radius="xl"
                style={{
                  background: msg.sender === 'user' ? `linear-gradient(45deg, ${theme.colors['ocean-blue'][5]}, ${theme.colors['ocean-blue'][3]})` : theme.colors['deep-space'][6],
                  color: 'white',
                  maxWidth: '85%',
                }}
              >
                <Text>{msg.text}</Text>
              </Paper>
            </Group>
          </Box>
        ))}
        {loading && <Text size="sm" c="dimmed">AI is thinking...</Text>}
      </ScrollArea>
      <Group p="lg" gap="md">
        <TextInput
          style={{ flexGrow: 1 }}
          placeholder="Message OCG AI..."
          value={input}
          onChange={(event) => setInput(event.currentTarget.value)}
          onKeyPress={(event) => event.key === 'Enter' && sendMessage()}
          disabled={loading}
          radius="xl"
          size="lg"
        />
        <ActionIcon variant="gradient" gradient={{ from: 'ocean-blue', to: 'cyan' }} size="xl" radius="xl" onClick={sendMessage} loading={loading}>
          <IconArrowRight />
        </ActionIcon>
      </Group>
    </Box>
  );
}

export default Chat;
