import { Routes, Route, Link } from "react-router-dom";
import { Box, HStack, Button } from "@chakra-ui/react";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";

export default function App() {
  return (
    <Box>
      {/* Navbar */}
      <HStack p={4} bg="blue.500" justify="center">
        <Button as={Link} to="/" colorScheme="blue" variant="ghost" color="white">Book Appointment</Button>
        <Button as={Link} to="/admin" colorScheme="blue" variant="ghost" color="white">Admin Dashboard</Button>
      </HStack>

      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<BookingForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Box>
  );
}
