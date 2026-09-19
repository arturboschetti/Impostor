import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA50dgg0iTj1S9ZSTQxkudMkE0XpG0JIqc",
  authDomain: "jogoimpostor-ef159.firebaseapp.com",
  projectId: "jogoimpostor-ef159",
  storageBucket: "jogoimpostor-ef159.firebasestorage.app",
  messagingSenderId: "458439237636",
  appId: "1:458439237636:web:c18f3c5fde1bf9a85fd551",
  measurementId: "G-T8E6PH763P",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
