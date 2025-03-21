import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Box, HStack, Button } from "@chakra-ui/react";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import { auth, onAuthStateChanged, signOut } from "./firebase";
import PrivateRoute from "./components/PrivateRoute";
import { useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";


export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

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

  const { colorMode, toggleColorMode } = useColorMode();


  return (
    <Box px={[4, 6, 8]} py={[4, 6]} maxW="100%">

      {/* Navbar */}
      <HStack p={4} bg="blue.500" justify="center">
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
