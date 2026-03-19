import { Link } from "react-router-dom";

export default function OrderSuccessPage() {
  return (
    <div>
      <h1>Order Success</h1>
      <p>Order confirmation placeholder.</p>
      <Link to="/account/orders">Go to My Orders</Link>
    </div>
  );
}
