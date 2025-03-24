import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useColorModeValue } from "@chakra-ui/react";

export default function NotFound() {
  const bg = useColorModeValue("white", "gray.800");
  const text = useColorModeValue("gray.800", "gray.100");

  return (
    <Box
      textAlign="center"
      py={10}
      px={6}
      bg={bg}
      color={text}
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Heading fontSize="6xl" mb={2}>
        404
      </Heading>
      <Text fontSize="xl" mb={6}>
        Oops! The page you’re looking for doesn’t exist.
      </Text>
      <Button as={Link} to="/" colorScheme="blue">
        Go to Home
      </Button>
    </Box>
  );
}
