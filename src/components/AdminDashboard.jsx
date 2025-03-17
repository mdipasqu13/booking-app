import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
} from "@chakra-ui/react";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch all appointments from Firestore
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

  // Delete an appointment
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "bookings", id));
      setAppointments(appointments.filter((appointment) => appointment.id !== id));
      toast({
        title: "Appointment deleted.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  return (
    <Box maxW="800px" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg" bg="white">
      <Heading size="lg" mb={4} textAlign="center">
        Admin Dashboard
      </Heading>
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
                <Button colorScheme="red" size="sm" onClick={() => handleDelete(appointment.id)}>
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
