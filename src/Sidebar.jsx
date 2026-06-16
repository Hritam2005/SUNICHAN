import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { ActionIcon, Box, Button, Group, NavLink, ScrollArea, Text, Title, useMantineTheme } from '@mantine/core';
import { IconPlus, IconMessageCircle, IconLogout, IconTrash } from '@tabler/icons-react';
import { signOut } from 'firebase/auth';

function Sidebar({ currentConversationId, onSelectConversation, toggleSidebar }) {
  const theme = useMantineTheme();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'conversations'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleNewChat = () => {
    onSelectConversation(null);
    if (window.innerWidth < 768 && toggleSidebar) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleDeleteChat = async (e, convId) => {
    e.stopPropagation(); // Prevent the NavLink click from firing
    if (!auth.currentUser) return;
    
    // Optimistically deselect if we are deleting the active chat
    if (currentConversationId === convId) {
      onSelectConversation(null);
    }

    try {
      // 1. Fetch and delete all messages in the subcollection
      const messagesRef = collection(db, 'users', auth.currentUser.uid, 'conversations', convId, 'messages');
      const messagesSnapshot = await getDocs(query(messagesRef));
      
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(doc(db, 'users', auth.currentUser.uid, 'conversations', convId, 'messages', messageDoc.id))
      );
      await Promise.all(deletePromises);

      // 2. Delete the conversation document itself
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'conversations', convId));
      
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  return (
    <Box className="sidebar-glass" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Group justify="space-between" p="md" className="sidebar-header-glass">
        <Title order={4} className="liquid-glass-text-subtle" style={{ margin: 0 }}>Conversations</Title>
        <ActionIcon variant="subtle" color="gray" onClick={handleNewChat} title="New Chat" className="glass-icon-btn">
          <IconPlus size="1.2rem" />
        </ActionIcon>
      </Group>

      <Button
        variant="gradient"
        gradient={{ from: 'ocean-blue', to: 'cyan' }}
        leftSection={<IconPlus size="1rem" />}
        onClick={handleNewChat}
        m="md"
        radius="md"
        className="glass-button"
      >
        New Chat
      </Button>

      <ScrollArea style={{ flexGrow: 1 }} p="xs">
        {loading ? (
          <Text size="sm" c="dimmed" p="md">Loading...</Text>
        ) : conversations.length === 0 ? (
          <Text size="sm" c="dimmed" p="md" align="center">No conversations yet.</Text>
        ) : (
          conversations.map((conv) => (
            <NavLink
              key={conv.id}
              active={currentConversationId === conv.id}
              label={<Text size="sm" truncate>{conv.title || 'New Conversation'}</Text>}
              leftSection={<IconMessageCircle size="1rem" stroke={1.5} />}
              onClick={() => {
                onSelectConversation(conv.id);
                if (window.innerWidth < 768 && toggleSidebar) {
                  toggleSidebar();
                }
              }}
              rightSection={
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  onClick={(e) => handleDeleteChat(e, conv.id)}
                  title="Delete Chat"
                  size="sm"
                >
                  <IconTrash size="1rem" />
                </ActionIcon>
              }
              variant="light"
              className="glass-nav-link"
              style={{ borderRadius: theme.radius.md, marginBottom: 4 }}
            />
          ))
        )}
      </ScrollArea>

      <Box p="md" className="sidebar-footer-glass">
        <Group wrap="nowrap" justify="space-between">
          <Box style={{ overflow: 'hidden' }}>
            <Text size="sm" fw={500} truncate color="white">{auth.currentUser?.displayName || 'User'}</Text>
            <Text size="xs" c="dimmed" truncate>{auth.currentUser?.email}</Text>
          </Box>
          <ActionIcon variant="subtle" color="red" onClick={handleLogout} title="Logout" className="glass-icon-btn">
            <IconLogout size="1.2rem" />
          </ActionIcon>
        </Group>
      </Box>
    </Box>
  );
}

export default Sidebar;
