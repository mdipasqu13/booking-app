import { useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";


export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const headingColor = useColorModeValue("gray.800", "gray.100");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_CONTACT_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setLoading(false);
          setForm({ name: "", email: "", message: "" });
          toast({
            title: "Message sent!",
            description: "I'll get back to you as soon as possible.",
            status: "success",
            duration: 4000,
            isClosable: true,
          });
        },
        (error) => {
          setLoading(false);
          console.error("Email send error:", error);
          toast({
            title: "Error",
            description: "There was an issue sending your message.",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      );
  };

  return (
    <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
    >
        <Box
        maxW="600px"
        mx="auto"
        mt={10}
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="lg"
        bg={bgColor}
        borderColor={inputBorder}
        >
        <Heading size="lg" mb={4} textAlign="center" color={headingColor}>
            Contact Me
        </Heading>
        <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
            <FormControl isRequired>
                <FormLabel color={textColor}>Name</FormLabel>
                <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                bg={inputBg}
                borderColor={inputBorder}
                color={textColor}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel color={textColor}>Email</FormLabel>
                <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                bg={inputBg}
                borderColor={inputBorder}
                color={textColor}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel color={textColor}>Message</FormLabel>
                <Textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                bg={inputBg}
                borderColor={inputBorder}
                color={textColor}
                />
            </FormControl>
            <Button type="submit" colorScheme="blue" isLoading={loading} width="full">
                Send Message
            </Button>
            </VStack>
        </form>
        </Box>
    </motion.div>
  );
}
