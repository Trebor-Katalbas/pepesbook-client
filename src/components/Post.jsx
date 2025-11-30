import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  Image,
  Button,
  Textarea,
  useToast,
  Divider,
  Badge,
  Spinner,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react";
import { useUserStore } from "../store/userStore";
import { useCommentStore } from "../store/commentStore";
import { useReactionStore } from "../store/reactionStore";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import { FaRegTrashAlt } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { getAbsoluteImageUrl } from "../utils/apiClient";

const Post = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  const currentUser = useAuthStore((state) => state.currentUser);
  const { getUserById, fetchUser } = useUserStore();
  const { getCommentsByPostId, fetchComments, createComment, deleteComment } =
    useCommentStore();
  const {
    // getReactionsByPostId,
    getUserReaction,
    fetchReactions,
    addReaction,
    removeReaction,
    getReactionCount,
    getReactionsByType,
  } = useReactionStore();
  const { deletePost } = usePostStore();

  const user = getUserById(post.user_id);
  const comments = getCommentsByPostId(post.id);
  // const reactions = getReactionsByPostId(post.id);
  const userReaction = getUserReaction(post.id);
  const reactionCount = getReactionCount(post.id);
  const reactionsByType = getReactionsByType(post.id);

  const isPostOwner = currentUser && post.user_id === currentUser.id;

  useEffect(() => {
    if (!user) {
      fetchUser(post.user_id);
    }
    fetchReactions(post.id);
    
    if (comments.length === 0) {
      fetchComments(post.id);
    }
  }, [post.id, user, fetchUser, fetchReactions, fetchComments, comments.length, post.user_id]);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments(post.id);
    }
  }, [showComments, post.id, fetchComments, comments.length]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      await createComment(post.id, newComment);
      setNewComment("");
      toast({
        title: "Comment added!",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error adding comment",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (type) => {
    try {
      if (userReaction && userReaction.type === type) {
        await removeReaction(post.id);
      } else {
        await addReaction(post.id, type);
      }
    } catch (error) {
      toast({
        title: "Error updating reaction",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      toast({
        title: "Post deleted",
        status: "success",
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error deleting post",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId, post.id);
      toast({
        title: "Comment deleted",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error deleting comment",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const reactionTypes = {
    like: { emoji: "👍", label: "Like", color: "blue" },
    love: { emoji: "❤️", label: "Love", color: "red" },
    haha: { emoji: "😂", label: "Haha", color: "yellow" },
    sad: { emoji: "😢", label: "Sad", color: "blue" },
  };

  const getUserReactionEmoji = () => {
    if (!userReaction) return "👍";
    return reactionTypes[userReaction.type]?.emoji || "👍";
  };

  const formatReactionCount = () => {
    if (reactionCount === 0) return "0";

    const activeReactions = Object.entries(reactionsByType)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => `${reactionTypes[type]?.emoji} ${count}`)
      .join(" ");

    return activeReactions;
  };

  if (!user) {
    return (
      <Box bg="white" borderRadius="lg" shadow="md" p={6}>
        <HStack justify="center">
          <Spinner />
          <Text>Loading post...</Text>
        </HStack>
      </Box>
    );
  }

  return (
    <>
      <Box bg="white" borderRadius="lg" shadow="md" p={6} position="relative" border="1px solid" borderColor="gray.200">
        <HStack justify="space-between" align="start" mb={4}>
          <HStack spacing={3} flex={1}>
            <Avatar
              size="md"
              src={getAbsoluteImageUrl(user.profile_pic)}
              name={user.first_name}
            />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">{user.first_name}</Text>
              <Text fontSize="sm" color="gray.500">
                {formatDate(post.created_at)}
              </Text>
            </VStack>
          </HStack>

          {isPostOwner && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<BsThreeDotsVertical />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem
                  icon={<FaRegTrashAlt />}
                  color="red.500"
                  onClick={onOpen}
                >
                  Delete Post
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>

        <Text whiteSpace="pre-wrap" mb={4}>
          {post.content}
        </Text>

        {post.image_url && (
          <Image
            src={getAbsoluteImageUrl(post.image_url)}
            alt="Post image"
            borderRadius="md"
            maxH="400px"
            objectFit="cover"
            mb={4}
          />
        )}

        <HStack justify="space-between" mb={4}>
          {formatReactionCount() !== "0" ? (
            <Badge colorScheme="blue" fontSize="sm" borderRadius="md" paddingY="3px">
              {formatReactionCount()}
            </Badge>
          ) : (
            <Box></Box>
          )}

          {comments.length > 0 && (
            <Badge borderRadius="md" paddingY="3px">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </Badge>
          )}
        </HStack>

        <HStack spacing={2} mb={showComments ? 4 : 0}>
          <Popover placement="top">
            <PopoverTrigger>
              <Button
                variant={userReaction ? "solid" : "outline"}
                colorScheme={
                  userReaction
                    ? reactionTypes[userReaction.type]?.color
                    : "blue"
                }
                size="sm"
                leftIcon={<Text fontSize="lg">{getUserReactionEmoji()}</Text>}
              >
                {userReaction
                  ? reactionTypes[userReaction.type]?.label
                  : "Like"}
              </Button>
            </PopoverTrigger>
            <PopoverContent width="auto">
              <PopoverBody p={2}>
                <HStack spacing={1}>
                  {Object.entries(reactionTypes).map(
                    ([type, { emoji, label, color }]) => (
                      <IconButton
                        key={type}
                        aria-label={label}
                        icon={<Text fontSize="xl">{emoji}</Text>}
                        size="sm"
                        variant={
                          userReaction?.type === type ? "solid" : "ghost"
                        }
                        colorScheme={color}
                        onClick={() => handleReaction(type)}
                        _hover={{ transform: "scale(1.1)" }}
                        transition="transform 0.2s"
                      />
                    )
                  )}
                </HStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <Button
            variant={showComments ? "solid" : "outline"}
            colorScheme="grey"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            💬 Comment
          </Button>
        </HStack>

        {showComments && (
          <VStack align="stretch" spacing={4}>
            <Divider />

            <HStack spacing={3}>
              <Avatar
                size="sm"
                src={getAbsoluteImageUrl(currentUser.profile_pic)}
                name={currentUser.first_name}
              />
              <VStack flex={1} spacing={2}>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  size="sm"
                />
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={handleAddComment}
                  isLoading={isLoading}
                  alignSelf="flex-end"
                >
                  Post Comment
                </Button>
              </VStack>
            </HStack>

            <VStack align="stretch" spacing={3}>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onDeleteComment={handleDeleteComment}
                  currentUserId={currentUser?.id}
                />
              ))}
            </VStack>
          </VStack>
        )}
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Post
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeletePost} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

const CommentItem = ({ comment, onDeleteComment, currentUserId }) => {
  const { getUserById, fetchUser } = useUserStore();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const user = getUserById(comment.user_id);

  const isCommentOwner = currentUserId && comment.user_id === currentUserId;

  useEffect(() => {
    if (!user) {
      fetchUser(comment.user_id);
    }
  }, [comment.user_id, user, fetchUser]);

  const handleDelete = async () => {
    setIsDeleteLoading(true);
    try {
      await onDeleteComment(comment.id);
      onClose();
    } catch (error) {
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <HStack spacing={3} align="start">
        <Spinner size="sm" />
        <Text fontSize="sm">Loading...</Text>
      </HStack>
    );
  }

  return (
    <>
      <HStack spacing={3} align="start">
        <Avatar
          size="sm"
          src={getAbsoluteImageUrl(user.profile_pic)}
          name={user.first_name}
        />
        <Box bg="gray.100" p={3} borderRadius="md" flex={1} position="relative">
          <HStack justify="space-between" align="start" mb={1}>
            <HStack spacing={2}>
              <Text fontWeight="bold" fontSize="sm">
                {user.first_name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {new Date(comment.created_at).toLocaleString()}
              </Text>
            </HStack>

            {isCommentOwner && (
              <IconButton
                icon={<FaRegTrashAlt />}
                size="xs"
                variant="ghost"
                color="red.500"
                onClick={onOpen}
                aria-label="Delete comment"
                isLoading={isDeleteLoading}
              />
            )}
          </HStack>
          <Text fontSize="sm">{comment.content}</Text>
        </Box>
      </HStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Comment
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleteLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Post;