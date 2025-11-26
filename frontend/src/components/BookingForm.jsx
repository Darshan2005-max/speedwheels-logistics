import React, { useState } from 'react';
import { getEstimate, saveBooking } from '../services/api';
import PaymentButton from './PaymentButton';
import MapDisplay from './MapDisplay';

const VEHICLES = [
  { id: 'mini', name: 'Mini Truck (2.5T)', icon: '🚚' },
  { id: 'lorry', name: 'Lorry (10T)', icon: '🚛' },
  { id: 'container20', name: 'Container (20ft)', icon: '📦' },
  { id: 'container40', name: 'Container (40ft)', icon: '🏗️' },
];

const BookingForm = () => {
  const [formData, setFormData] = useState({
    pickup: '',
    drop: '',
    vehicle: 'mini',
  });
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    setEstimate(null);

    try {
      if (!formData.pickup || !formData.drop) {
        setError("Please enter both pickup and drop locations");
        setLoading(false);
        return;
      }

      const data = await getEstimate(formData.vehicle, formData.pickup, formData.drop);
      setEstimate(data);
    } catch (err) {
      setError("Failed to get estimate. Please check the addresses and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (details) => {
    try {
      const bookingData = {
        pickup: formData.pickup,
        drop: formData.drop,
        vehicle: formData.vehicle,
        distanceKm: estimate.distanceKm,
        total: estimate.total,
        advance: estimate.advance,
        paymentId: details.id,
        paymentStatus: 'completed',
        customerName: details.payer.name.given_name,
      };

      await saveBooking(bookingData);
      alert('Booking Confirmed! Payment ID: ' + details.id);
      setEstimate(null);
      setFormData({ pickup: '', drop: '', vehicle: 'mini' });
    } catch (err) {
      console.error(err);
      alert('Payment successful but failed to save booking. Please contact support.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Book Your Vehicle</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-bold mb-2">Pickup Address</label>
          <input
            type="text"
            name="pickup"
            value={formData.pickup}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter pickup location (e.g., Mumbai, India)"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Drop Address</label>
          <input
            type="text"
            name="drop"
            value={formData.drop}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter drop location (e.g., Delhi, India)"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Select Vehicle</label>
          <div className="grid grid-cols-2 gap-4">
            {VEHICLES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setFormData({ ...formData, vehicle: v.id })}
                className={`p-4 border rounded-lg text-left flex items-center gap-3 transition ${
                  formData.vehicle === v.id
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{v.icon}</span>
                <span className="font-medium">{v.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Get Estimate'}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {estimate && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Fare Estimate</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Base Fare ({estimate.distanceKm} km)</span>
                <span>₹{estimate.base}</span>
              </div>
              <div className="flex justify-between">
                <span>Fuel Surcharge</span>
                <span>₹{estimate.fuelCost}</span>
              </div>
              <div className="flex justify-between">
                <span>Driver Allowance</span>
                <span>₹{estimate.driverFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Toll & Taxes</span>
                <span>₹{estimate.toll}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-black">
                <span>Total</span>
                <span>₹{estimate.total}</span>
              </div>
              <div className="flex justify-between text-blue-600 font-bold">
                <span>Advance Payable (30%)</span>
                <span>₹{estimate.advance}</span>
              </div>
            </div>
            
            {/* Map Display with Route */}
            {estimate.pickupCoords && estimate.dropCoords && (
              <MapDisplay
                pickupCoords={estimate.pickupCoords}
                dropCoords={estimate.dropCoords}
                routePolyline={estimate.routePolyline}
                distance={estimate.distanceKm}
                duration={estimate.duration}
              />
            )}
            
            <div className="mt-6">
               <PaymentButton amount={estimate.advance} onSuccess={handlePaymentSuccess} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
