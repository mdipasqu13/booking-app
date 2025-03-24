import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  Box,
  HStack,
  Button,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import { auth, onAuthStateChanged, signOut } from "./firebase";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.50", "gray.900"); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    navigate("/admin-login");
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Navbar */}
      <HStack p={4} bg="blue.500" justify="center" spacing={2}>
        <Button onClick={toggleColorMode} colorScheme="blue" variant="ghost" color="white">
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        </Button>
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
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Box>
  );
}
