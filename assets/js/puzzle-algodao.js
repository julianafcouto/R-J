"use strict";

window.criarPuzzleAlgodao = function (dados, concluir) {
  const el = document.createElement("article");
  el.className = "componente puzzle algodao";
  el.dataset.etapa = "costura";
  const nomes = ["EU", "VOCÊ", "ESCOLHA", "CUIDADO", "CASA", "NÓS"];
  const pontos = [[20, 22], [75, 40], [48, 15], [24, 70], [78, 78], [50, 53]];
  const frases = ["Duas histórias que decidiram se encontrar.", "Porque ficar também é uma decisão.", "Porque amor não vive só do que se sente.", "Porque, aos poucos, você virou lugar.", "E o que era meu e seu começou a ser nosso."];
  const svgNS = "http://www.w3.org/2000/svg";
  el.innerHTML = `
    <span class="componente__etiqueta">Bodas de algodão · 16.09.2026</span>
    <h3>Entre Fios</h3><p class="algodao__subtitulo">Três meses de nós.</p>
    <p class="algodao__instrucao">Toda história começa com alguém. Encontre o primeiro fio. Toque nos nós para costurar ou arraste de um ao outro.</p>
    <div class="algodao__tecido">
      <svg class="algodao__linhas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
      <div class="algodao__nos"></div>
      <svg class="algodao__bordado" viewBox="0 0 300 260" aria-hidden="true" hidden>
        <path class="algodao__coracao" pathLength="1" d="M150 220 C120 190 28 136 35 78 C42 12 122 20 150 75 C178 20 258 12 265 78 C272 136 180 190 150 220 Z"/>
        <path class="algodao__numero" pathLength="1" d="M115 75 C55 45 55 200 115 180 C150 165 150 65 115 75 M177 78 C240 43 257 126 195 126 C260 120 248 205 178 179"/>
        <path class="algodao__laco" pathLength="1" d="M150 219 C117 190 117 238 150 219 C183 190 183 238 150 219 M150 219 Q136 233 128 237 M150 219 Q166 232 173 239"/>
      </svg>
      <div class="algodao__uniao" hidden><button type="button" data-fio="eu">EU</button><span>⌁</span><button type="button" data-fio="voce">VOCÊ</button></div>
      <button type="button" class="algodao__ponta" aria-label="Puxar a ponta de fio" hidden><svg viewBox="0 0 70 80" aria-hidden="true"><path d="M5 5 C55 15 12 45 43 52 S65 65 52 75"/></svg></button>
    </div>
    <p class="algodao__status" role="status" aria-live="polite">Seis palavras. Uma história para entrelaçar.</p>
    <ol class="algodao__frases"></ol>
    <button type="button" class="botao algodao__dica">Encontrar uma pista</button>
    <div class="algodao__final" hidden><strong>03</strong><span>meses de nós.</span><h4>Ainda estamos só começando.</h4><p>Se amar você for construir uma vida fio por fio, eu não tenho pressa. Quero costurar cada pedaço dela contigo.</p></div>`;
  const q = s => el.querySelector(s);
  const status = q(".algodao__status");
  const instrucao = q(".algodao__instrucao");
  let atual = -1;
  let ocupado = false;
  let fioSelecionado = false;
  const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esperar = ms => new Promise(resolve => setTimeout(resolve, reduzido ? 0 : ms));
  function linha(a, b, erro = false) {
    const path = document.createElementNS(svgNS, "path");
    const [x, y] = pontos[a], [xx, yy] = pontos[b];
    path.setAttribute("d", `M${x} ${y} Q${(x + xx) / 2 + 8} ${(y + yy) / 2 + 8} ${xx} ${yy}`);
    path.setAttribute("pathLength", "1");
    if (erro) path.classList.add("algodao__erro");
    q(".algodao__linhas").append(path);
    if (erro) setTimeout(() => path.remove(), 800);
  }
  async function escolher(indice) {
    if (ocupado || el.dataset.etapa !== "costura" || indice === atual) return;
    if (indice !== atual + 1) {
      if (atual >= 0) linha(atual, indice, true);
      status.textContent = "Esse fio ainda não encontrou seu lugar. Tente outra ligação.";
      return;
    }
    if (atual >= 0) {
      linha(atual, indice);
      const item = document.createElement("li");
      item.textContent = frases[atual];
      q(".algodao__frases").append(item);
    }
    atual = indice;
    el.querySelectorAll(".algodao__no").forEach((b, i) => {
      b.classList.toggle("algodao__no--feito", i <= atual);
      b.setAttribute("aria-pressed", String(i === atual));
    });
    status.textContent = atual === 0 ? "Aqui começa o seu fio. Quem ele encontra?" : frases[atual - 1];
    if (atual !== 5) return;
    ocupado = true;
    q(".algodao__dica").hidden = true;
    await esperar(1400);
    el.dataset.etapa = "no";
    q(".algodao__nos").hidden = true;
    q(".algodao__linhas").setAttribute("hidden", "");
    q(".algodao__bordado").removeAttribute("hidden");
    q(".algodao__uniao").hidden = false;
    instrucao.textContent = "Você terminou o bordado. Mas ainda falta alguma coisa… Una EU e VOCÊ para dar o último nó.";
    status.textContent = "Dois fios. Uma escolha.";
    q('[data-fio="eu"]').focus({preventScroll: true});
    ocupado = false;
  }
  nomes.forEach((nome, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "algodao__no"; b.textContent = nome;
    b.style.left = `${pontos[i][0]}%`; b.style.top = `${pontos[i][1]}%`;
    b.dataset.indice = i; b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => escolher(i));
    q(".algodao__nos").append(b);
  });
  let origem = null;
  q(".algodao__tecido").addEventListener("pointerdown", e => {
    const b = e.target.closest(".algodao__no, [data-fio]");
    if (b) origem = b;
  });
  q(".algodao__tecido").addEventListener("pointerup", e => {
    const destino = document.elementFromPoint(e.clientX, e.clientY)?.closest(".algodao__no, [data-fio]");
    if (origem && destino && origem !== destino) {
      if (origem.dataset.indice !== undefined && destino.dataset.indice !== undefined) {
        if (Number(origem.dataset.indice) === atual || atual === -1 && origem.dataset.indice === "0") {
          if (atual === -1) escolher(0);
          escolher(Number(destino.dataset.indice));
        }
      } else if (origem.dataset.fio && destino.dataset.fio) darNo();
    }
    origem = null;
  });
  q(".algodao__tecido").addEventListener("pointercancel", () => { origem = null; });
  q(".algodao__dica").addEventListener("click", () => {
    const pistas = ["Comece com EU. Toda história também começa dentro da gente.", "Um fio sozinho procura VOCÊ.", "Estar juntas é uma ESCOLHA.", "A escolha floresce em CUIDADO.", "Onde o cuidado mora?", "CASA é onde podemos ser NÓS."];
    status.textContent = pistas[atual + 1];
  });
  function darNo() {
    if (el.dataset.etapa !== "no") return;
    el.dataset.etapa = "segredo";
    q(".algodao__uniao").hidden = true;
    q(".algodao__ponta").hidden = false;
    instrucao.textContent = "Entre todas as coisas que poderíamos ter sido, escolhemos ser nós.";
    status.textContent = "Três meses de casadas. E uma vida inteira para costurar contigo.";
    q(".algodao__ponta").focus({preventScroll: true});
  }
  el.querySelectorAll("[data-fio]").forEach(b => b.addEventListener("click", () => {
    if (fioSelecionado && fioSelecionado !== b) darNo();
    else { fioSelecionado = b; b.setAttribute("aria-pressed", "true"); status.textContent = "Agora encontre o outro fio."; }
  }));
  q(".algodao__ponta").addEventListener("click", async () => {
    if (el.dataset.etapa !== "segredo") return;
    el.dataset.etapa = "desfazendo";
    q(".algodao__ponta").hidden = true;
    status.textContent = "…";
    await esperar(2200);
    status.textContent = "Calma. Nem tudo que se desfaz deixa de existir.";
    await esperar(2200);
    el.dataset.etapa = "final";
    instrucao.textContent = "O fio continua. Só encontrou uma nova forma.";
    await esperar(1500);
    q(".algodao__final").hidden = false;
    status.textContent = "Ainda estamos só começando.";
    concluir(el);
  });
  return el;
};
