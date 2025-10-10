import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;

    // --- 🌟 BASIC SETUP ---
    tg.ready(); // Tell Telegram Mini App is ready
    tg.expand(); // Expand to full height
    setUser(tg.initDataUnsafe?.user); // Get Telegram user info
    setTheme(tg.themeParams); // Get Telegram theme colors

    // --- 🎨 THEME CHANGES ---
    tg.onEvent("themeChanged", () => {
      setTheme(tg.themeParams);
    });

    // --- 🧭 BACK BUTTON HANDLING ---
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      alert("Back button pressed!");
    });

    // --- 🧭 SETTINGS BUTTON HANDLING ---
    tg.SettingsButton.show();
    tg.SettingsButton.onClick(() => {
      alert("Settings button clicked!");
    });

    // --- 🔘 MAIN BUTTON HANDLING ---
    tg.MainButton.setText("Checkout ✅");
    tg.MainButton.onClick(() => handleCheckout());
    tg.MainButton.hide(); // Hide until items in cart

    // --- 🔊 HAPTIC FEEDBACK EXAMPLE ---
    tg.HapticFeedback.impactOccurred("medium");

    // --- 📦 LOAD PRODUCTS ---
    axios
      .get("https://your-backend.onrender.com/products")
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([
          { id: 1, name: "T-shirt", price: 20 },
          { id: 2, name: "Sneakers", price: 50 },
          { id: 3, name: "Cap", price: 10 },
        ]);
      });

    // Cleanup listeners
    return () => {
      tg.offEvent("themeChanged");
      tg.BackButton.hide();
      tg.MainButton.hide();
      tg.SettingsButton.hide();
    };
  }, []);

  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);

    const tg = window.Telegram.WebApp;

    // Trigger vibration feedback
    tg.HapticFeedback.notificationOccurred("success");

    // Show main button when cart not empty
    if (newCart.length > 0) {
      tg.MainButton.show();
    }
  };

  const handleCheckout = () => {
    const tg = window.Telegram.WebApp;

    tg.sendData(JSON.stringify({ cart })); // Send data to bot
    tg.close(); // Close mini app and return to chat
  };

  return (
    <div
      style={{
        padding: "20px",
        background: theme?.bg_color || "#fff",
        color: theme?.text_color || "#000",
      }}
    >
      <h1>🛒 Telegram Mini App Store</h1>
      {user && (
        <p>
          Welcome, {user.first_name} {user.last_name} 👋
        </p>
      )}

      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price}{" "}
            <button onClick={() => addToCart(p)}>Add</button>
          </li>
        ))}
      </ul>

      <h2>Cart</h2>
      <ul>
        {cart.map((c, i) => (
          <li key={i}>
            {c.name} - ${c.price}
          </li>
        ))}
      </ul>

      {cart.length > 0 && (
        <button onClick={handleCheckout}>✅ Checkout Now</button>
      )}
    </div>
  );
}

export default App;
