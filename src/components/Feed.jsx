import React from 'react';
import { VStack, Text, Spinner, Center } from '@chakra-ui/react';
import Post from './Post';

const Feed = ({ posts, isLoading }) => {
  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (posts.length === 0) {
    return (
      <Center py={8}>
        <Text color="gray.500" fontSize="lg">
          No posts yet. Be the first to create a post!
        </Text>
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </VStack>
  );
};

export default Feed;