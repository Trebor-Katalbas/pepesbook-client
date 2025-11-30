import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Text,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Image,
  Avatar,
  useBreakpointValue,
  VStack,
  Show,
  Hide,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuthStore } from "../store/authStore.js";
import { useUserStore } from "../store/userStore.js";
import ProfilePictureUpload from "./ProfilePictureUpload.jsx";
import { FiCamera, FiEdit2, FiUser } from "react-icons/fi";
import logo from "../assets/pepesbook-logo.png";
import { getAbsoluteImageUrl } from "../utils/apiClient.js";

const AppHeader = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { updateUser: updateUserInStore, updateProfilePicture } = useUserStore();
  const toast = useToast();
  
  const [newFirstName, setNewFirstName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();

  const logoSize = useBreakpointValue({ base: "32px", md: "40px" });
  const headingSize = useBreakpointValue({ base: "md", md: "lg" });
  const padding = useBreakpointValue({ base: 3, sm: 4 });

  const handleProfilePictureUpdate = async (imageFile) => {
    try {
      const updatedUser = await updateProfilePicture(currentUser.id, imageFile);
      updateUser(updatedUser);
      toast({
        title: "Success!",
        description: "Profile picture updated successfully",
        status: "success",
        duration: 3000,
      });
      return updatedUser;
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile picture",
        status: "error",
        duration: 3000,
      });
      throw error;
    }
  };

  const handleRenameUser = async () => {
    if (!newFirstName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (newFirstName.trim() === currentUser?.first_name) {
      onRenameClose();
      return;
    }

    setIsRenaming(true);
    try {
      const updatedUser = await updateUserInStore(currentUser.id, {
        first_name: newFirstName.trim()
      });
      
      updateUser(updatedUser);
      
      toast({
        title: "Success!",
        description: `Name updated to ${newFirstName}`,
        status: "success",
        duration: 3000,
      });
      
      onRenameClose();
      setNewFirstName("");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update name",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const openRenameModal = () => {
    setNewFirstName(currentUser?.first_name || "");
    onRenameOpen();
  };

  return (
    <>
      <Box bg="white" p={padding} borderRadius="lg" shadow="md">
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <HStack spacing={2} flexShrink={0}>
            <Image
              src={logo}
              alt="Pepesbook Logo"
              boxSize={logoSize}
              borderRadius="md"
            />
            <Heading size={headingSize} color="#0866FF">
              Pepesbook
            </Heading>
          </HStack>

          <HStack spacing={2}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={
                  <Avatar
                    size="sm"
                    src={getAbsoluteImageUrl(currentUser?.profile_pic)}
                    name={currentUser?.first_name}
                    icon={<FiUser />}
                  />
                }
                variant="ghost"
                borderRadius="full"
                _hover={{ bg: "gray.100" }}
                aria-label="Profile menu"
                size="sm"
              />
              <MenuList>
                <MenuItem icon={<FiEdit2 />} onClick={openRenameModal}>
                  Change Name
                </MenuItem>
                <MenuItem
                  icon={<FiCamera />}
                  onClick={() =>
                    document.getElementById("profile-upload-input")?.click()
                  }
                >
                  Update Profile Picture
                </MenuItem>
              </MenuList>
            </Menu>

            <input
              id="profile-upload-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleProfilePictureUpdate(file);
                }
              }}
            />

            <Show above="sm">
              <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                {currentUser?.first_name}
              </Text>
            </Show>
            <Hide above="sm"></Hide>
          </HStack>
        </Flex>

        {!currentUser?.profile_pic && (
          <Box
            mt={3}
            p={3}
            bg="blue.50"
            borderRadius="md"
            border="1px dashed"
            borderColor="blue.200"
          >
            <VStack spacing={3}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color="blue.700"
                textAlign="center"
              >
                Add Profile Picture
              </Text>
              <ProfilePictureUpload
                currentUser={currentUser}
                onProfilePictureUpdate={handleProfilePictureUpdate}
                size="sm"
                isEditable={true}
              />
            </VStack>
          </Box>
        )}

        <Show above="md">
          <Text fontSize="sm" color="gray.500" mt={2}>
            Logged in as {currentUser?.first_name}. Clear browser data to change
            user.
          </Text>
        </Show>
      </Box>

      <Modal isOpen={isRenameOpen} onClose={onRenameClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Your Name</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Your new name will be visible on all your existing posts and
                comments.
              </Text>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  placeholder="Enter your new name"
                  size="lg"
                  autoFocus
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onRenameClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleRenameUser}
              isLoading={isRenaming}
              isDisabled={
                !newFirstName.trim() ||
                newFirstName.trim() === currentUser?.first_name
              }
            >
              Update Name
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AppHeader;
