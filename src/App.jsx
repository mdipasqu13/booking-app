import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Button,
  useColorMode,
  useColorModeValue,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon, HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import Contact from "./components/Contact"; // 👈 ADD THIS
import { auth, onAuthStateChanged, signOut } from "./firebase";
import { useDisclosure } from "@chakra-ui/react";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure();

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
      <Box bg="blue.500" px={4} py={3} boxShadow="sm">
        <Box maxW="1200px" mx="auto">
          {/* Hamburger icon (mobile) */}
          <Box display={{ base: "flex", md: "none" }} justifyContent="flex-end">
            <IconButton
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              variant="ghost"
              color="white"
              onClick={onToggle}
              aria-label="Toggle Navigation"
            />
          </Box>

          {/* Nav Links - Desktop */}
          <Stack
            direction="row"
            spacing={4}
            justify="center"
            align="center"
            mt={{ base: 0, md: 2 }}
            display={{ base: "none", md: "flex" }}
          >
            <Button onClick={toggleColorMode} variant="ghost" color="white">
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
            <Button as={Link} to="/" variant="ghost" color="white">
              Book Appointment
            </Button>
            <Button as={Link} to="/contact" variant="ghost" color="white">
              Contact
            </Button>
            {!isAdmin ? (
              <Button as={Link} to="/admin-login" variant="ghost" color="white">
                Admin Login
              </Button>
            ) : (
              <>
                <Button as={Link} to="/admin" variant="ghost" color="white">
                  Admin Dashboard
                </Button>
                <Button onClick={handleLogout} variant="ghost" color="white">
                  Logout
                </Button>
              </>
            )}
          </Stack>

          {/* Nav Links - Mobile */}
          {isOpen && (
            <VStack spacing={3} mt={4} display={{ base: "flex", md: "none" }}>
              <Button onClick={toggleColorMode} variant="ghost" color="white">
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>
              <Button as={Link} to="/" variant="ghost" color="white">
                Book Appointment
              </Button>
              <Button as={Link} to="/contact" variant="ghost" color="white">
                Contact
              </Button>
              {!isAdmin ? (
                <Button as={Link} to="/admin-login" variant="ghost" color="white">
                  Admin Login
                </Button>
              ) : (
                <>
                  <Button as={Link} to="/admin" variant="ghost" color="white">
                    Admin Dashboard
                  </Button>
                  <Button onClick={handleLogout} variant="ghost" color="white">
                    Logout
                  </Button>
                </>
              )}
            </VStack>
          )}
        </Box>
      </Box>

      {/* Page Routes */}
      <Box maxW="1200px" mx="auto" px={4} py={8}>
        <Routes>
          <Route path="/" element={<BookingForm />} />
          <Route path="/admin-login" element={<Login />} />
          <Route path="/contact" element={<Contact />} /> {/* 👈 ADD THIS ROUTE */}
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
    </Box>
  );
}
