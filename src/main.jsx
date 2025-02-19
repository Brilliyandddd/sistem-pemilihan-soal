// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "@faker-js/faker";
import "msw";
import "@/lib/monitor";
import "./index.css"; 
import "./styles/index.less";

// Merender aplikasi ke dalam elemen dengan id 'root'
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
