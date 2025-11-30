import React, { useEffect } from 'react';
import { ChakraProvider, Box, Container, VStack } from '@chakra-ui/react';
import { useAuthStore } from './store/authStore.js';
import { usePostStore } from './store/postStore.js';
import LoginForm from './components/LoginForm.jsx';
import Feed from './components/Feed.jsx';
import CreatePost from './components/CreatePost.jsx';
import AppHeader from './components/AppHeader.jsx';

function App() {
  // eslint-disable-next-line
  const { currentUser, isAuthenticated } = useAuthStore();
  const { posts, fetchPosts, isLoading } = usePostStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated, fetchPosts]);

  if (!isAuthenticated) {
    return (
      <ChakraProvider>
        <Box minH="100vh" bg="gray.50" display={'flex'} alignItems={'center'} justifyContent={'center'}>
          <Container maxW="md">
            <LoginForm />
          </Container>
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50">
        <Container maxW="2xl" py={8}>
          <VStack spacing={6} align="stretch">
            <AppHeader />
            <CreatePost />
            <Feed posts={posts} isLoading={isLoading} />
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;