import React, { useState } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Box, Button, Center, Paper, PasswordInput, Text, TextInput, Title, Stack, Group, Divider } from '@mantine/core';
import { IconBrandGoogle, IconMail } from '@tabler/icons-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-background" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper
        className="glass-panel"
        radius="lg"
        p="xl"
        withBorder
        style={{ width: '100%', maxWidth: 450 }}
      >
        <Stack spacing="lg">
          <Center>
            <Title order={2} className="liquid-glass-text" style={{ textAlign: 'center', marginBottom: 10 }}>
              Welcome to OCG AI
            </Title>
          </Center>

          <Text c="dimmed" size="sm" align="center" style={{ marginBottom: 20 }}>
            {isSignUp ? 'Create an account to get started' : 'Sign in to continue to OCG AI'}
          </Text>

          {error && <Text color="red" size="sm" align="center">{error}</Text>}

          <form onSubmit={handleEmailAuth}>
            <Stack>
              <TextInput
                required
                label="Email"
                placeholder="hello@example.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                radius="md"
                className="glass-input"
                styles={{ input: { backgroundColor: 'transparent' } }}
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                radius="md"
                className="glass-input"
                styles={{ input: { backgroundColor: 'transparent' } }}
              />

              <Button
                type="submit"
                fullWidth
                mt="xl"
                radius="md"
                size="md"
                loading={loading}
                className="glass-button primary-glass-btn"
                leftSection={<IconMail size="1.1rem" />}
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Divider label="Or continue with" labelPosition="center" my="md" />

          <Button
            fullWidth
            radius="md"
            size="md"
            variant="default"
            onClick={handleGoogleSignIn}
            loading={loading}
            className="glass-button outline-glass-btn"
            leftSection={<IconBrandGoogle size="1.1rem" />}
          >
            Google
          </Button>

          <Group position="center" mt="md">
            <Text size="sm" c="dimmed">
              {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
              <Text
                component="span"
                style={{ cursor: 'pointer', color: 'var(--mantine-color-ocean-blue-4)' }}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Login;
