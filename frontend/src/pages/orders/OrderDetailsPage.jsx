import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder } from "../../services/ordersService";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrder(orderId);
        setOrder(data);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) return <div>Loading order...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div>
      <h1>Order Details</h1>
      <p><b>Order ID:</b> {orderId}</p>
      <p><b>Status:</b> {order.status}</p>
      <p><b>Total:</b> ₹{order.total_amount}</p>
      <h3>Items</h3>
      <ul>
        {order.items?.map((item) => (
          <li key={item.id}>
            {item.title} x {item.qty} (₹{item.line_total})
          </li>
        ))}
      </ul>
    </div>
  );
}
