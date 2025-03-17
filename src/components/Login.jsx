import { useState } from "react";
import { auth, signInWithEmailAndPassword } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Box, Heading, FormControl, FormLabel, Input, Button, Text, useToast } from "@chakra-ui/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login successful!", status: "success", duration: 3000, isClosable: true });
      navigate("/admin");
    } catch (error) {
      toast({ title: "Login failed", description: error.message, status: "error", duration: 3000, isClosable: true });
    }
    setLoading(false);
  };

  return (
    <Box maxW="400px" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg" bg="white">
      <Heading size="lg" mb={4} textAlign="center">Admin Login</Heading>
      <form onSubmit={handleLogin}>
        <FormControl isRequired mb={3}>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl isRequired mb={4}>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button type="submit" colorScheme="blue" width="full" isLoading={loading}>Login</Button>
      </form>
    </Box>
  );
}
