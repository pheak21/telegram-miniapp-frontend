import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tg = window.Telegram.WebApp;

    // Initialize Telegram Mini App
    tg.ready();
    tg.expand();

    // Get Telegram user info
    setUser(tg.initDataUnsafe?.user);

    // Fetch products from backend
    //http://localhost:3000/products
    axios
      .get("https://your-backend.onrender.com/products") // use deployed backend
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error("Error fetching products:", err);
        // fallback products
        setProducts([
          { id: 1, name: "T-shirt", price: 20 },
          { id: 2, name: "Sneakers", price: 50 },
          { id: 3, name: "Cap", price: 10 },
        ]);
      });
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleCheckout = () => {
    const tg = window.Telegram.WebApp;

    // Send cart data back to bot
    tg.sendData(JSON.stringify({ cart }));

    alert("Cart sent to bot! ✅");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛒 Telegram Mini App Store</h1>

      {user && <p>Welcome, {user.first_name} 👋</p>}

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

      {cart.length > 0 && <button onClick={handleCheckout}>✅ Checkout</button>}
    </div>
  );
}

export default App;
