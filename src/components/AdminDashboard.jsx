import { useEffect, useState } from "react";
import { db, auth, signOut } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, useToast
} from "@chakra-ui/react";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
        fetchAppointments();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "bookings"));
      const bookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(bookings);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "bookings", id));
      setAppointments(appointments.filter((appointment) => appointment.id !== id));
      toast({ title: "Appointment deleted.", status: "error", duration: 3000, isClosable: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <Box maxW="800px" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg" bg="white">
      <Heading size="lg" mb={4} textAlign="center">Admin Dashboard</Heading>
      <Button colorScheme="red" mb={4} onClick={handleLogout}>Logout</Button>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {appointments.map((appointment) => (
            <Tr key={appointment.id}>
              <Td>{appointment.name}</Td>
              <Td>{appointment.email}</Td>
              <Td>{appointment.date}</Td>
              <Td>{appointment.time}</Td>
              <Td>
                <Button colorScheme="red" size="sm" onClick={() => handleDelete(appointment.id)}>Delete</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
