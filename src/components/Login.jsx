import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Input,
  FormControl,
  FormLabel,
  Button,
  Heading,
  VStack,
  useToast,
} from "@chakra-ui/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/admin"); // Always redirect to admin dashboard
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Login error:", error);
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg" bg="white">
      <Heading size="lg" mb={4} textAlign="center">
        Admin Login
      </Heading>
      <form onSubmit={handleLogin}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button type="submit" colorScheme="blue" width="full">
            Login as Admin
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
