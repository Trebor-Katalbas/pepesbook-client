import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Image,
} from "@chakra-ui/react";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import ProfilePictureUpload from "./ProfilePictureUpload";
import logo from "../assets/pepesbook-logo.png";

const LoginForm = () => {
  const [firstName, setFirstName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const login = useAuthStore((state) => state.login);
  const createUser = useUserStore((state) => state.createUser);
  const updateProfilePicture = useUserStore(
    (state) => state.updateProfilePicture
  );

  const handleImageSelect = (file) => {
    setSelectedImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your first name",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await createUser({
        first_name: firstName,
        profile_pic: null,
      });

      if (selectedImage) {
        try {
          const updatedUser = await updateProfilePicture(
            user.id,
            selectedImage
          );
          login(updatedUser);
        } catch (uploadError) {
          console.error("Profile picture upload failed:", uploadError);
          login(user);
        }
      } else {
        login(user);
      }

      toast({
        title: "Welcome!",
        description: `Hello, ${firstName}! You're now logged in.`,
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      bg="white"
      p={8}
      borderRadius="lg"
      shadow="md"
      border="1px solid"
      borderColor="gray.200"
      maxW="md"
      width="100%"
    >
      <VStack spacing={5}>
        <VStack>
          <Image
            src={logo}
            alt="Pepesbook Logo"
            boxSize="100px"
            borderRadius="md"
          />
          <Heading size="lg">
            Welcome to <span style={{ color: "#0866FF" }}>Pepesbook</span>
          </Heading>
        </VStack>
        <Text color="gray.600" textAlign="center">
          Enter your details to get started and connect with Rizal's history.
        </Text>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={6}>
            <ProfilePictureUpload
              currentUser={{ first_name: firstName, profile_pic: null }}
              onProfilePictureUpdate={handleImageSelect}
              isEditable={true}
            />

            <FormControl isRequired>
              <FormLabel>First Name</FormLabel>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                size="lg"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="100%"
              isLoading={isLoading}
              loadingText="Entering..."
            >
              Enter Pepesbook
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default LoginForm;
