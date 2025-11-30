import React, { useCallback, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  Avatar,
  Button,
  useColorModeValue,
  Input,
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCamera, FiCheck } from 'react-icons/fi';

const ProfilePictureUpload = ({ 
  currentUser, 
  onProfilePictureUpdate, 
  size = "xl",
  isEditable = true 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const toast = useToast();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!isEditable) return;
    
    const file = acceptedFiles[0];
    if (file) {
      setIsLoading(true);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      try {
        await onProfilePictureUpdate(file);
        toast({
          title: 'Profile picture updated!',
          status: 'success',
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: 'Error updating profile picture',
          description: error.message,
          status: 'error',
          duration: 3000,
        });
        setPreview(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, [onProfilePictureUpdate, isEditable, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    disabled: !isEditable || isLoading
  });

  const dropzoneBg = useColorModeValue('gray.50', 'gray.700');
  const activeDropzoneBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  const avatarContent = (
    <Avatar
      size={size}
      src={preview || currentUser?.profile_pic}
      name={currentUser?.first_name}
      borderColor="white"
      shadow="md"
    />
  );

  if (!isEditable) {
    return avatarContent;
  }

  return (
    <VStack spacing={3}>
      <Tooltip label="Click or drag & drop to update profile picture" placement="top">
        <Box
          {...getRootProps()}
          position="relative"
          cursor={isLoading ? 'not-allowed' : 'pointer'}
          borderRadius="full"
          _hover={{
            '& .camera-icon': {
              opacity: 1,
            },
            '& .avatar-overlay': {
              opacity: 0.7,
            }
          }}
        >
          <Input {...getInputProps()} />
          
          {avatarContent}
          
          <Box
            className="avatar-overlay"
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="black"
            opacity={0}
            borderRadius="full"
            transition="opacity 0.2s"
          />
          
          <Box
            className="camera-icon"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            opacity={0}
            transition="opacity 0.2s"
          >
            <Icon 
              as={isLoading ? FiCheck : FiCamera} 
              boxSize={6} 
              color="white" 
            />
          </Box>
          
          {isLoading && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.600"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Button
                size="sm"
                isLoading
                loadingText="Uploading"
                variant="ghost"
                color="white"
              />
            </Box>
          )}
        </Box>
      </Tooltip>

      <Box
        {...getRootProps()}
        border="2px dashed"
        borderColor={isDragActive ? 'blue.400' : borderColor}
        borderRadius="lg"
        p={4}
        width="100%"
        textAlign="center"
        cursor={isLoading ? 'not-allowed' : 'pointer'}
        bg={isDragActive ? activeDropzoneBg : dropzoneBg}
        transition="all 0.2s"
        _hover={{
          borderColor: 'blue.400',
          bg: activeDropzoneBg
        }}
      >
        <Input {...getInputProps()} />
        <VStack spacing={2}>
          <Icon as={FiUpload} boxSize={5} color="gray.500" />
          <Text fontSize="sm" fontWeight="medium">
            {isDragActive ? 'Drop your photo here' : 'Update Profile Picture'}
          </Text>
          <Text fontSize="xs" color="gray.500">
            Drag & drop or click to browse
          </Text>
          <Text fontSize="xs" color="gray.400">
            Supports: JPG, PNG, GIF, WebP
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
};

export default ProfilePictureUpload;