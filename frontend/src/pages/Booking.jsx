import React from 'react';
import BookingForm from '../components/BookingForm';

const Booking = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Get a Quote & Book Instantly</h1>
        <p className="text-xl text-gray-600">Transparent pricing based on distance and vehicle type.</p>
      </div>
      <BookingForm />
    </div>
  );
};

export default Booking;
