import { AuthProvider } from "./AuthProvider";
import { CartProvider } from "./CartProvider";
import { ToastProvider } from "./ToastProvider";
import { Web3Provider } from "./Web3Provider";
import { WishlistProvider } from "./WishlistProvider";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Web3Provider>
            <ToastProvider>{children}</ToastProvider>
          </Web3Provider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
