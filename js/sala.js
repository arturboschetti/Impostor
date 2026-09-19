import { db } from "./firebase.js";
import {
  ref,
  get,
  set,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnCriarC = document.getElementById("btn-c-c");
  const btnEntrarC = document.getElementById("btn-e-c");
  const btnEntrarE = document.getElementById("btn-e-e");
  const btnCriarE = document.getElementById("btn-c-e");

  if (btnCriarC) {
    btnCriarC.addEventListener("click", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("ci1")?.value.trim();
      const sala = document.getElementById("ci2")?.value.trim();

      if (!nome || !sala) {
        alert("Preencha todos os campos!");
        return;
      }

      try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `salas/${sala}`));

        if (snapshot.exists()) {
          alert("Esta sala já existe! Escolha outro número");
          return;
        }

        await set(ref(db, `salas/${sala}`), {
          jogadores: [nome],
          admin: nome,
          status: "espera",
          criadaEm: Date.now(),
        });

        sessionStorage.setItem("nomeJogador", nome);
        sessionStorage.setItem("numSala", sala);

        window.location.href = "../html/jogo.html";
      } catch (error) {
        console.error("Erro ao criar sala:", error);
        alert("Erro ao conectar com a Rede");
      }
    });
  }

  if (btnEntrarE) {
    btnEntrarE.addEventListener("click", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("ei1")?.value.trim();
      const sala = document.getElementById("ei2")?.value.trim();

      if (!nome || !sala) {
        alert("Preencha todos os campos!");
        return;
      }

      try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `salas/${sala}`));

        if (!snapshot.exists()) {
          alert("Esta sala não Existe!");
          return;
        }

        const salaData = snapshot.val();
        let jogadores = salaData.jogadores || [];

        if (!jogadores.includes(nome)) {
          jogadores.push(nome);
          await set(ref(db, `salas/${sala}/jogadores`), jogadores);
        }

        sessionStorage.setItem("nomeJogador", nome);
        sessionStorage.setItem("numSala", sala);

        window.location.href = "../html/jogo.html";
      } catch (error) {
        console.error("Erro ao entrar na sala:", error);
        alert("Erro ao conectar com a Rede");
      }
    });
  }

  if (btnEntrarC) {
    btnEntrarC.addEventListener("click", () => {
      window.location.href = "../html/entrar.html";
    });
  }

  if (btnCriarE) {
    btnCriarE.addEventListener("click", () => {
      window.location.href = "../html/criar.html";
    });
  }
});
