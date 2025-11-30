import React, { useState } from 'react';
import {
  Box,
  Button,
  Textarea,
  VStack,
  FormControl,
  useToast,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Input,
  Avatar,
  Text
} from '@chakra-ui/react';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import ImageUpload from './ImageUpload';
import { getAbsoluteImageUrl } from '../utils/apiClient';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useAuthStore((state) => state.currentUser);

  const createPost = usePostStore((state) => state.createPost);

  const handleImageSelect = (file) => {
    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content for your post',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await createPost({
        content,
        image: selectedImage
      });
      setContent('');
      setSelectedImage(null);
      onClose();
      toast({
        title: 'Success',
        description: 'Post created successfully!',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    onOpen();
  };

  const handleCloseModal = () => {
    setContent('');
    setSelectedImage(null);
    onClose();
  };

  return (
    <>
      <Box bg="white" p={4} borderRadius="lg" shadow="md">
        <HStack spacing={3}>
          <Avatar 
            size="md" 
            src={getAbsoluteImageUrl(currentUser?.profile_pic)} 
            name={currentUser?.first_name} 
          />
          <Input
            placeholder={`What's on your mind, ${currentUser?.first_name}?`}
            onClick={handleOpenModal}
            readOnly
            cursor="pointer"
            bg="gray.100"
            border="none"
            _hover={{ bg: 'blue.100' }}
            transition="background-color 0.2s"
          />
        </HStack>
      </Box>

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" borderBottom="1px solid" borderColor="gray.200">
            Create Post
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleSubmit}>
            <ModalBody py={4}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={3}>
                  <Avatar 
                    size="md" 
                    src={getAbsoluteImageUrl(currentUser?.profile_pic)} 
                    name={currentUser?.first_name} 
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{currentUser?.first_name}</Text>
                  </VStack>
                </HStack>

                <FormControl>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`What's on your mind, ${currentUser?.first_name}?`}
                    size="lg"
                    minH="150px"
                    border="none"
                    fontSize="xl"
                    _focus={{ border: 'none', boxShadow: 'none' }}
                    resize="none"
                    autoFocus
                  />
                </FormControl>

                <ImageUpload
                  onImageSelect={handleImageSelect}
                  selectedImage={selectedImage}
                  onRemoveImage={handleRemoveImage}
                />
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px solid" borderColor="gray.200">
              <HStack spacing={3} width="100%" justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Add to your post
                </Text>
                <HStack>
                  <Button 
                    variant="outline" 
                    onClick={handleCloseModal}
                    isDisabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isLoading}
                    loadingText="Posting..."
                    isDisabled={!content.trim()}
                  >
                    Post
                  </Button>
                </HStack>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;