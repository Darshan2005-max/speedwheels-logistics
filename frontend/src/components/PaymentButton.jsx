import React, { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";

const PaymentButton = ({ amount, onSuccess }) => {
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await axios.get("http://localhost:8080/api/paypal/config");
        setClientId(data.clientId);
      } catch (err) {
        console.error("Failed to load PayPal config", err);
      }
    };
    fetchConfig();
  }, []);

  if (!clientId) return <p>Loading payment system...</p>;

  return (
    <PayPalScriptProvider options={{ "client-id": clientId, currency: "INR" }}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toString(),
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            onSuccess(details);
          });
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PaymentButton;
