import { ChakraProvider, Box } from "@chakra-ui/react";
import BookingForm from "./components/BookingForm";

export default function App() {
  return (
    <ChakraProvider>
      <Box bg="#F7F7F7" minH="100vh" p={6}>
        <BookingForm />
      </Box>
    </ChakraProvider>
  );
}
