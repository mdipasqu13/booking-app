import { useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Text,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Logged in successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/admin");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="400px"
      mx="auto"
      mt={10}
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      bg={bgColor}
      borderColor={borderColor}
      color={textColor}
    >
      <Heading size="lg" mb={4} textAlign="center">
        Admin Login
      </Heading>
      <form onSubmit={handleLogin}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            width="full"
          >
            Login
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
