import { useState } from "react";
import { Box, Heading, FormControl, FormLabel, Input, Select, Button, VStack } from "@chakra-ui/react";

export default function BookingForm() {
  const [formData, setFormData] = useState({
    service: "",
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Booking Details:", formData);
    alert("Appointment booked! (This is just a test alert for now)");
  };

  return (
    <Box maxW="500px" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="white">
      <Heading size="lg" mb={4} textAlign="center">
        Book an Appointment
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {/* Service Selection */}
          <FormControl isRequired>
            <FormLabel>Select a Service</FormLabel>
            <Select name="service" value={formData.service} onChange={handleChange}>
              <option value="">Select...</option>
              <option value="web-design">Web Design</option>
              <option value="seo-consulting">Consulting</option>
              <option value="custom-software">Mawmaw's Biscuit Service</option>
            </Select>
          </FormControl>

          {/* Name */}
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} />
          </FormControl>

          {/* Email */}
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} />
          </FormControl>

          {/* Phone */}
          <FormControl>
            <FormLabel>Phone (Optional)</FormLabel>
            <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
          </FormControl>

          {/* Date */}
          <FormControl isRequired>
            <FormLabel>Select a Date</FormLabel>
            <Input type="date" name="date" value={formData.date} onChange={handleChange} />
          </FormControl>

          {/* Time */}
          <FormControl isRequired>
            <FormLabel>Select a Time</FormLabel>
            <Input type="time" name="time" value={formData.time} onChange={handleChange} />
          </FormControl>

          {/* Submit Button */}
          <Button type="submit" colorScheme="blue" width="full">
            Book Appointment
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
