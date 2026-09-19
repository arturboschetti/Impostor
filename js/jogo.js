import { db } from "./firebase.js";
import {
  ref,
  onValue,
  update,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const meuNome = sessionStorage.getItem("nomeJogador");
  const numSala = sessionStorage.getItem("numSala");

  if (!meuNome || !numSala) {
    window.location.href = "./entrar.html";
    return;
  }

  // Elementos do HTML
  const telaLobby = document.getElementById("telaLobby");
  const telaJogo = document.getElementById("telaJogo");
  const telaVotacao = document.getElementById("telaVotacao");
  const telaResultado = document.getElementById("telaResultado");

  const listaJogadores = document.getElementById("listaJogadores");
  const areaAdmin = document.getElementById("areaAdmin");
  const selectTema = document.getElementById("selectTema");
  const btnComecar = document.getElementById("btnComecar");
  const txtAguardando = document.getElementById("txtAguardando");
  const numSalaDisplay = document.getElementById("numSalaDisplay");

  const tituloPapel = document.getElementById("tituloPapel");
  const palavraSecreta = document.getElementById("palavraSecreta");
  const dicaPalavra = document.getElementById("dicaPalavra");
  const primeiroFalar = document.getElementById("primeiroFalar");

  const btnIrVotacao = document.getElementById("btnIrVotacao");
  const opcoesVotacao = document.getElementById("opcoesVotacao");
  const statusVotos = document.getElementById("statusVotos");
  const btnEncerrarVotacao = document.getElementById("btnEncerrarVotacao");

  const tituloResultado = document.getElementById("tituloResultado");
  const identidadeImpostor = document.getElementById("identidadeImpostor");
  const btnJogarNovamente = document.getElementById("btnJogarNovamente");
  const btnExcluirSala = document.getElementById("btnExcluirSala");

  numSalaDisplay.textContent = numSala;
  const salaRef = ref(db, `salas/${numSala}`);

  // Variável para armazenar o banco de palavras e temas
  let bancoPalavras = {};

  // Carrega as palavras do JSON logo que a página abre
  fetch("./palavras.json")
    .then((resposta) => resposta.json())
    .then((dadosJSON) => {
      bancoPalavras = dadosJSON;
      // Preenche o Select com as chaves (temas) do JSON
      Object.keys(bancoPalavras).forEach((tema) => {
        selectTema.innerHTML += `<option value="${tema}">${tema}</option>`;
      });
    })
    .catch((erro) => console.error("Erro ao carregar palavras:", erro));

  // 1. ESCUTANDO O BANCO EM TEMPO REAL
  onValue(salaRef, (snapshot) => {
    const dados = snapshot.val();

    if (!dados) {
      alert("A sala foi encerrada pelo administrador.");
      window.location.href = "./entrar.html";
      return;
    }

    const jogadores = dados.jogadores || [];
    const votos = dados.votos || {};
    const souAdmin = (dados.admin || jogadores[0])?.trim() === meuNome?.trim();

    // RESETANDO EXIBIÇÃO
    telaLobby.style.display = "none";
    telaJogo.style.display = "none";
    telaVotacao.style.display = "none";
    telaResultado.style.display = "none";
    document.body.style.backgroundColor = "#1a1a2e";

    // TELA DE LOBBY
    if (!dados.status || dados.status === "espera") {
      telaLobby.style.display = "block";
      listaJogadores.innerHTML = "";
      jogadores.forEach((jogador) => {
        listaJogadores.innerHTML += `<li>${jogador}</li>`;
      });

      if (souAdmin) {
        areaAdmin.style.display = "block";
        txtAguardando.style.display = "none";
      } else {
        areaAdmin.style.display = "none";
        txtAguardando.style.display = "block";
      }
    }

    // TELA DE JOGO (REVELAÇÃO)
    else if (dados.status === "jogando") {
      telaJogo.style.display = "block";
      btnIrVotacao.style.display = souAdmin ? "block" : "none";
      primeiroFalar.textContent = dados.primeiroJogador;

      // Exibe o tema e quem começa para todo mundo
      if (meuNome === dados.impostor) {
        telaJogo.style.backgroundColor = "#ff4d4d";
        tituloPapel.textContent = "VOCÊ É O IMPOSTOR!";
        palavraSecreta.textContent = "???";
        dicaPalavra.textContent = `Dica: ${dados.dica}`;
        dicaPalavra.style.display = "block";
      } else {
        telaJogo.style.backgroundColor = "#4d79ff";
        tituloPapel.textContent = "VOCÊ É UM INOCENTE";
        palavraSecreta.textContent = `Palavra: ${dados.palavra}`;
        dicaPalavra.style.display = "none";
      }
    }

    // TELA DE VOTAÇÃO
    else if (dados.status === "votacao") {
      telaVotacao.style.display = "block";

      const jaVotei = votos[meuNome] !== undefined;
      const totalVotos = Object.keys(votos).length;

      statusVotos.textContent = `Votos registrados: ${totalVotos} de ${jogadores.length}`;
      btnEncerrarVotacao.style.display = souAdmin ? "block" : "none";

      opcoesVotacao.innerHTML = "";

      if (jaVotei) {
        opcoesVotacao.innerHTML = `<p style="color: #4cd137;">Você votou em: <b>${votos[meuNome]}</b></p>`;
      } else {
        jogadores.forEach((jogador) => {
          const btnVoto = document.createElement("button");
          btnVoto.textContent = jogador;
          btnVoto.style.marginBottom = "10px";
          btnVoto.addEventListener("click", async () => {
            await update(ref(db, `salas/${numSala}/votos`), {
              [meuNome]: jogador,
            });
          });
          opcoesVotacao.appendChild(btnVoto);
        });
      }
    }

    // TELA DE RESULTADOS
    else if (dados.status === "resultado") {
      telaResultado.style.display = "block";

      const eliminadoFoiImpostor = dados.eliminado === dados.impostor;

      if (eliminadoFoiImpostor) {
        tituloResultado.textContent = "VITÓRIA DOS INOCENTES!";
        tituloResultado.style.color = "#4d79ff";
      } else {
        tituloResultado.textContent = "VITÓRIA DO IMPOSTOR!";
        tituloResultado.style.color = "#ff4d4d";
      }

      identidadeImpostor.textContent = `O Impostor era: ${dados.impostor}`;

      if (souAdmin) {
        btnJogarNovamente.style.display = "block";
        btnExcluirSala.style.display = "block";
      } else {
        btnJogarNovamente.style.display = "none";
        btnExcluirSala.style.display = "none";
      }
    }
  });

  // --- AÇÕES DO ADMINISTRADOR E FLUXO DO JOGO ---

  // Iniciar
  if (btnComecar) {
    btnComecar.addEventListener("click", async () => {
      btnComecar.disabled = true;
      try {
        let temaEscolhido = selectTema.value;
        const chavesTemas = Object.keys(bancoPalavras);

        // Se escolher aleatório, sorteia um tema da lista
        if (temaEscolhido === "Aleatorio") {
          temaEscolhido =
            chavesTemas[Math.floor(Math.random() * chavesTemas.length)];
        }

        const listaDoTema = bancoPalavras[temaEscolhido];
        const indicePalavra = Math.floor(Math.random() * listaDoTema.length);
        const sorteada = listaDoTema[indicePalavra];

        const itensLista = Array.from(listaJogadores.children).map(
          (li) => li.textContent,
        );

        // Sorteios dos jogadores
        const impostorSorteado =
          itensLista[Math.floor(Math.random() * itensLista.length)];
        const primeiroASerSorteado =
          itensLista[Math.floor(Math.random() * itensLista.length)];

        await update(ref(db, `salas/${numSala}`), {
          status: "jogando",
          impostor: impostorSorteado,
          palavra: sorteada.palavra,
          dica: sorteada.dicas.join(" - "),
          tema: temaEscolhido,
          primeiroJogador: primeiroASerSorteado,
          votos: null,
          eliminado: null,
        });
      } catch (erro) {
        alert("Erro ao sortear. Verifique o palavras.json.");
      }
      btnComecar.disabled = false;
    });
  }

  // Ir para Votação
  if (btnIrVotacao) {
    btnIrVotacao.addEventListener("click", async () => {
      await update(ref(db, `salas/${numSala}`), { status: "votacao" });
    });
  }

  // Encerrar Votação
  if (btnEncerrarVotacao) {
    btnEncerrarVotacao.addEventListener("click", async () => {
      btnEncerrarVotacao.disabled = true;
      try {
        const snap = await get(ref(db, `salas/${numSala}`));
        const salaData = snap.val();
        const votos = salaData.votos || {};

        const contagem = {};
        for (let jogador in votos) {
          const votado = votos[jogador];
          contagem[votado] = (contagem[votado] || 0) + 1;
        }

        let maisVotado = "Empate";
        let maxVotos = 0;
        let empate = false;

        for (let candidato in contagem) {
          if (contagem[candidato] > maxVotos) {
            maxVotos = contagem[candidato];
            maisVotado = candidato;
            empate = false;
          } else if (contagem[candidato] === maxVotos) {
            empate = true;
          }
        }

        await update(ref(db, `salas/${numSala}`), {
          status: "resultado",
          eliminado: empate ? "Empate" : maisVotado,
        });
      } catch (e) {
        console.error(e);
      }
      btnEncerrarVotacao.disabled = false;
    });
  }

  // Jogar Novamente
  if (btnJogarNovamente) {
    btnJogarNovamente.addEventListener("click", async () => {
      await update(ref(db, `salas/${numSala}`), { status: "espera" });
    });
  }

  // Excluir Sala
  if (btnExcluirSala) {
    btnExcluirSala.addEventListener("click", async () => {
      const confirmacao = confirm(
        "Tem certeza que deseja fechar a sala para todos?",
      );
      if (confirmacao) {
        await remove(ref(db, `salas/${numSala}`));
      }
    });
  }
});
