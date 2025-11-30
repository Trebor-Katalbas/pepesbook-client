import React, { useCallback, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Image,
  Button,
  useColorModeValue,
  Input,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { CiCircleRemove } from "react-icons/ci";
import { MdOutlineFileUpload } from "react-icons/md";

const ImageUpload = ({ onImageSelect, selectedImage, onRemoveImage }) => {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        onImageSelect(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
  });

  const handleRemove = () => {
    onRemoveImage();
    setPreview(null);
  };

  const dropzoneBg = useColorModeValue("gray.50", "gray.700");
  const activeDropzoneBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.300", "gray.600");

  return (
    <VStack spacing={4} width="100%">
      {preview || selectedImage ? (
        <Box position="relative" width="100%">
          <Image
            src={preview || selectedImage}
            alt="Preview"
            borderRadius="md"
            maxH="300px"
            objectFit="cover"
            width="100%"
          />
          <Button
            position="absolute"
            top={2}
            right={2}
            size="sm"
            colorScheme="red"
            onClick={handleRemove}
          >
            <CiCircleRemove />
          </Button>
        </Box>
      ) : (
        <Box
          {...getRootProps()}
          border="2px dashed"
          borderColor={isDragActive ? "blue.400" : borderColor}
          borderRadius="lg"
          p={6}
          width="100%"
          textAlign="center"
          cursor="pointer"
          bg={isDragActive ? activeDropzoneBg : dropzoneBg}
          transition="all 0.2s"
          _hover={{
            borderColor: "blue.400",
            bg: activeDropzoneBg,
          }}
        >
          <Input {...getInputProps()} />
          <VStack spacing={3}>
            <MdOutlineFileUpload />
            <Text fontSize="lg" fontWeight="medium">
              {isDragActive
                ? "Drop the image here"
                : "Drag & drop an image here"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              or click to browse files
            </Text>
            <Text fontSize="xs" color="gray.400">
              Supports: JPG, PNG, GIF, WebP
            </Text>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default ImageUpload;
