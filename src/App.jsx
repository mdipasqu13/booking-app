import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Box, HStack, Button } from "@chakra-ui/react";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import { auth, onAuthStateChanged, signOut } from "./firebase";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Track authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user); // If user exists, they're logged in
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    navigate("/admin-login");
  };

  return (
    <Box>
      {/* Navbar */}
      <HStack p={4} bg="blue.500" justify="center">
        <Button as={Link} to="/" colorScheme="blue" variant="ghost" color="white">
          Book Appointment
        </Button>
        {!isAdmin ? (
          <Button as={Link} to="/admin-login" colorScheme="blue" variant="ghost" color="white">
            Admin Login
          </Button>
        ) : (
          <>
            <Button as={Link} to="/admin" colorScheme="blue" variant="ghost" color="white">
              Admin Dashboard
            </Button>
            <Button onClick={handleLogout} colorScheme="red" variant="ghost" color="white">
              Logout
            </Button>
          </>
        )}
      </HStack>

      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<BookingForm />} />
        <Route path="/admin-login" element={<Login />} />
        {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
      </Routes>
    </Box>
  );
}
