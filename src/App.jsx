import React, { useState, useEffect } from 'react';
import { AppShell, Burger, Group, Title, Loader, Center, Badge, Affix, Transition, Notification, ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Chat from './Chat';
import Login from './Login';
import Sidebar from './Sidebar';
import { IconAlertCircle, IconCheck, IconSun, IconMoon } from '@tabler/icons-react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [opened, { toggle }] = useDisclosure();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [apiStatus, setApiStatus] = useState('ok'); // 'ok' or 'exhausted'
  const [showApiAlert, setShowApiAlert] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

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
          <ActionIcon
            onClick={() => toggleColorScheme()}
            size="md"
            variant="transparent"
            style={{ color: 'var(--text-main)', transition: 'color 0.3s' }}
          >
            {colorScheme === 'dark' ? <IconSun size="1.2rem" /> : <IconMoon size="1.2rem" />}
          </ActionIcon>
          {apiStatus === 'ok' ? (
             <Badge color="green" variant="light" size="sm" leftSection={<IconCheck size="0.8rem" />}>API Online</Badge>
          ) : (
             <Badge color="red" variant="filled" size="sm" leftSection={<IconAlertCircle size="0.8rem" />}>API Limit Reached</Badge>
          )}
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
          onApiStatusChange={(status) => {
            if (status === 'exhausted' && apiStatus !== 'exhausted') {
              setShowApiAlert(true);
            }
            setApiStatus(status);
          }}
        />
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition="slide-up" mounted={showApiAlert}>
            {(transitionStyles) => (
              <div style={transitionStyles}>
                <Notification 
                  icon={<IconAlertCircle size="1.2rem" />} 
                  color="red" 
                  title="API Limit Exhausted"
                  onClose={() => setShowApiAlert(false)}
                  withBorder
                  style={{ background: 'rgba(250, 82, 82, 0.1)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(250, 82, 82, 0.4)' }}
                >
                  The AI service quota has been reached. Please wait a little while before sending more messages.
                </Notification>
              </div>
            )}
          </Transition>
        </Affix>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
