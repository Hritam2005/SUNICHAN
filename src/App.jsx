import React, { useState, useEffect } from 'react';
import { AppShell, Burger, Group, Title, Loader, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Chat from './Chat';
import Login from './Login';
import Sidebar from './Sidebar';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        setCurrentConversationId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Center style={{ height: '100vh' }} className="login-background">
        <Loader color="white" type="bars" />
      </Center>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      className="app-shell-glass"
    >
      <AppShell.Header className="glass-header" withBorder={false}>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="white" />
          <Title order={3} className="liquid-glass-text" style={{ flexGrow: 1 }}>OCG AI</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={0} className="glass-navbar" withBorder={false}>
        <Sidebar 
          currentConversationId={currentConversationId} 
          onSelectConversation={setCurrentConversationId} 
          toggleSidebar={toggle}
        />
      </AppShell.Navbar>

      <AppShell.Main className="app-main-area">
        <Chat 
          currentConversationId={currentConversationId} 
          onSelectConversation={setCurrentConversationId} 
        />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
