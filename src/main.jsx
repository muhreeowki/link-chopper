import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { initializeApp } from 'firebase/app'
import App from "./App.jsx";
import "./index.css";

const firebaseConfig = {
  apiKey: "AIzaSyAD3QTbDXGJCepRWMdSUCBkrUOj-xk56kA",
  authDomain: "link-chopper.firebaseapp.com",
  projectId: "link-chopper",
  storageBucket: "link-chopper.appspot.com",
  messagingSenderId: "226036563768",
  appId: "1:226036563768:web:5fdab80018e75d54e38bcd",
  measurementId: "G-8W1C9EXC9Q"
};
initializeApp(firebaseConfig)

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
