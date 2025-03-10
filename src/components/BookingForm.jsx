import { useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";

export default function BookingForm() {
  const [formData, setFormData] = useState({
    service: "",
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });

  const [errors, setErrors] = useState({});
  const toast = useToast();

  const validateForm = () => {
    let newErrors = {};

    if (!formData.service) newErrors.service = "Please select a service.";
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }
    if (!formData.date) newErrors.date = "Please select a date.";
    if (!formData.time) newErrors.time = "Please select a time.";
    if (formData.phone && !/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone number should only contain digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    // Convert time from 24-hour to 12-hour format
    const [hour, minute] = formData.time.split(":");
    const hourInt = parseInt(hour, 10);
    const ampm = hourInt >= 12 ? "PM" : "AM";
    const formattedHour = hourInt % 12 === 0 ? 12 : hourInt % 12; // Convert 0 to 12 for midnight, 12 stays 12
    const formattedTime = `${formattedHour}:${minute} ${ampm}`;
  
    console.log("Booking Details:", formData);
    toast({
      title: "Appointment booked!",
      description: `You have booked ${formData.service} on ${formData.date} at ${formattedTime}.`,
      status: "success",
      duration: 4000,
      isClosable: true,
    });
  
    setFormData({ service: "", name: "", email: "", phone: "", date: "", time: "" });
    setErrors({});
  };

  return (
    <Box maxW="500px" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg" bg="white">
      <Heading size="lg" mb={4} textAlign="center">
        Book an Appointment
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {/* Service Selection */}
          <FormControl isRequired isInvalid={errors.service}>
            <FormLabel>Select a Service</FormLabel>
            <Select name="service" value={formData.service} onChange={handleChange}>
              <option value="">Select...</option>
              <option value="web-design">Web Design</option>
              <option value="seo-consulting">Consulting</option>
              <option value="custom-software">Mawmaw's Biscuit Service</option>
            </Select>
            {errors.service && <Text color="red.500">{errors.service}</Text>}
          </FormControl>

          {/* Name */}
          <FormControl isRequired isInvalid={errors.name}>
            <FormLabel>Full Name</FormLabel>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <Text color="red.500">{errors.name}</Text>}
          </FormControl>

          {/* Email */}
          <FormControl isRequired isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <Text color="red.500">{errors.email}</Text>}
          </FormControl>

          {/* Phone */}
          <FormControl isInvalid={errors.phone}>
            <FormLabel>Phone (Optional)</FormLabel>
            <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            {errors.phone && <Text color="red.500">{errors.phone}</Text>}
          </FormControl>

          {/* Date */}
          <FormControl isRequired isInvalid={errors.date}>
            <FormLabel>Select a Date</FormLabel>
            <Input type="date" name="date" value={formData.date} onChange={handleChange} />
            {errors.date && <Text color="red.500">{errors.date}</Text>}
          </FormControl>

          {/* Time */}
          <FormControl isRequired isInvalid={errors.time}>
            <FormLabel>Select a Time</FormLabel>
            <Input type="time" name="time" value={formData.time} onChange={handleChange} />
            {errors.time && <Text color="red.500">{errors.time}</Text>}
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