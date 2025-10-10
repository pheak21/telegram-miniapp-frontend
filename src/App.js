import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState({});
  const [launchSource, setLaunchSource] = useState("");

  useEffect(() => {
    const tg = window.Telegram.WebApp;

    // --- Basic setup ---
    tg.ready();
    tg.expand();

    // --- Get user info ---
    setUser(tg.initDataUnsafe?.user);

    // --- Detect launch source ---
    if (tg.initDataUnsafe?.start_param) {
      setLaunchSource("direct_link_or_website");
    } else if (tg.initDataUnsafe?.chat_type === "sender") {
      setLaunchSource("inline_mode");
    } else if (
      tg.initDataUnsafe?.chat_type === "private" ||
      tg.initDataUnsafe?.chat_type === "group"
    ) {
      setLaunchSource("inline_button_or_menu");
    } else {
      setLaunchSource("unknown");
    }

    // --- Theme handling ---
    setTheme(tg.themeParams);
    tg.onEvent("themeChanged", () => setTheme(tg.themeParams));

    // --- Back & Settings button ---
    tg.BackButton.show();
    tg.BackButton.onClick(() => alert("Back pressed"));
    tg.SettingsButton.show();
    tg.SettingsButton.onClick(() => alert("Settings clicked"));

    // --- Main button ---
    tg.MainButton.setText("Checkout ✅");
    tg.MainButton.onClick(() => handleCheckout());
    tg.MainButton.hide(); // hide initially

    // --- Load products ---
    axios
      .get("https://your-backend.onrender.com/products")
      .then((res) => setProducts(res.data))
      .catch(() => {
        setProducts([
          { id: 1, name: "T-shirt", price: 20 },
          { id: 2, name: "Sneakers", price: 50 },
          { id: 3, name: "Cap", price: 10 },
        ]);
      });

    // Cleanup
    return () => {
      tg.BackButton.hide();
      tg.MainButton.hide();
      tg.SettingsButton.hide();
      tg.offEvent("themeChanged");
    };
  }, []);

  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);

    const tg = window.Telegram.WebApp;

    // Show main button if cart not empty
    if (newCart.length > 0) tg.MainButton.show();

    // Haptic feedback for button press
    tg.HapticFeedback.notificationOccurred("success");
  };

  const handleCheckout = () => {
    const tg = window.Telegram.WebApp;
    tg.sendData(JSON.stringify({ cart })); // Send cart to bot
    tg.close(); // Close mini app
  };

  return (
    <div
      style={{
        backgroundColor: theme.bg_color || "#fff",
        color: theme.text_color || "#000",
        minHeight: "100vh",
        padding: "20px",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <h1>🛒 Telegram Mini App Store</h1>

      {user && <p>Welcome, {user.first_name} 👋</p>}
      <p>Launch Source: {launchSource}</p>

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
    </div>
  );
}

export default App;
