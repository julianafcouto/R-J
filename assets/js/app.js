"use strict";

(function () {
  const TIPOS_PUZZLE = new Set([
    "cofre",
    "termo",
    "conexo",
    "ranking-album",
    "memoria",
    "memoria-complementos",
    "puzzle",
    "boa-noite",
    "hora-de-dormir",
    "labirinto-chocolate",
    "sorvete",
    "telescopio",
    "sonic-flores",
    "puzzle-algodao",
    "investigacao-pipoca",
    "mapa"
  ]);
  function escaparHTML(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizar(valor) {
    return String(valor ?? "")
      .trim()
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function embaralhar(lista) {
    const copia = [...lista];

    for (
      let indice = copia.length - 1;
      indice > 0;
      indice -= 1
    ) {
      const aleatorio = Math.floor(
        Math.random() * (indice + 1)
      );

      [
        copia[indice],
        copia[aleatorio]
      ] = [
        copia[aleatorio],
        copia[indice]
      ];
    }

    return copia;
  }

  function criarElementoErro(mensagem) {
    const elemento =
      document.createElement("article");

    elemento.className =
      "componente componente--erro";

    elemento.innerHTML = `
      <span class="componente__etiqueta">
        Componente indisponível
      </span>

      <p>${escaparHTML(mensagem)}</p>
    `;

    return elemento;
  }

  function concluirPuzzle(elemento) {
    if (
      !elemento ||
      elemento.dataset.resolvido === "true"
    ) {
      return;
    }

    elemento.dataset.resolvido = "true";
    elemento.classList.add("puzzle--resolvido");

    elemento.dispatchEvent(
      new CustomEvent("puzzle-resolvido", {
        bubbles: true,
        detail: {
          chave:
            elemento.dataset.chaveDesbloqueio || ""
        }
      })
    );
  }

  /*
   * Contadores
   */

  function atualizarContadores() {
    const agora = new Date();

    document
      .querySelectorAll("[data-contador-data]")
      .forEach((contador) => {
        const dataInicio = new Date(contador.dataset.contadorData);
        const diferenca = Math.max(
          0,
          agora.getTime() - dataInicio.getTime()
        );
        const dias = Math.floor(diferenca / 86400000);
        const horas = Math.floor((diferenca % 86400000) / 3600000);
        const minutos = Math.floor((diferenca % 3600000) / 60000);
        const segundos = Math.floor((diferenca % 60000) / 1000);
        const valores = {
          dias: dias.toLocaleString("pt-BR"),
          horas: String(horas).padStart(2, "0"),
          minutos: String(minutos).padStart(2, "0"),
          segundos: String(segundos).padStart(2, "0")
        };

        Object.entries(valores).forEach(([unidade, valor]) => {
          const elemento = contador.querySelector(
            `[data-unidade="${unidade}"]`
          );

          if (elemento) {
            elemento.textContent = valor;
          }
        });
      });
  }

  /*
   * Corações decorativos
   */

  function criarCoracaoFlutuante() {
    const container =
      document.getElementById("coracoes");

    if (!container) {
      return;
    }

    const coracao =
      document.createElement("span");

    coracao.className = "coracao-flutuante";
    coracao.textContent = "♡";

    coracao.style.left =
      `${Math.random() * 100}%`;

    coracao.style.fontSize =
      `${12 + Math.random() * 24}px`;

    coracao.style.animationDuration =
      `${9 + Math.random() * 7}s`;

    container.appendChild(coracao);

    window.setTimeout(function () {
      coracao.remove();
    }, 17000);
  }

  /*
   * Carta
   */

  function criarCarta(dados) {
    const elemento =
      document.createElement("article");

    elemento.className = "componente carta";

    const textos = Array.isArray(dados.texto)
      ? dados.texto
      : String(dados.texto || "").split(/\n\s*\n/);

    const paragrafos = textos
      .filter(function (texto) {
        return String(texto).trim() !== "";
      })
      .map(function (texto) {
        return `
          <p>${escaparHTML(texto)}</p>
        `;
      })
      .join("");

    elemento.innerHTML = `
      <span class="componente__etiqueta">
        Uma carta para você
      </span>

      <h3>
        ${escaparHTML(dados.titulo || "Carta")}
      </h3>

      <div class="carta__texto">
        ${paragrafos}
      </div>
    `;

    return elemento;
  }

  /*
   * Vale-night
   */

  function criarValeNight(dados) {
    const elemento = document.createElement("article");
    const direitos = Array.isArray(dados.direitos) ? dados.direitos : [];

    elemento.className = "componente vale-night";
    elemento.innerHTML = `
      <div class="vale-night__cabecalho">
        <div>
          <span class="vale-night__etiqueta">Passe livre para ser feliz</span>
          <h3>${escaparHTML(dados.titulo || "Vale-night")}</h3>
          <p>${escaparHTML(dados.subtitulo || "Uma noite inteira sem culpa")}</p>
        </div>
        <span class="vale-night__numero">Nº 2108</span>
      </div>

      <div class="vale-night__corpo">
        <div class="vale-night__midia">
          <video autoplay muted loop playsinline preload="metadata"
            poster="${escaparHTML(dados.poster || "")}">
            <source src="${escaparHTML(dados.video || "")}" type="video/mp4">
          </video>
          <button class="vale-night__reproduzir" type="button">▶ Tocar animação</button>
          <span>Modo festa: ativado</span>
        </div>

        <div class="vale-night__conteudo">
          <p class="vale-night__introducao">Este vale dá direito a:</p>
          <ul>
            ${direitos.map(function (direito) {
              return `<li><span>✓</span>${escaparHTML(direito)}</li>`;
            }).join("")}
          </ul>

          <dl class="vale-night__regras">
            <div><dt>Validade</dt><dd>${escaparHTML(dados.validade || "Para sempre")}</dd></div>
            <div><dt>Condições</dt><dd>${escaparHTML(dados.condicoes || "Nenhuma")}</dd></div>
            <div><dt>Autorização</dt><dd>${escaparHTML(dados.autorizacao || "Desnecessária")}</dd></div>
          </dl>
        </div>
      </div>

      <div class="vale-night__mensagem">
        <p>${escaparHTML(dados.mensagem || "")}</p>
        <strong>${escaparHTML(dados.destaque || "Nosso relacionamento é casa, não prisão.")}</strong>
        <p>${escaparHTML(dados.despedida || "Vai, aproveita muito — e depois volta para o meu abraço. 🤍")}</p>
      </div>

      <footer class="vale-night__rodape">
        <span>Emitido com amor e confiança</span>
        <span class="vale-night__assinatura">${escaparHTML(dados.assinatura || "Sua gatinha")}</span>
      </footer>
    `;

    const video = elemento.querySelector("video");
    const reproduzir = elemento.querySelector(".vale-night__reproduzir");

    function iniciarVideo() {
      if (!video) return;
      video.defaultMuted = true;
      video.muted = true;
      video.volume = 0;
      const tentativa = video.play();
      if (tentativa && typeof tentativa.catch === "function") {
        tentativa.then(function () {
          elemento.classList.remove("vale-night--aguardando-toque");
        }).catch(function () {
          elemento.classList.add("vale-night--aguardando-toque");
        });
      }
    }

    reproduzir?.addEventListener("click", iniciarVideo);
    video?.addEventListener("canplay", iniciarVideo, { once: true });

    return elemento;
  }

  /*
   * Ritual de boa-noite
   */

  function criarBoaNoite(dados) {
    const elemento = document.createElement("article");
    elemento.className = "componente puzzle boa-noite";
    elemento.innerHTML = `
      <span class="componente__etiqueta">Nosso ritual</span>
      <h3>${escaparHTML(dados.titulo || "Antes de dormir")}</h3>
      <p class="puzzle__descricao">${escaparHTML(dados.instrucao || "Refaça comigo o caminho de volta para a nossa chamada.")}</p>

      <div class="boa-noite__telefone" data-telefone>
        <div class="boa-noite__status"><span>22:47</span><span data-status>Celular no silencioso</span></div>
        <div class="boa-noite__ceu" aria-hidden="true"><i></i><i></i><i></i><i></i><span>☾</span></div>
        <div class="boa-noite__tela">
          <p class="boa-noite__passo" data-passo>Primeiro, tire o celular do silencioso.</p>
          <button class="boa-noite__som" type="button" data-som aria-pressed="false">
            <span data-icone>🔕</span><strong data-som-texto>Ativar o som</strong>
          </button>
          <div class="boa-noite__chamada" data-chamada hidden>
            <span class="boa-noite__avatar">R</span>
            <small>chamada de boa-noite</small>
            <strong>Rayane ♡</strong>
            <button type="button" data-atender>Atender</button>
          </div>
          <div class="boa-noite__juntas" data-juntas hidden>
            <div class="boa-noite__ondas" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
            <p>${escaparHTML(dados.mensagemChamada || "Agora estou aqui. Sem pressa, até o sono chegar.")}</p>
            <button class="boa-noite__ficar" type="button" data-ficar>
              <span data-progresso></span><strong>Segure para ficar com você</strong>
            </button>
          </div>
          <div class="boa-noite__final" data-final hidden>
            <span aria-hidden="true">☾</span>
            <strong>${escaparHTML(dados.mensagemFinal || "Boa noite, meu amor.")}</strong>
            <p>${escaparHTML(dados.dedicatoria || "Hoje eu não posso refazer aquela noite. Mas posso cuidar melhor de todas as próximas.")}</p>
          </div>
        </div>
      </div>
    `;

    const telefone = elemento.querySelector("[data-telefone]");
    const status = elemento.querySelector("[data-status]");
    const passo = elemento.querySelector("[data-passo]");
    const som = elemento.querySelector("[data-som]");
    const chamada = elemento.querySelector("[data-chamada]");
    const juntas = elemento.querySelector("[data-juntas]");
    const final = elemento.querySelector("[data-final]");
    const ficar = elemento.querySelector("[data-ficar]");
    let inicio = 0;
    let animacao = 0;

    som.addEventListener("click", function () {
      som.setAttribute("aria-pressed", "true");
      som.querySelector("[data-icone]").textContent = "🔔";
      som.querySelector("[data-som-texto]").textContent = "Som ativado";
      som.disabled = true;
      status.textContent = "Som ativado";
      passo.textContent = "Desta vez, eu vi você chamar.";
      chamada.hidden = false;
    });

    elemento.querySelector("[data-atender]").addEventListener("click", function () {
      som.hidden = true;
      chamada.hidden = true;
      passo.textContent = "Chamada atendida · 00:01";
      juntas.hidden = false;
    });

    function parar() {
      window.cancelAnimationFrame(animacao);
      inicio = 0;
      ficar.style.setProperty("--progresso", "0%");
    }

    function acompanhar(agora) {
      if (!inicio) inicio = agora;
      const progresso = Math.min(1, (agora - inicio) / 2600);
      ficar.style.setProperty("--progresso", `${progresso * 100}%`);
      if (progresso < 1) {
        animacao = window.requestAnimationFrame(acompanhar);
        return;
      }
      juntas.hidden = true;
      passo.hidden = true;
      final.hidden = false;
      telefone.classList.add("boa-noite__telefone--dormindo");
      concluirPuzzle(elemento);
    }

    ["pointerdown", "keydown"].forEach(function (evento) {
      ficar.addEventListener(evento, function (e) {
        if (evento === "keydown" && !["Enter", " "].includes(e.key)) return;
        e.preventDefault();
        if (!inicio) animacao = window.requestAnimationFrame(acompanhar);
      });
    });
    ["pointerup", "pointercancel", "pointerleave", "keyup", "blur"].forEach(function (evento) {
      ficar.addEventListener(evento, parar);
    });

    return elemento;
  }

  /*
   * Hora de dormir — joguinho em pixel art: ir até o interruptor, apagar a luz,
   * chamar a gata, deitar e pensar nela até dormir
   */

  const HD_CORES = {
    h: "#241915", H: "#4a3226", s: "#b98560", S: "#9c6b49", e: "#1a1212", f: "#94603f",
    o: "#d9d9e0", r: "#7a3f3a", b: "#1f5cab", B: "#174a8c", k: "#1d2f7a", w: "#ffffff",
    g: "#1f9d6a", m: "#f0c890", p: "#ece7f2",
    K: "#141217", W: "#f4f1ec", Y: "#f2b233", D: "#163038", n: "#d98a9a", c: "#8b8696"
  };

  const HD_JULIANA = [
    "....hhHhhHhh....",
    "...hHhhhhhhHh...",
    "..hhhhHhhhhhhh..",
    "..hHhhhhhHhhHh..",
    "..hhshhshhhshh..",
    "..hssssssssssh..",
    "..hsseesseessh..",
    "..ssseesseesss..",
    "..ssfssssssfso..",
    "...sssssrrsss...",
    "....ssssssss....",
    "......SSSS......",
    "...bbbbbbbbbb...",
    "..bbbbbkkkbbbb..",
    ".bbbbkkkkkkbbbb.",
    ".bbbkkwwkwwkbbb.",
    ".sbbkkwgkwgkbbs.",
    ".sbbkkmmmmkkbbs.",
    ".sbbbbkmmkbbbbs.",
    "..bbbbbbbbbbbb..",
    "..BBBBBBBBBBBB..",
    "..BBBBB..BBBBB..",
    "...sss....sss...",
    "...ppp....ppp..."
  ];

  const HD_PASSOS = [
    ["...sss....sss...", "...ppp....ppp..."],
    ["...sss....ppp...", "...ppp.........."],
    ["...ppp....sss...", "..........ppp..."]
  ];

  const HD_AKALI = [
    ".........K....K...",
    ".........KK..KK...",
    "........KKKKKKKK..",
    "........KYYKKYYK..",
    "........KYDKKYDK..",
    "K.......KKKnnKKK..",
    "K........KKWWKK...",
    "KK.KKKKKKKWWWWK...",
    ".KKKKKKKKKWWWWK...",
    "..KKKKKKKKKWWKK...",
    "..KK.KK....KK.KK..",
    "..WW.WW....WW.WW.."
  ];

  const HD_AKALI_PASSO = [".KK...KK..KK...KK.", ".WW...WW..WW...WW."];

  const HD_AKALI_DORMINDO = [
    "..................",
    "..................",
    ".........K....K...",
    ".........KK..KK...",
    "........KKKKKKKK..",
    "........KccKKccK..",
    "..KKKKKKKKKnnKKK..",
    ".KKKKKKKKKKWWKK...",
    "KKKKKKKKKKWWWWK...",
    "KKKKKKKKKKKWWKK...",
    ".KKKKKKKKKKKKK....",
    "..KKK.WW..WW......"
  ];

  function hdSprite(ctx, linhas, x, y, espelhar = false) {
    linhas.forEach(function (linha, j) {
      for (let i = 0; i < linha.length; i += 1) {
        const cor = HD_CORES[linha[i]];
        if (!cor) continue;
        ctx.fillStyle = cor;
        ctx.fillRect(espelhar ? x + linha.length - 1 - i : x + i, y + j, 1, 1);
      }
    });
  }

  function hdRet(ctx, cor, x, y, w, h) {
    ctx.fillStyle = cor;
    ctx.fillRect(x, y, w, h);
  }

  function hdVidroJanela(ctx) {
    hdRet(ctx, "#2c2650", 56, 8, 26, 22);
    hdRet(ctx, "#f5dfac", 74, 10, 4, 6);
    hdRet(ctx, "#f5dfac", 73, 11, 1, 4);
    hdRet(ctx, "#2c2650", 76, 10, 2, 4);
    [[59, 11], [63, 25], [79, 26], [72, 21], [60, 21]].forEach(([x, y]) => hdRet(ctx, "#ffffff", x, y, 1, 1));
    hdRet(ctx, "#f3eff7", 68, 8, 2, 22);
    hdRet(ctx, "#f3eff7", 56, 18, 26, 2);
  }

  function hdQuarto(ctx, luzAcesa) {
    hdRet(ctx, "#ddd6e6", 0, 0, 160, 46);
    hdRet(ctx, "#cfc6db", 0, 0, 160, 3);
    hdRet(ctx, "#b7abc6", 0, 44, 160, 3);

    hdRet(ctx, "#b98e69", 0, 47, 160, 73);
    for (let y = 47, fileira = 0; y < 120; y += 7, fileira += 1) {
      hdRet(ctx, "#a67d5a", 0, y, 160, 1);
      for (let x = (fileira % 2) * 16; x < 160; x += 32) hdRet(ctx, "#a67d5a", x, y + 1, 1, 6);
    }

    // quadros
    hdRet(ctx, "#f0ecf3", 9, 9, 11, 16);
    hdRet(ctx, "#5b4a45", 10, 10, 9, 14);
    hdRet(ctx, "#d8b25a", 12, 13, 5, 5);
    hdRet(ctx, "#5b4a45", 14, 13, 3, 3);
    hdRet(ctx, "#f0ecf3", 23, 7, 10, 18);
    hdRet(ctx, "#4b3a33", 24, 8, 8, 16);
    hdRet(ctx, "#c9a978", 26, 11, 2, 9);
    hdRet(ctx, "#8a6e55", 28, 15, 3, 6);

    // janela e cortinas
    hdRet(ctx, "#f3eff7", 54, 6, 30, 26);
    hdVidroJanela(ctx);
    hdRet(ctx, "#8d7f9b", 47, 3, 44, 1);
    [[49, 4], [84, 4]].forEach(function ([x, y]) {
      hdRet(ctx, "#f6f3f9", x, y, 6, 34);
      hdRet(ctx, "#e2dcea", x + 2, y, 1, 34);
      hdRet(ctx, "#e2dcea", x + 4, y + 2, 1, 32);
    });

    // interruptor
    hdRet(ctx, "#c9bfd5", 39, 19, 7, 9);
    hdRet(ctx, "#f7f5fa", 40, 20, 5, 7);
    hdRet(ctx, "#b3a6c2", 41, luzAcesa ? 21 : 24, 3, 2);

    // tapete
    for (let dy = -9; dy <= 9; dy += 1) {
      const meia = Math.round(24 * Math.sqrt(1 - (dy / 9.5) ** 2));
      hdRet(ctx, Math.abs(dy) > 6 ? "#d48aa8" : "#e7a6c0", 70 - meia, 88 + dy, meia * 2, 1);
    }
    hdRet(ctx, "#f2c3d5", 56, 88, 28, 1);

    // criado-mudo e abajur
    hdRet(ctx, "#8a6b52", 97, 34, 13, 7);
    hdRet(ctx, "#735641", 97, 41, 13, 9);
    hdRet(ctx, "#5e4535", 102, 44, 3, 1);
    hdRet(ctx, "#d9cbe6", 101, 31, 5, 3);
    hdRet(ctx, luzAcesa ? "#f3d58f" : "#8a7d96", 100, 25, 7, 6);

    // cama com lençol florido e cobertor de girafa
    hdRet(ctx, "#8a6a96", 112, 25, 40, 9);
    hdRet(ctx, "#a487b0", 112, 25, 40, 2);
    hdRet(ctx, "#6a4d78", 112, 34, 40, 66);
    hdRet(ctx, "#f2ecef", 114, 34, 36, 62);
    [[116, 47], [146, 40], [117, 92], [147, 88]].forEach(([x, y]) => hdRet(ctx, "#c99ab0", x, y, 2, 2));
    hdRet(ctx, "#ffffff", 120, 37, 24, 9);
    hdRet(ctx, "#e3dde9", 120, 45, 24, 1);
    hdRet(ctx, "#f1dcb8", 114, 50, 36, 46);
    [[115, 53, 8, 6], [125, 52, 9, 5], [136, 53, 7, 6], [145, 52, 5, 7],
     [116, 62, 6, 7], [124, 60, 8, 7], [134, 62, 9, 6], [145, 61, 5, 8],
     [115, 72, 9, 6], [126, 70, 7, 7], [135, 71, 8, 7], [145, 72, 5, 6],
     [117, 81, 7, 7], [126, 80, 9, 6], [137, 81, 7, 7], [146, 80, 4, 7],
     [115, 90, 8, 5], [125, 89, 8, 6], [135, 90, 9, 5], [146, 90, 4, 5]
    ].forEach(([x, y, w, h]) => hdRet(ctx, "#c98a4f", x, y, w, h));
    hdRet(ctx, "#f6ead6", 114, 50, 36, 2);
    hdRet(ctx, "#553d61", 112, 98, 40, 3);
  }

  function criarHoraDeDormir(dados) {
    const boneca = dados.boneca || "Juliana";
    const gata = dados.gata || "Akali";
    const pessoa = dados.pessoa || "Rayane";
    const pensamentos =
      Array.isArray(dados.pensamentos) && dados.pensamentos.length
        ? dados.pensamentos
        : ["a risada dela", "a voz dela baixinha", "o jeitinho dela", `${pessoa} ♡`];
    // Falas da ligação: quando ela atende e quando a Juliana deita ({ quem: "ela" | "eu", texto })
    const falasLigacao =
      Array.isArray(dados.falasLigacao) && dados.falasLigacao.length
        ? dados.falasLigacao
        : [{ quem: "ela", texto: "oi, amor ♡" }, { quem: "eu", texto: "oi, princesa!" }];
    const falasDeitar =
      Array.isArray(dados.falasDeitar) && dados.falasDeitar.length
        ? dados.falasDeitar
        : [{ quem: "eu", texto: "pronto, deitei" }, { quem: "ela", texto: "dorme comigo? ♡" }];
    const VELOCIDADE = 42;
    const DURACAO_PENSAR = 7;
    const OBSTACULOS = [
      { x1: 109, y1: 20, x2: 160, y2: 102 },
      { x1: 94, y1: 20, x2: 112, y2: 54 }
    ];

    const elemento = document.createElement("article");
    elemento.className = "componente puzzle hora-dormir";
    elemento.innerHTML = `
      <span class="componente__etiqueta">${escaparHTML(dados.etiqueta || "Hora de dormir")}</span>
      <h3>${escaparHTML(dados.titulo || "Antes de dormir")}</h3>
      <p class="puzzle__descricao">${escaparHTML(dados.instrucao || "")}</p>

      <div class="hora-dormir__console" tabindex="0" aria-label="Joguinho: use as setas para andar e o botão A para interagir">
        <header class="hora-dormir__topo">
          <span class="hora-dormir__emblema" aria-hidden="true">☾</span>
          <span class="hora-dormir__nome"><strong>${escaparHTML(dados.cabecalho || "QUARTO DA JU")}</strong><small>hora de dormir</small></span>
          <span class="hora-dormir__coracoes" data-coracoes aria-hidden="true"><i>♥</i><i>♥</i><i>♥</i><i>♥</i><i>♥</i></span>
        </header>

        <div class="hora-dormir__tela">
          <canvas width="160" height="120" role="img" aria-label="Quarto em pixel art com a ${escaparHTML(boneca)} e a gata ${escaparHTML(gata)}"></canvas>
          <span class="hora-dormir__fala" data-fala aria-hidden="true"></span>
          <div class="hora-dormir__pensamentos" data-pensamentos aria-hidden="true"></div>
          <div class="hora-dormir__zzz" data-zzz aria-hidden="true" hidden><span>z</span><span>z</span><span>Z</span></div>
          <div class="hora-dormir__ligacao" data-ligacao hidden><i aria-hidden="true"></i><span data-ligacao-texto></span></div>
        </div>

        <p class="hora-dormir__objetivo" data-objetivo aria-live="polite"></p>

        <div class="hora-dormir__controles">
          <div class="hora-dormir__dpad">
            <button type="button" data-dir="cima" aria-label="Andar para cima">↑</button>
            <button type="button" data-dir="esquerda" aria-label="Andar para a esquerda">←</button>
            <button type="button" data-dir="baixo" aria-label="Andar para baixo">↓</button>
            <button type="button" data-dir="direita" aria-label="Andar para a direita">→</button>
          </div>
          <div class="hora-dormir__a-area">
            <button type="button" class="hora-dormir__a" data-a aria-describedby="hd-rotulo"><span data-progresso></span><b>A</b></button>
            <small data-rotulo>interagir</small>
          </div>
        </div>

        <footer class="hora-dormir__rodape">
          <span>↑↓←→ / WASD · E / Enter</span>
          <button type="button" data-recomecar>recomeçar</button>
        </footer>
      </div>

      <div class="hora-dormir__final" data-final hidden>
        <span aria-hidden="true">☾</span>
        <strong>${escaparHTML(dados.mensagemFinal || "Boa noite, meu amor.")}</strong>
        <p>${escaparHTML(dados.dedicatoria || "")}</p>
        <button type="button" class="hora-dormir__musica" data-ir-musica hidden></button>
      </div>
    `;

    const consoleEl = elemento.querySelector(".hora-dormir__console");
    const canvas = elemento.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const fala = elemento.querySelector("[data-fala]");
    const nuvem = elemento.querySelector("[data-pensamentos]");
    const zzz = elemento.querySelector("[data-zzz]");
    const objetivo = elemento.querySelector("[data-objetivo]");
    const botaoA = elemento.querySelector("[data-a]");
    const rotulo = elemento.querySelector("[data-rotulo]");
    const anel = elemento.querySelector("[data-progresso]");
    const coracoes = elemento.querySelectorAll("[data-coracoes] i");
    const final = elemento.querySelector("[data-final]");
    const ligacao = elemento.querySelector("[data-ligacao]");
    const ligacaoTexto = elemento.querySelector("[data-ligacao-texto]");
    rotulo.id = `hd-rotulo-${Math.random().toString(36).slice(2, 8)}`;
    botaoA.setAttribute("aria-describedby", rotulo.id);

    const direcoes = new Set();
    let timers = [];
    let estado;
    let quadro = 0;
    let ultimo = 0;
    let visivel = false;
    let timerFala = 0;

    function inicial() {
      timers.forEach((id) => window.clearTimeout(id));
      timers = [];
      estado = {
        etapa: "ligar",
        luz: true,
        x: 66, y: 74,
        alvo: null,
        andando: false,
        tempo: 0,
        deitada: false,
        progresso: 0,
        segurando: false,
        proximoPensamento: 0,
        indicePensamento: 0,
        inicioLigacao: 0,
        gata: { x: 70, y: 90, modo: "dormindo", esquerda: false, salto: 0 }
      };
      nuvem.innerHTML = "";
      zzz.hidden = true;
      ligacao.hidden = true;
      ligacao.classList.remove("hora-dormir__ligacao--ativa");
      fala.classList.remove("hora-dormir__fala--visivel");
      anel.style.setProperty("--p", "0");
      atualizarInterface();
      desenhar();
    }

    function depois(ms, fn) {
      timers.push(window.setTimeout(fn, ms));
    }

    function pertoInterruptor() {
      return estado.x >= 28 && estado.x <= 56 && estado.y <= 64;
    }

    function pertoCama() {
      return estado.x >= 90 && estado.y >= 50 && estado.y <= 106;
    }

    function podeAndar() {
      return ["ligar", "chamando", "conversando", "luz", "akali", "esperando", "cama"].includes(estado.etapa);
    }

    function acaoDisponivel() {
      const etapa = estado.etapa;
      return etapa === "ligar" || (etapa === "luz" && pertoInterruptor()) || etapa === "akali" ||
        (etapa === "cama" && pertoCama()) || etapa === "pensar";
    }

    function atualizarInterface() {
      const textos = {
        ligar: [`antes de tudo: ligue para a ${pessoa} ♡`, "ligar"],
        chamando: [`ligando para a ${pessoa}...`, "..."],
        conversando: [`em ligação com a ${pessoa} ♡`, "..."],
        luz: [`com ela na linha, vá até o interruptor e apague a luz`, "apagar luz"],
        akali: [`luz apagada. agora chame a ${gata} ♡`, `chamar ${gata}`],
        esperando: [`a ${gata} está vindo...`, "..."],
        cama: ["agora vá até a cama e deite", "deitar"],
        deitando: [`deitadinha, com a ${pessoa} na linha ♡`, "..."],
        pensar: ["segure o A e durmam juntinhas na ligação", "segure ♡"],
        fim: ["dormiram em ligação ♡", "boa noite"]
      };
      const [texto, acao] = textos[estado.etapa];
      if (objetivo.textContent !== texto) objetivo.textContent = texto;
      rotulo.textContent = acao;
      botaoA.classList.toggle("hora-dormir__a--pronto", acaoDisponivel());
      botaoA.disabled = ["fim", "esperando", "chamando", "conversando", "deitando"].includes(estado.etapa);
      const feitos = { ligar: 0, chamando: 0, conversando: 1, luz: 1, akali: 2, esperando: 2, cama: 3, deitando: 4, pensar: 4, fim: 5 }[estado.etapa];
      coracoes.forEach((coracao, indice) => coracao.classList.toggle("hora-dormir__coracao--cheio", indice < feitos));
    }

    function posicionar(el, x, y) {
      el.style.left = `${(x / 160) * 100}%`;
      el.style.top = `${(y / 120) * 100}%`;
    }

    function falar(texto, x, y, dela = false) {
      window.clearTimeout(timerFala);
      fala.textContent = texto;
      fala.classList.toggle("hora-dormir__fala--dela", dela);
      // Mantém o balão inteiro dentro da tela, mesmo com frases longas.
      const meia = ((fala.offsetWidth / 2) / (canvas.clientWidth || 1)) * 160 + 2;
      posicionar(fala, Math.max(meia, Math.min(160 - meia, x)), y);
      fala.classList.add("hora-dormir__fala--visivel");
      timerFala = window.setTimeout(() => fala.classList.remove("hora-dormir__fala--visivel"), 1900);
    }

    function atualizarLigacao() {
      if (!estado.inicioLigacao) return;
      const segundos = Math.floor((performance.now() - estado.inicioLigacao) / 1000);
      const tempo = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;
      ligacaoTexto.textContent = `${pessoa} ♡ · ${tempo}`;
    }

    function posicaoCelular() {
      if (estado.deitada) return [142, 34];
      const x = Math.round(estado.x);
      const y = Math.round(estado.y);
      // Na mão até ligar; depois, encostado na orelha.
      return estado.etapa === "ligar" ? [x + 6, y - 9] : [x + 5, y - 19];
    }

    function conversar(falas, proximaEtapa) {
      falas.forEach(function (fala, indice) {
        depois(indice * 1900, function () {
          const dela = fala.quem === "ela";
          if (dela) {
            const [cx, cy] = posicaoCelular();
            falar(fala.texto, cx + 2, cy - 2, true);
          } else if (estado.deitada) {
            falar(fala.texto, 132, 31);
          } else {
            falar(fala.texto, estado.x, estado.y - 27);
          }
        });
      });
      depois(falas.length * 1900, function () {
        estado.etapa = proximaEtapa;
        atualizarInterface();
      });
    }

    function fazerLigacao() {
      estado.etapa = "chamando";
      ligacao.hidden = false;
      ligacaoTexto.textContent = `chamando ${pessoa}...`;
      depois(2200, function () {
        estado.inicioLigacao = performance.now();
        estado.etapa = "conversando";
        ligacao.classList.add("hora-dormir__ligacao--ativa");
        atualizarLigacao();
        atualizarInterface();
        conversar(falasLigacao, "luz");
      });
    }

    function bloqueado(x, y) {
      return OBSTACULOS.some((o) => x > o.x1 && x < o.x2 && y > o.y1 && y < o.y2);
    }

    function mover(dt) {
      if (!podeAndar()) {
        estado.andando = false;
        return;
      }
      let vx = (direcoes.has("direita") ? 1 : 0) - (direcoes.has("esquerda") ? 1 : 0);
      let vy = (direcoes.has("baixo") ? 1 : 0) - (direcoes.has("cima") ? 1 : 0);
      if (vx || vy) {
        estado.alvo = null;
      } else if (estado.alvo) {
        vx = estado.alvo.x - estado.x;
        vy = estado.alvo.y - estado.y;
        if (Math.hypot(vx, vy) < 1.2) {
          estado.alvo = null;
          vx = 0;
          vy = 0;
        }
      }
      const tamanho = Math.hypot(vx, vy);
      estado.andando = tamanho > 0;
      if (!estado.andando) return;

      const passo = VELOCIDADE * dt;
      const nx = Math.max(10, Math.min(150, estado.x + (vx / tamanho) * passo));
      const ny = Math.max(56, Math.min(116, estado.y + (vy / tamanho) * passo));
      if (!bloqueado(nx, ny)) {
        estado.x = nx;
        estado.y = ny;
      } else if (!bloqueado(nx, estado.y)) {
        estado.x = nx;
      } else if (!bloqueado(estado.x, ny)) {
        estado.y = ny;
      } else {
        estado.alvo = null;
      }
    }

    function moverGata(dt) {
      const g = estado.gata;
      if (g.modo === "andando") {
        const dx = 104 - g.x;
        const dy = 78 - g.y;
        const dist = Math.hypot(dx, dy);
        g.esquerda = dx < 0;
        if (dist < 1) {
          g.modo = "pulando";
          g.salto = 0;
        } else {
          const passo = Math.min(dist, 36 * dt);
          g.x += (dx / dist) * passo;
          g.y += (dy / dist) * passo;
        }
      } else if (g.modo === "pulando") {
        g.salto = Math.min(1, g.salto + dt / 0.45);
        g.x = 104 + (128 - 104) * g.salto;
        g.y = 78 + (74 - 78) * g.salto - Math.sin(g.salto * Math.PI) * 12;
        if (g.salto >= 1) {
          g.modo = "na-cama";
          g.esquerda = true;
          if (estado.etapa === "esperando") {
            estado.etapa = "cama";
            falar("mrrr ♡", g.x, g.y - 14);
            atualizarInterface();
          }
        }
      }
    }

    function pensar(dt) {
      if (estado.etapa !== "pensar" || !estado.segurando) return;
      estado.progresso = Math.min(1, estado.progresso + dt / DURACAO_PENSAR);
      estado.proximoPensamento -= dt;
      if (estado.proximoPensamento <= 0) {
        soltarPensamento();
        estado.proximoPensamento = 0.75;
      }
      anel.style.setProperty("--p", String(Math.round(estado.progresso * 100)));
      if (estado.progresso >= 1) dormir();
    }

    function soltarPensamento() {
      const i = estado.indicePensamento;
      const balao = document.createElement("span");
      balao.className = "hora-dormir__pensamento";
      balao.textContent = i % 2 ? "♡" : pensamentos[(i / 2) % pensamentos.length];
      balao.style.setProperty("--desvio", `${Math.round(Math.random() * 36 - 18)}px`);
      posicionar(balao, 118 + Math.random() * 14, 34);
      balao.addEventListener("animationend", () => balao.remove());
      nuvem.appendChild(balao);
      estado.indicePensamento += 1;
    }

    function interagir() {
      const etapa = estado.etapa;
      if (etapa === "ligar") {
        fazerLigacao();
      } else if (etapa === "luz") {
        if (!pertoInterruptor()) {
          falar("o interruptor fica ali na parede", estado.x, estado.y - 27);
          return;
        }
        estado.luz = false;
        estado.etapa = "akali";
        falar("*clique*", 42, 17);
      } else if (etapa === "akali") {
        estado.etapa = "esperando";
        falar(`${gata}! vem dormir ♡`, estado.x, estado.y - 27);
        depois(1000, function () {
          estado.gata.modo = "acordada";
          falar("miau?", estado.gata.x, estado.gata.y - 14);
        });
        depois(1900, () => { estado.gata.modo = "andando"; });
      } else if (etapa === "cama") {
        if (!pertoCama()) {
          falar("a cama fica ali →", estado.x, estado.y - 27);
          return;
        }
        estado.etapa = "deitando";
        estado.deitada = true;
        estado.alvo = null;
        direcoes.clear();
        Object.assign(estado.gata, { x: 132, y: 86, modo: "na-cama", esquerda: true });
        conversar(falasDeitar, "pensar");
      }
      atualizarInterface();
    }

    function dormir() {
      estado.etapa = "fim";
      estado.segurando = false;
      estado.gata.modo = "dormindo";
      zzz.hidden = false;
      atualizarInterface();
      depois(1400, function () {
        final.hidden = false;
        concluirPuzzle(elemento);
        ligarBotaoMusica(elemento, final.querySelector("[data-ir-musica]"));
      });
    }

    function desenhar() {
      ctx.clearRect(0, 0, 160, 120);
      hdQuarto(ctx, estado.luz);

      const g = estado.gata;
      const atores = [];
      if (!estado.deitada) atores.push({ y: estado.y, desenhar: desenharJuliana });
      atores.push({ y: g.modo === "na-cama" || g.modo === "pulando" || estado.deitada ? 999 : g.y, desenhar: desenharGata });
      if (estado.deitada) desenharJulianaDeitada();
      atores.sort((a, b) => a.y - b.y).forEach((ator) => ator.desenhar());
      const celularAceso = estado.etapa === "chamando" || Boolean(estado.inicioLigacao);
      if (estado.deitada) desenharCelular(celularAceso);

      if (estado.luz) {
        const brilho = ctx.createRadialGradient(103, 28, 2, 103, 28, 46);
        brilho.addColorStop(0, "rgba(255, 222, 150, 0.32)");
        brilho.addColorStop(1, "rgba(255, 222, 150, 0)");
        ctx.fillStyle = brilho;
        ctx.fillRect(40, 0, 120, 90);
      } else {
        ctx.fillStyle = estado.etapa === "fim" ? "rgba(10, 8, 26, 0.72)" : "rgba(14, 11, 32, 0.6)";
        ctx.fillRect(0, 0, 160, 120);
        hdVidroJanela(ctx);
        ctx.fillStyle = "rgba(185, 195, 255, 0.1)";
        ctx.beginPath();
        ctx.moveTo(56, 30);
        ctx.lineTo(82, 30);
        ctx.lineTo(104, 116);
        ctx.lineTo(34, 116);
        ctx.closePath();
        ctx.fill();
        if (celularAceso) {
          const [cx, cy] = posicaoCelular();
          const tela = ctx.createRadialGradient(cx + 2, cy + 3, 1, cx + 2, cy + 3, 16);
          tela.addColorStop(0, "rgba(190, 225, 255, 0.35)");
          tela.addColorStop(1, "rgba(190, 225, 255, 0)");
          ctx.fillStyle = tela;
          ctx.fillRect(cx - 16, cy - 14, 36, 36);
          desenharCelular(true);
        }
      }
    }

    function desenharCelular(aceso) {
      const [x, y] = posicaoCelular();
      const [w, h] = estado.deitada ? [4, 7] : [3, 6];
      hdRet(ctx, "#15141c", x, y, w, h);
      hdRet(ctx, aceso ? "#bfe3ff" : "#3a3f55", x + 1, y + 1, w - 2, h - 3);
      if (estado.etapa === "ligar" && Math.floor(estado.tempo / 0.4) % 2) {
        hdRet(ctx, "#f4b3c8", x - 1, y - 2, w + 2, 1);
      }
    }

    function desenharJuliana() {
      const x = Math.round(estado.x - 8);
      const y = Math.round(estado.y - 24);
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.fillRect(x + 3, y + 23, 10, 2);
      const linhas = HD_JULIANA.slice(0, 22);
      const passo = estado.andando ? 1 + (Math.floor(estado.tempo / 0.16) % 2) : 0;
      hdSprite(ctx, linhas.concat(HD_PASSOS[passo]), x, y - (passo ? 1 : 0));
      desenharCelular(estado.etapa === "chamando" || Boolean(estado.inicioLigacao));
    }

    function desenharJulianaDeitada() {
      const cabeca = HD_JULIANA.slice(0, 11).map(function (linha, j) {
        if (j === 6 && estado.progresso > 0.6) return linha.replace(/e/g, estado.etapa === "fim" ? "s" : "S");
        if (j === 7 && estado.etapa === "fim") return linha.replace(/e/g, "f");
        return linha;
      });
      hdSprite(ctx, cabeca, 124, 32);
      hdRet(ctx, "#f6ead6", 114, 47, 36, 3);
    }

    function desenharGata() {
      const g = estado.gata;
      const x = Math.round(g.x - 9);
      const y = Math.round(g.y - 12);
      if (g.modo !== "pulando") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
        ctx.fillRect(x + 2, y + 11, 14, 2);
      }
      if (g.modo === "dormindo") {
        hdSprite(ctx, HD_AKALI_DORMINDO, x, y, g.esquerda);
        return;
      }
      let linhas = HD_AKALI;
      if (g.modo === "andando" && Math.floor(estado.tempo / 0.14) % 2) {
        linhas = HD_AKALI.slice(0, 10).concat(HD_AKALI_PASSO);
      }
      hdSprite(ctx, linhas, x, y, g.esquerda);
    }

    function laco(agora) {
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 0;
      ultimo = agora;
      estado.tempo += dt;
      mover(dt);
      moverGata(dt);
      pensar(dt);
      atualizarLigacao();
      if (estado.etapa === "luz" || estado.etapa === "cama") atualizarInterface();
      desenhar();
      quadro = visivel ? window.requestAnimationFrame(laco) : 0;
      if (!quadro) ultimo = 0;
    }

    function ligar() {
      if (visivel && !quadro) quadro = window.requestAnimationFrame(laco);
    }

    // Controles
    const TECLAS = {
      ArrowUp: "cima", KeyW: "cima", ArrowDown: "baixo", KeyS: "baixo",
      ArrowLeft: "esquerda", KeyA: "esquerda", ArrowRight: "direita", KeyD: "direita"
    };

    function apertarA() {
      if (estado.etapa === "pensar") {
        estado.segurando = true;
      } else {
        interagir();
      }
    }

    consoleEl.addEventListener("keydown", function (evento) {
      const direcao = TECLAS[evento.code];
      if (direcao) {
        evento.preventDefault();
        direcoes.add(direcao);
      } else if (evento.code === "KeyE" || (["Enter", "Space"].includes(evento.code) && evento.target === consoleEl)) {
        evento.preventDefault();
        if (!evento.repeat) apertarA();
      }
    });

    consoleEl.addEventListener("keyup", function (evento) {
      const direcao = TECLAS[evento.code];
      if (direcao) direcoes.delete(direcao);
      if (["KeyE", "Enter", "Space"].includes(evento.code)) estado.segurando = false;
    });

    consoleEl.addEventListener("focusout", function () {
      direcoes.clear();
      estado.segurando = false;
    });

    elemento.querySelectorAll("[data-dir]").forEach(function (botao) {
      const direcao = botao.dataset.dir;
      botao.addEventListener("pointerdown", function (evento) {
        evento.preventDefault();
        direcoes.add(direcao);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((nome) => botao.addEventListener(nome, () => direcoes.delete(direcao)));
    });

    botaoA.addEventListener("pointerdown", function (evento) {
      evento.preventDefault();
      apertarA();
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((nome) => botaoA.addEventListener(nome, () => { estado.segurando = false; }));
    botaoA.addEventListener("keydown", function (evento) {
      if (!["Enter", " "].includes(evento.key)) return;
      evento.preventDefault();
      evento.stopPropagation();
      if (!evento.repeat) apertarA();
    });
    botaoA.addEventListener("keyup", () => { estado.segurando = false; });

    canvas.addEventListener("click", function (evento) {
      if (!podeAndar()) return;
      const caixa = canvas.getBoundingClientRect();
      estado.alvo = {
        x: ((evento.clientX - caixa.left) / caixa.width) * 160,
        y: Math.max(56, ((evento.clientY - caixa.top) / caixa.height) * 120)
      };
      consoleEl.focus({ preventScroll: true });
    });

    elemento.querySelector("[data-recomecar]").addEventListener("click", function () {
      final.hidden = true;
      inicial();
    });

    new IntersectionObserver(function (entradas) {
      visivel = entradas.some((entrada) => entrada.isIntersecting);
      ligar();
    }).observe(canvas);

    inicial();
    return elemento;
  }

  // Quando um joguinho termina, o botão do final leva até a música que ele desbloqueou.
  function ligarBotaoMusica(elemento, botao) {
    const chave = elemento.dataset.chaveDesbloqueio;
    const capitulo = elemento.closest(".capitulo");
    if (!chave || !capitulo || !botao) return;
    const musica = [...capitulo.querySelectorAll(".musica")].find((item) => item.dataset.chaveDesbloqueio === chave);
    if (!musica) return;
    const titulo = musica.querySelector(".musica__conteudo h3")?.textContent.trim() || "nossa música";
    botao.textContent = `♪ música desbloqueada: ${titulo} · ouvir agora`;
    botao.hidden = false;
    botao.onclick = function () {
      musica.scrollIntoView({ behavior: "smooth", block: "center" });
      musica.classList.remove("musica--destaque");
      void musica.offsetWidth;
      musica.classList.add("musica--destaque");
    };
  }

  /*
   * Labirinto de chocolate — a bonequinha da Rayane atravessa uma barra de
   * chocolate, passa por um desafio a cada mês, pega os bombons com as memórias
   * e chega até a Juliana, que entrega uma mensagem
   */

  // # parede · Q cofre · v velinha · c porta de bolo · ~ rio de chocolate
  // m/n marshmallows que afundam em tempos diferentes · B barra para quebrar
  // 1–5 bombons · r ponto de retorno · S começo · J Juliana
  const LC_MAPA = [
    "####################",
    "#S..#.....#....#...#",
    "#.#.#.###.#.##.Q.1.#",
    "#.#...#.....#..#...#",
    "#################.##",
    "#..#......#.......v#",
    "#2.c..##.....v.##..#",
    "#..#.v....#........#",
    "#.##################",
    "#......#~~~~#......#",
    "#.##..r.mmnn....3..#",
    "#......#~~~~#......#",
    "##################.#",
    "#.................r#",
    "#4.................#",
    "#..................#",
    "#.##################",
    "#.....#............#",
    "#.....B..5.......J.#",
    "#.....#............#",
    "####################"
  ];
  const LC_T = 16;
  const LC_COLUNAS = LC_MAPA[0].length;
  const LC_LINHAS = LC_MAPA.length;
  const LC_TRUFAS = [
    { coluna: 15, velocidade: 0.8, fase: 0 },
    { coluna: 12, velocidade: 0.95, fase: 0.9 },
    { coluna: 9, velocidade: 0.75, fase: 0.3 },
    { coluna: 6, velocidade: 1.05, fase: 1.4 }
  ];

  const LC_RAYANE_CORES = {
    h: "#2a1812", H: "#4a2c20", q: "#f2cdb0", Q: "#d9a98a", e: "#2a1812", r: "#c4566a",
    n: "#f0a3a8", K: "#17151b", c: "#34303a", j: "#3c5f93", J: "#2c4775", w: "#f4f1ec", Y: "#e7c45a"
  };

  const LC_RAYANE = [
    "....hhhhhhhh....",
    "...hhhHHhhhhh...",
    "..hhhHhhhhhhhh..",
    "..hhhhhhhhhhhh..",
    "..hhqqqqqqqqhh..",
    "..hqqqqqqqqqqh..",
    "..hqqeeqqeeqqh..",
    "..hqqeeqqeeqqh..",
    "..hqnqqqqqqnqh..",
    "..hhqqqrrqqqhh..",
    "..hhYqqqqqqhhh..",
    "..hhhhQQQQhhhh..",
    ".hhhKKKKKKKKhhh.",
    ".hhKKKKcKKKKKhh.",
    ".hhKKKKKKKKKKhh.",
    ".qhKKKKKKKKKKhq.",
    ".qKKKKKKKKKKKKq.",
    "..KKKKKKKKKKKK..",
    "..jjjjjjjjjjjj..",
    "..jjjjjjjjjjjj..",
    "..jjjjjjjjjjjj..",
    "..jjjjj..jjjjj.."
  ];

  const LC_PASSOS = [
    ["...jjj....jjj...", "...www....www..."],
    ["...jjj....www...", "...www.........."],
    ["...www....jjj...", "..........www..."]
  ];

  function lcSprite(ctx, linhas, cores, x, y, espelhar = false) {
    linhas.forEach(function (linha, j) {
      for (let i = 0; i < linha.length; i += 1) {
        const cor = cores[linha[i]];
        if (!cor) continue;
        ctx.fillStyle = cor;
        ctx.fillRect(espelhar ? x + linha.length - 1 - i : x + i, y + j, 1, 1);
      }
    });
  }

  function criarLabirintoChocolate(dados) {
    const boneca = dados.boneca || "Rayane";
    const pessoa = dados.pessoa || "Juliana";
    const memorias = Array.isArray(dados.memorias) ? dados.memorias : [];
    const quiz = dados.quiz || {
      pergunta: "Em que dia viramos uma da outra?",
      opcoes: ["05 de junho", "16 de junho", "30 de julho"],
      resposta: "16 de junho"
    };
    const falasEncontro =
      Array.isArray(dados.falasEncontro) && dados.falasEncontro.length
        ? dados.falasEncontro
        : [{ quem: "eu", texto: "você chegou ♡" }, { quem: "ela", texto: "achei você!" }];
    const VELOCIDADE = 50;
    const MUNDO_L = LC_COLUNAS * LC_T;
    const MUNDO_A = LC_LINHAS * LC_T;

    const elemento = document.createElement("article");
    elemento.className = "componente puzzle hora-dormir labirinto-choco";
    elemento.innerHTML = `
      <span class="componente__etiqueta">${escaparHTML(dados.etiqueta || "Bodas de chocolate")}</span>
      <h3>${escaparHTML(dados.titulo || "Vem me encontrar?")}</h3>
      <p class="puzzle__descricao">${escaparHTML(dados.instrucao || "")}</p>

      <div class="hora-dormir__console" tabindex="0" aria-label="Joguinho: use as setas para andar e o botão A para interagir">
        <header class="hora-dormir__topo">
          <span class="hora-dormir__emblema" aria-hidden="true">♥</span>
          <span class="hora-dormir__nome"><strong>${escaparHTML(dados.cabecalho || "LABIRINTO DE CHOCOLATE")}</strong><small>${escaparHTML(dados.subcabecalho || "cinco meses, cinco bombons")}</small></span>
          <span class="labirinto-choco__bombons" data-bombons aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
        </header>

        <div class="hora-dormir__tela">
          <canvas width="160" height="120" role="img" aria-label="Labirinto de chocolate em pixel art com a ${escaparHTML(boneca)}"></canvas>
          <span class="hora-dormir__fala" data-fala aria-hidden="true"></span>
        </div>

        <p class="hora-dormir__objetivo" data-objetivo aria-live="polite"></p>

        <div class="hora-dormir__controles">
          <div class="hora-dormir__dpad">
            <button type="button" data-dir="cima" aria-label="Andar para cima">↑</button>
            <button type="button" data-dir="esquerda" aria-label="Andar para a esquerda">←</button>
            <button type="button" data-dir="baixo" aria-label="Andar para baixo">↓</button>
            <button type="button" data-dir="direita" aria-label="Andar para a direita">→</button>
          </div>
          <div class="hora-dormir__a-area">
            <button type="button" class="hora-dormir__a" data-a><span></span><b>A</b></button>
            <small data-rotulo>interagir</small>
          </div>
        </div>

        <footer class="hora-dormir__rodape">
          <span>↑↓←→ / WASD · E / Enter</span>
          <button type="button" data-recomecar>recomeçar</button>
        </footer>

        <div class="labirinto-choco__cartao" data-cartao role="dialog" aria-live="polite" hidden></div>
      </div>

      <div class="hora-dormir__final labirinto-choco__final" data-final hidden>
        <span aria-hidden="true">♥</span>
        <strong>${escaparHTML(dados.mensagemFinal || "Feliz bodas de chocolate.")}</strong>
        ${(dados.mensagem || "").split("\n\n").map((paragrafo) => `<p>${escaparHTML(paragrafo)}</p>`).join("")}
        <p class="labirinto-choco__assinatura">${escaparHTML(dados.assinatura || "")}</p>
        <button type="button" class="hora-dormir__musica" data-ir-musica hidden></button>
      </div>
    `;

    const consoleEl = elemento.querySelector(".hora-dormir__console");
    const canvas = elemento.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const fala = elemento.querySelector("[data-fala]");
    const cartao = elemento.querySelector("[data-cartao]");
    const objetivo = elemento.querySelector("[data-objetivo]");
    const botaoA = elemento.querySelector("[data-a]");
    const rotulo = elemento.querySelector("[data-rotulo]");
    const bombonsHud = elemento.querySelectorAll("[data-bombons] i");
    const final = elemento.querySelector("[data-final]");
    rotulo.id = `lc-rotulo-${Math.random().toString(36).slice(2, 8)}`;
    botaoA.setAttribute("aria-describedby", rotulo.id);

    const direcoes = new Set();
    let timers = [];
    let estado;
    let quadro = 0;
    let ultimo = 0;
    let visivel = false;
    let timerFala = 0;

    function centro(coluna, linha) {
      return { x: coluna * LC_T + LC_T / 2, y: linha * LC_T + LC_T - 3 };
    }

    function acharNoMapa(letra) {
      for (let linha = 0; linha < LC_LINHAS; linha += 1) {
        const coluna = LC_MAPA[linha].indexOf(letra);
        if (coluna >= 0) return { coluna, linha };
      }
      return null;
    }

    const POS = {
      S: acharNoMapa("S"), Q: acharNoMapa("Q"), c: acharNoMapa("c"), B: acharNoMapa("B"), J: acharNoMapa("J")
    };
    const VELAS = [];
    LC_MAPA.forEach((linha, l) => [...linha].forEach((letra, c) => { if (letra === "v") VELAS.push(`${c},${l}`); }));

    function inicial() {
      timers.forEach((id) => window.clearTimeout(id));
      timers = [];
      const comeco = centro(POS.S.coluna, POS.S.linha);
      estado = {
        x: comeco.x, y: comeco.y,
        retorno: comeco,
        esquerda: false,
        andando: false,
        alvo: null,
        tempo: 0,
        cofreAberto: false,
        velasApagadas: new Set(),
        fumaca: {},
        barra: 0,
        tremor: 0,
        bombons: new Set(),
        cartao: null,
        caindo: 0,
        ferida: 0,
        encontro: false,
        fim: false
      };
      cartao.hidden = true;
      cartao.innerHTML = "";
      final.hidden = true;
      fala.classList.remove("hora-dormir__fala--visivel");
      atualizarInterface();
      desenhar();
    }

    function depois(ms, fn) {
      timers.push(window.setTimeout(fn, ms));
    }

    function letraEm(coluna, linha) {
      if (linha < 0 || linha >= LC_LINHAS || coluna < 0 || coluna >= LC_COLUNAS) return "#";
      return LC_MAPA[linha][coluna];
    }

    function solido(coluna, linha) {
      const letra = letraEm(coluna, linha);
      if (letra === "#" || letra === "v" || letra === "J") return true;
      if (letra === "Q") return !estado.cofreAberto;
      if (letra === "c") return estado.velasApagadas.size < VELAS.length;
      if (letra === "B") return estado.barra < 5;
      return false;
    }

    function bloqueado(x, y) {
      return [[x - 5, y - 6], [x + 5, y - 6], [x - 5, y - 1], [x + 5, y - 1]].some(
        ([px, py]) => solido(Math.floor(px / LC_T), Math.floor(py / LC_T))
      );
    }

    // Os marshmallows aparecem e afundam em dois grupos alternados.
    function fasePedra(letra) {
      const ciclo = 3.2;
      return letra === "m" ? estado.tempo % ciclo : (estado.tempo + 1.6) % ciclo;
    }

    function pedraFirme(letra) {
      return fasePedra(letra) < 2.2;
    }

    function posTrufa(trufa) {
      const p = (estado.tempo * trufa.velocidade + trufa.fase) % 2;
      const k = p < 1 ? p : 2 - p;
      return { x: trufa.coluna * LC_T + 8, y: 13 * LC_T + 8 + k * 2 * LC_T };
    }

    function perto(pos) {
      if (!pos) return false;
      const alvo = { x: pos.coluna * LC_T + 8, y: pos.linha * LC_T + 8 };
      return Math.hypot(estado.x - alvo.x, estado.y - 6 - alvo.y) < 22;
    }

    function velaPerto() {
      return VELAS.find((chave) => {
        if (estado.velasApagadas.has(chave)) return false;
        const [coluna, linha] = chave.split(",").map(Number);
        return perto({ coluna, linha });
      });
    }

    function acaoAtual() {
      if (estado.cartao === "memoria") return "continuar";
      if (estado.cartao || estado.fim || estado.encontro) return "";
      if (!estado.cofreAberto && perto(POS.Q)) return "abrir";
      if (velaPerto()) return "assoprar";
      if (estado.barra < 5 && perto(POS.B)) return "quebrar";
      return "";
    }

    function textoObjetivo() {
      const b = estado.bombons;
      if (estado.fim) return `${boneca} encontrou a ${pessoa} ♡`;
      if (estado.encontro) return "...";
      if (estado.cartao === "quiz") return "o cofre só abre com a data certa";
      if (estado.cartao === "memoria") return "uma memória desbloqueada ♡";
      if (!estado.cofreAberto) return "um cofre de chocolate guarda o primeiro bombom. vá até ele e aperte A";
      if (!b.has(1)) return "pegue o bombom de junho";
      if (estado.velasApagadas.size < VELAS.length) return `assopre as velinhas dos bolinhos de aniversário (${estado.velasApagadas.size}/${VELAS.length})`;
      if (!b.has(2)) return "a porta de bolo abriu! pegue o bombom de julho";
      if (!b.has(3)) return "pise nos marshmallows e espere os próximos subirem antes de pular";
      if (!b.has(4)) return "cuidado com as trufas rolando! passe entre elas";
      if (estado.barra < 5) return `uma barra de chocolate fecha o caminho: aperte A para quebrar (${estado.barra}/5)`;
      if (!b.has(5)) return "pegue o último bombom";
      return `agora vá até a ${pessoa} ♡`;
    }

    function atualizarInterface() {
      const texto = textoObjetivo();
      if (objetivo.textContent !== texto) objetivo.textContent = texto;
      const acao = acaoAtual();
      rotulo.textContent = acao || "interagir";
      botaoA.classList.toggle("hora-dormir__a--pronto", Boolean(acao));
      botaoA.disabled = estado.fim || estado.encontro;
      bombonsHud.forEach((bombom, indice) => bombom.classList.toggle("labirinto-choco__bombom--cheio", estado.bombons.has(indice + 1)));
    }

    function camera() {
      return {
        x: Math.max(0, Math.min(MUNDO_L - 160, Math.round(estado.x - 80))),
        y: Math.max(0, Math.min(MUNDO_A - 120, Math.round(estado.y - 72)))
      };
    }

    function falar(texto, x, y, dela = false) {
      const cam = camera();
      window.clearTimeout(timerFala);
      fala.textContent = texto;
      fala.classList.toggle("hora-dormir__fala--dela", dela);
      const meia = ((fala.offsetWidth / 2) / (canvas.clientWidth || 1)) * 160 + 2;
      const sx = Math.max(meia, Math.min(160 - meia, x - cam.x));
      fala.style.left = `${(sx / 160) * 100}%`;
      fala.style.top = `${(Math.max(14, y - cam.y) / 120) * 100}%`;
      fala.classList.add("hora-dormir__fala--visivel");
      timerFala = window.setTimeout(() => fala.classList.remove("hora-dormir__fala--visivel"), 1900);
    }

    function falarEla(texto) {
      falar(texto, estado.x, estado.y - 27);
    }

    function abrirCartao(tipo, html) {
      estado.cartao = tipo;
      direcoes.clear();
      estado.alvo = null;
      cartao.innerHTML = html;
      cartao.hidden = false;
      atualizarInterface();
    }

    function fecharCartao() {
      estado.cartao = null;
      cartao.hidden = true;
      cartao.innerHTML = "";
      consoleEl.focus({ preventScroll: true });
      atualizarInterface();
    }

    function mostrarMemoria(numero) {
      const memoria = memorias[numero - 1] || {};
      abrirCartao("memoria", `
        <small>bombom ${numero} de 5 · ${escaparHTML(memoria.mes || "")}</small>
        <strong>${escaparHTML(memoria.titulo || "")}</strong>
        <p>${escaparHTML(memoria.texto || "")}</p>
        <button type="button" data-continuar>continuar ♥</button>
      `);
      cartao.querySelector("[data-continuar]").addEventListener("click", fecharCartao);
      cartao.querySelector("[data-continuar]").focus({ preventScroll: true });
    }

    function mostrarQuiz() {
      abrirCartao("quiz", `
        <small>o cofre de chocolate pergunta</small>
        <strong>${escaparHTML(quiz.pergunta)}</strong>
        <div class="labirinto-choco__opcoes">
          ${quiz.opcoes.map((opcao) => `<button type="button" data-opcao="${escaparHTML(opcao)}">${escaparHTML(opcao)}</button>`).join("")}
        </div>
        <p data-quiz-aviso></p>
      `);
      cartao.querySelectorAll("[data-opcao]").forEach(function (botao) {
        botao.addEventListener("click", function () {
          if (botao.dataset.opcao === quiz.resposta) {
            fecharCartao();
            estado.cofreAberto = true;
            falar("*clique* ♡", POS.Q.coluna * LC_T + 8, POS.Q.linha * LC_T);
            atualizarInterface();
          } else {
            botao.disabled = true;
            cartao.querySelector("[data-quiz-aviso]").textContent = quiz.erro || "quase! essa é outra data nossa ♡";
          }
        });
      });
      cartao.querySelector("[data-opcao]").focus({ preventScroll: true });
    }

    function interagir() {
      if (estado.cartao === "memoria") {
        fecharCartao();
        return;
      }
      if (estado.cartao || estado.fim || estado.encontro || estado.caindo || estado.ferida) return;
      if (!estado.cofreAberto && perto(POS.Q)) {
        mostrarQuiz();
        return;
      }
      const vela = velaPerto();
      if (vela) {
        estado.velasApagadas.add(vela);
        estado.fumaca[vela] = estado.tempo;
        const [coluna, linha] = vela.split(",").map(Number);
        const faltam = VELAS.length - estado.velasApagadas.size;
        falar(faltam ? "fuuu ♡" : "parabéns pra você ♪", coluna * LC_T + 8, linha * LC_T - 2);
        atualizarInterface();
        return;
      }
      if (estado.barra < 5 && perto(POS.B)) {
        estado.barra += 1;
        estado.tremor = 0.18;
        if (estado.barra >= 5) falar("crack! ♡", POS.B.coluna * LC_T + 8, POS.B.linha * LC_T);
        atualizarInterface();
        return;
      }
      falarEla(["hmm...", "por onde será?", "cadê você, amor?"][Math.floor(Math.random() * 3)]);
    }

    function voltar(mensagem) {
      estado.x = estado.retorno.x;
      estado.y = estado.retorno.y;
      estado.alvo = null;
      direcoes.clear();
      falarEla(mensagem);
    }

    function mover(dt) {
      if (estado.cartao || estado.encontro || estado.fim || estado.caindo || estado.ferida) {
        estado.andando = false;
        return;
      }
      let vx = (direcoes.has("direita") ? 1 : 0) - (direcoes.has("esquerda") ? 1 : 0);
      let vy = (direcoes.has("baixo") ? 1 : 0) - (direcoes.has("cima") ? 1 : 0);
      if (vx || vy) {
        estado.alvo = null;
      } else if (estado.alvo) {
        vx = estado.alvo.x - estado.x;
        vy = estado.alvo.y - estado.y;
        if (Math.hypot(vx, vy) < 1.2) {
          estado.alvo = null;
          vx = 0;
          vy = 0;
        }
      }
      const tamanho = Math.hypot(vx, vy);
      estado.andando = tamanho > 0;
      if (!estado.andando) return;
      if (vx) estado.esquerda = vx < 0;

      const passo = VELOCIDADE * dt;
      const nx = estado.x + (vx / tamanho) * passo;
      const ny = estado.y + (vy / tamanho) * passo;
      if (!bloqueado(nx, ny)) {
        estado.x = nx;
        estado.y = ny;
      } else if (!bloqueado(nx, estado.y)) {
        estado.x = nx;
      } else if (!bloqueado(estado.x, ny)) {
        estado.y = ny;
      } else {
        estado.alvo = null;
      }
    }

    function verificarChao(dt) {
      if (estado.caindo) {
        estado.caindo += dt;
        if (estado.caindo > 0.7) {
          estado.caindo = 0;
          voltar("ops! quase virei bombom");
        }
        return;
      }
      if (estado.ferida) {
        estado.ferida += dt;
        if (estado.ferida > 0.6) {
          estado.ferida = 0;
          voltar("essa trufa me pegou!");
        }
        return;
      }
      if (estado.cartao || estado.encontro || estado.fim) return;

      const coluna = Math.floor(estado.x / LC_T);
      const linha = Math.floor((estado.y - 3) / LC_T);
      const letra = letraEm(coluna, linha);

      if (letra === "r") estado.retorno = centro(coluna, linha);
      if (letra === "~" || ((letra === "m" || letra === "n") && !pedraFirme(letra))) {
        estado.caindo = 0.001;
        estado.alvo = null;
        direcoes.clear();
        return;
      }
      if (linha >= 13 && linha <= 15) {
        const pegou = LC_TRUFAS.some((trufa) => {
          const t = posTrufa(trufa);
          return Math.hypot(estado.x - t.x, estado.y - 5 - t.y) < 11;
        });
        if (pegou) {
          estado.ferida = 0.001;
          estado.alvo = null;
          direcoes.clear();
          return;
        }
      }
      const numero = Number(letra);
      if (numero >= 1 && numero <= 5 && !estado.bombons.has(numero)) {
        estado.bombons.add(numero);
        estado.retorno = centro(coluna, linha);
        mostrarMemoria(numero);
        return;
      }
      if (estado.bombons.size === 5 && perto(POS.J)) encontrar();
    }

    function encontrar() {
      estado.encontro = true;
      estado.alvo = null;
      direcoes.clear();
      estado.esquerda = false;
      atualizarInterface();
      const juliana = centro(POS.J.coluna, POS.J.linha);
      falasEncontro.forEach(function (item, indice) {
        depois(indice * 1900, function () {
          if (item.quem === "eu") falar(item.texto, juliana.x, juliana.y - 27, true);
          else falarEla(item.texto);
        });
      });
      depois(falasEncontro.length * 1900, function () {
        estado.encontro = false;
        estado.fim = true;
        atualizarInterface();
        depois(900, function () {
          final.hidden = false;
          concluirPuzzle(elemento);
          ligarBotaoMusica(elemento, final.querySelector("[data-ir-musica]"));
        });
      });
    }

    // Desenho

    function piso(sx, sy, coluna, linha) {
      hdRet(ctx, (coluna + linha) % 2 ? "#f6e6d2" : "#f2dfc8", sx, sy, LC_T, LC_T);
      const semente = (coluna * 7 + linha * 13) % 11;
      if (semente < 3) {
        hdRet(ctx, ["#f29bb5", "#8fc7e8", "#f2c55c"][semente], sx + ((semente * 5) % 11) + 2, sy + ((semente * 3) % 11) + 3, 2, 1);
      }
    }

    function blocoChocolate(sx, sy, claro = false) {
      hdRet(ctx, claro ? "#6e4328" : "#45251a", sx, sy, LC_T, LC_T);
      hdRet(ctx, claro ? "#94603a" : "#683b23", sx + 1, sy + 1, 14, 14);
      hdRet(ctx, claro ? "#b07a4c" : "#86512f", sx + 2, sy + 2, 12, 1);
      hdRet(ctx, claro ? "#b07a4c" : "#86512f", sx + 2, sy + 2, 1, 12);
      hdRet(ctx, claro ? "#7a4b2c" : "#4f2b19", sx + 2, sy + 13, 12, 1);
      hdRet(ctx, claro ? "#7a4b2c" : "#4f2b19", sx + 13, sy + 2, 1, 12);
    }

    function rio(sx, sy, linha) {
      hdRet(ctx, "#5c2f18", sx, sy, LC_T, LC_T);
      for (let i = 0; i < 3; i += 1) {
        const desloc = Math.floor((estado.tempo * 10 + linha * 5 + i * 7) % 16);
        hdRet(ctx, "#7b4426", sx + Math.min(desloc, 10), sy + 3 + i * 5, 6, 1);
      }
    }

    function marshmallow(sx, sy, letra) {
      if (!pedraFirme(letra)) return;
      const fase = fasePedra(letra);
      const afundando = fase > 1.7;
      if (afundando && Math.floor(estado.tempo * 10) % 2) return;
      const baixo = afundando ? 1 : 0;
      hdRet(ctx, "#fffaf6", sx + 2, sy + 4 + baixo, 12, 8);
      hdRet(ctx, "#ffffff", sx + 3, sy + 4 + baixo, 7, 1);
      hdRet(ctx, "#f2c4d2", sx + 2, sy + 11 + baixo, 12, 2);
    }

    function bombom(sx, sy, numero) {
      const sobe = Math.round(Math.sin(estado.tempo * 3 + numero) * 1);
      hdRet(ctx, "rgba(0, 0, 0, 0.12)", sx + 4, sy + 13, 8, 1);
      hdRet(ctx, "#d9a640", sx + 4, sy + 9 + sobe, 8, 4);
      hdRet(ctx, "#b7862c", sx + 5, sy + 9 + sobe, 1, 4);
      hdRet(ctx, "#b7862c", sx + 8, sy + 9 + sobe, 1, 4);
      hdRet(ctx, "#b7862c", sx + 11, sy + 9 + sobe, 1, 4);
      hdRet(ctx, "#4a2614", sx + 4, sy + 4 + sobe, 8, 6);
      hdRet(ctx, "#4a2614", sx + 5, sy + 3 + sobe, 6, 1);
      hdRet(ctx, "#7a4a2a", sx + 5, sy + 4 + sobe, 2, 2);
      hdRet(ctx, "#f29bb5", sx + 7, sy + 2 + sobe, 1, 1);
      hdRet(ctx, "#f29bb5", sx + 9, sy + 2 + sobe, 1, 1);
      hdRet(ctx, "#f29bb5", sx + 7, sy + 3 + sobe, 3, 1);
    }

    function cofre(sx, sy) {
      hdRet(ctx, "#2f190f", sx, sy, LC_T, LC_T);
      hdRet(ctx, "#5a321d", sx + 1, sy + 1, 14, 14);
      hdRet(ctx, "#3a2013", sx + 3, sy + 3, 10, 10);
      hdRet(ctx, "#e2b64c", sx + 6, sy + 5, 4, 4);
      hdRet(ctx, "#2f190f", sx + 7, sy + 6, 2, 3);
      if (perto(POS.Q) && Math.floor(estado.tempo * 3) % 2) hdRet(ctx, "#f2c55c", sx + 6, sy + 1, 4, 1);
    }

    function portaBolo(sx, sy) {
      hdRet(ctx, "#6b3a22", sx, sy, LC_T, LC_T);
      hdRet(ctx, "#f3a9c0", sx, sy, LC_T, 3);
      hdRet(ctx, "#f3a9c0", sx + 3, sy + 3, 2, 2);
      hdRet(ctx, "#f3a9c0", sx + 10, sy + 3, 2, 3);
      hdRet(ctx, "#f8e3c8", sx, sy + 7, LC_T, 2);
      hdRet(ctx, "#f8e3c8", sx, sy + 12, LC_T, 2);
    }

    function velinha(sx, sy, chave) {
      hdRet(ctx, "#5a3020", sx + 3, sy + 6, 10, 4);
      hdRet(ctx, "#e98fae", sx + 4, sy + 10, 8, 5);
      hdRet(ctx, "#d06f91", sx + 6, sy + 10, 1, 5);
      hdRet(ctx, "#d06f91", sx + 9, sy + 10, 1, 5);
      hdRet(ctx, "#9ad0f0", sx + 7, sy + 1, 2, 5);
      if (!estado.velasApagadas.has(chave)) {
        const pisca = Math.floor(estado.tempo * 8) % 2;
        hdRet(ctx, "#ffcf4a", sx + 7, sy - 2 + pisca, 2, 3 - pisca);
        hdRet(ctx, "#ff8a3d", sx + 7, sy - 3 + pisca, 1, 1);
      } else {
        const idade = estado.tempo - estado.fumaca[chave];
        if (idade < 1.4) {
          const subida = Math.round(idade * 8);
          hdRet(ctx, "rgba(200, 190, 200, 0.8)", sx + 7 + (subida % 3) - 1, sy - 2 - subida, 2, 2);
        }
      }
    }

    function barra(sx, sy) {
      const tremor = estado.tremor > 0 ? (Math.floor(estado.tempo * 40) % 2 ? 1 : -1) : 0;
      blocoChocolate(sx + tremor, sy, true);
      ctx.fillStyle = "#3f2214";
      const rachaduras = [[7, 2, 1, 4], [6, 6, 2, 1], [4, 7, 1, 4], [9, 8, 1, 5], [10, 4, 3, 1]];
      rachaduras.slice(0, estado.barra).forEach(([x, y, w, h]) => ctx.fillRect(sx + tremor + x, sy + y, w, h));
    }

    function migalhas(sx, sy) {
      [[3, 5], [10, 9], [6, 12], [12, 3]].forEach(([x, y]) => hdRet(ctx, "#94603a", sx + x, sy + y, 2, 1));
    }

    function desenharLadrilho(coluna, linha, sx, sy) {
      const letra = letraEm(coluna, linha);
      if (letra === "#") {
        blocoChocolate(sx, sy);
        return;
      }
      if (letra === "~" || letra === "m" || letra === "n") {
        rio(sx, sy, linha);
        if (letra !== "~") marshmallow(sx, sy, letra);
        return;
      }
      piso(sx, sy, coluna, linha);
      if (letra === "Q" && !estado.cofreAberto) cofre(sx, sy);
      else if (letra === "c") {
        if (estado.velasApagadas.size < VELAS.length) portaBolo(sx, sy);
        else migalhas(sx, sy);
      } else if (letra === "v") velinha(sx, sy, `${coluna},${linha}`);
      else if (letra === "B") {
        if (estado.barra < 5) barra(sx, sy);
        else migalhas(sx, sy);
      } else if (Number(letra) >= 1 && Number(letra) <= 5 && !estado.bombons.has(Number(letra))) {
        bombom(sx, sy, Number(letra));
      }
    }

    function desenharRayane(cam) {
      if (estado.ferida && Math.floor(estado.ferida * 12) % 2) return;
      const x = Math.round(estado.x - 8 - cam.x);
      const y = Math.round(estado.y - 24 - cam.y);
      const passo = estado.andando ? 1 + (Math.floor(estado.tempo / 0.15) % 2) : 0;
      const linhas = LC_RAYANE.concat(LC_PASSOS[passo]);
      if (estado.caindo) {
        const afunda = Math.round(Math.min(1, estado.caindo / 0.6) * 18);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 2, y - 10, 20, 32);
        ctx.clip();
        lcSprite(ctx, linhas, LC_RAYANE_CORES, x, y + afunda, estado.esquerda);
        ctx.restore();
        hdRet(ctx, "#7b4426", x + 1, y + 21, 14, 2);
        return;
      }
      ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
      ctx.fillRect(x + 3, y + 22, 10, 2);
      lcSprite(ctx, linhas, LC_RAYANE_CORES, x, y - (passo ? 1 : 0), estado.esquerda);
    }

    function desenharJuliana(cam) {
      const pos = centro(POS.J.coluna, POS.J.linha);
      const x = Math.round(pos.x - 8 - cam.x);
      const y = Math.round(pos.y - 24 - cam.y);
      if (x < -20 || x > 180 || y < -30 || y > 140) return;
      ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
      ctx.fillRect(x + 3, y + 22, 10, 2);
      hdSprite(ctx, HD_JULIANA, x, y, true);
      // a caixinha de bombons em forma de coração, nas mãos dela
      const cx = x - 3;
      const cy = y + 13 + (estado.fim ? 0 : Math.round(Math.sin(estado.tempo * 2)));
      hdRet(ctx, "#c4314f", cx, cy + 1, 3, 3);
      hdRet(ctx, "#c4314f", cx + 4, cy + 1, 3, 3);
      hdRet(ctx, "#c4314f", cx, cy + 2, 7, 3);
      hdRet(ctx, "#c4314f", cx + 1, cy + 5, 5, 1);
      hdRet(ctx, "#c4314f", cx + 2, cy + 6, 3, 1);
      hdRet(ctx, "#f2c55c", cx + 3, cy + 1, 1, 6);
      hdRet(ctx, "#f78aa6", cx + 1, cy + 2, 1, 1);
      if (estado.fim) {
        const sobe = (estado.tempo * 14) % 24;
        hdRet(ctx, "#f29bb5", x + 6, y - 4 - Math.round(sobe), 1, 1);
        hdRet(ctx, "#f29bb5", x + 5, y - 5 - Math.round(sobe), 3, 1);
      }
    }

    function desenhar() {
      const cam = camera();
      ctx.clearRect(0, 0, 160, 120);
      const c0 = Math.floor(cam.x / LC_T);
      const l0 = Math.floor(cam.y / LC_T);
      for (let linha = l0; linha <= l0 + 8; linha += 1) {
        for (let coluna = c0; coluna <= c0 + 10; coluna += 1) {
          desenharLadrilho(coluna, linha, coluna * LC_T - cam.x, linha * LC_T - cam.y);
        }
      }

      const atores = [
        { y: estado.y, desenhar: () => desenharRayane(cam) },
        { y: centro(POS.J.coluna, POS.J.linha).y, desenhar: () => desenharJuliana(cam) }
      ];
      LC_TRUFAS.forEach(function (trufa) {
        const t = posTrufa(trufa);
        atores.push({ y: t.y + 6, desenhar: () => desenharTrufa(t, cam) });
      });
      atores.sort((a, b) => a.y - b.y).forEach((ator) => ator.desenhar());
    }

    function desenharTrufa(t, cam) {
      const x = Math.round(t.x - 6 - cam.x);
      const y = Math.round(t.y - 6 - cam.y);
      if (x < -14 || x > 170 || y < -14 || y > 130) return;
      hdRet(ctx, "rgba(0, 0, 0, 0.16)", x + 2, y + 11, 9, 2);
      hdRet(ctx, "#3d1f10", x + 2, y, 8, 12);
      hdRet(ctx, "#3d1f10", x, y + 2, 12, 8);
      hdRet(ctx, "#3d1f10", x + 1, y + 1, 10, 10);
      // granulado que gira enquanto ela rola
      const giro = Math.floor(estado.tempo * 8) % 4;
      [[3, 3], [7, 2], [8, 7], [4, 8], [6, 5]].forEach(function ([gx, gy], i) {
        const cor = ["#f29bb5", "#f6e6d2", "#8fc7e8", "#f2c55c"][(i + giro) % 4];
        hdRet(ctx, cor, x + ((gx + giro) % 9) + 1, y + gy, 2, 1);
      });
      hdRet(ctx, "#f6e6d2", x + 3, y + 5, 1, 1);
      hdRet(ctx, "#f6e6d2", x + 8, y + 5, 1, 1);
    }

    function laco(agora) {
      const dt = ultimo ? Math.min(0.05, (agora - ultimo) / 1000) : 0;
      ultimo = agora;
      estado.tempo += dt;
      if (estado.tremor > 0) estado.tremor -= dt;
      mover(dt);
      verificarChao(dt);
      atualizarInterface();
      desenhar();
      quadro = visivel ? window.requestAnimationFrame(laco) : 0;
      if (!quadro) ultimo = 0;
    }

    function ligar() {
      if (visivel && !quadro) quadro = window.requestAnimationFrame(laco);
    }

    // Controles
    const TECLAS = {
      ArrowUp: "cima", KeyW: "cima", ArrowDown: "baixo", KeyS: "baixo",
      ArrowLeft: "esquerda", KeyA: "esquerda", ArrowRight: "direita", KeyD: "direita"
    };

    consoleEl.addEventListener("keydown", function (evento) {
      const direcao = TECLAS[evento.code];
      if (direcao && !estado.cartao) {
        evento.preventDefault();
        direcoes.add(direcao);
      } else if (evento.code === "KeyE" || (["Enter", "Space"].includes(evento.code) && evento.target === consoleEl)) {
        evento.preventDefault();
        if (!evento.repeat) interagir();
      }
    });

    consoleEl.addEventListener("keyup", function (evento) {
      const direcao = TECLAS[evento.code];
      if (direcao) direcoes.delete(direcao);
    });

    consoleEl.addEventListener("focusout", () => direcoes.clear());

    elemento.querySelectorAll("[data-dir]").forEach(function (botao) {
      const direcao = botao.dataset.dir;
      botao.addEventListener("pointerdown", function (evento) {
        evento.preventDefault();
        if (!estado.cartao) direcoes.add(direcao);
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((nome) => botao.addEventListener(nome, () => direcoes.delete(direcao)));
    });

    botaoA.addEventListener("pointerdown", function (evento) {
      evento.preventDefault();
      interagir();
    });
    botaoA.addEventListener("keydown", function (evento) {
      if (!["Enter", " "].includes(evento.key)) return;
      evento.preventDefault();
      evento.stopPropagation();
      if (!evento.repeat) interagir();
    });

    canvas.addEventListener("click", function (evento) {
      if (estado.cartao || estado.encontro || estado.fim) return;
      const caixa = canvas.getBoundingClientRect();
      const cam = camera();
      estado.alvo = {
        x: ((evento.clientX - caixa.left) / caixa.width) * 160 + cam.x,
        y: ((evento.clientY - caixa.top) / caixa.height) * 120 + cam.y
      };
      consoleEl.focus({ preventScroll: true });
    });

    elemento.querySelector("[data-recomecar]").addEventListener("click", inicial);

    new IntersectionObserver(function (entradas) {
      visivel = entradas.some((entrada) => entrada.isIntersecting);
      ligar();
    }).observe(canvas);

    inicial();
    return elemento;
  }

  /*
   * Música
   */

  function criarMusica(dados = {}) {

  const elemento = document.createElement("article");

  const bloqueada =
    dados.bloqueada === true;

  const link =
    dados.link ||
    dados.spotify ||
    "#";

  elemento.className =
    bloqueada
      ? "componente musica musica--bloqueada"
      : "componente musica";

  elemento.dataset.musicaBloqueada =
    bloqueada ? "true" : "false";

  elemento.innerHTML = `

    <div
      class="musica__bloqueio"
      ${bloqueada ? "" : "hidden"}
    >

      <span class="musica__cadeado">
        ♡
      </span>

      <strong>
        Música guardada
      </strong>

      <p>
        Resolva o desafio anterior para revelar
        esta parte da história.
      </p>

    </div>


    <div
      class="musica__interior"
      ${bloqueada ? "hidden" : ""}
    >

      <div class="musica__capa">

        <img
          src="${escaparHTML(dados.capa || "")}"
          alt="Capa de ${escaparHTML(
            dados.titulo || "música"
          )}"
          loading="lazy"
        >

      </div>


      <div class="musica__conteudo">

        <span class="componente__etiqueta">
          Uma música para você
        </span>

        <h3>
          ${escaparHTML(
            dados.titulo || "Música"
          )}
        </h3>

        <p class="musica__artista">
          ${escaparHTML(
            dados.artista || ""
          )}
        </p>

        <p class="musica__mensagem">
          ${escaparHTML(
            dados.mensagem || ""
          )}
        </p>

        <a
          class="botao"
          href="${escaparHTML(link)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ouvir música
        </a>

      </div>

    </div>

  `;

  const bloqueio =
    elemento.querySelector(
      ".musica__bloqueio"
    );


  const interior =
    elemento.querySelector(
      ".musica__interior"
    );


  /*
   * =====================================================
   * DESBLOQUEAR MÚSICA
   * =====================================================
   */

  function desbloquearMusica() {

    elemento.classList.remove(
      "musica--bloqueada"
    );


    elemento.classList.add(
      "musica--desbloqueada"
    );


    if (bloqueio) {

      bloqueio.hidden =
        true;

    }


    if (interior) {

      interior.hidden =
        false;

    }

  }


  /*
   * =====================================================
   * OUVIR O PUZZLE DO SONIC
   * =====================================================
   *
   * O Sonic dispara:
   *
   * puzzle:concluido
   *
   * quando termina.
   */

  function quandoPuzzleConcluir(evento) {

    const puzzleId =
      String(
        evento.detail?.puzzleId ||
        ""
      );


    /*
     * Só desbloqueia se for o Sonic.
     */

    if (
      puzzleId === "sonic-rayane" &&
      elemento.closest(".capitulo")?.querySelector(".sonic-flores")
    ) {

      desbloquearMusica();

    }

  }


  document.addEventListener(
    "puzzle:concluido",
    quandoPuzzleConcluir
  );


  /*
   * =====================================================
   * IMPORTANTE
   * =====================================================
   *
   * A função também pode receber o evento
   * customizado diretamente pelo puzzle Sonic.
   */

  document.addEventListener(
    "puzzle-sonic-concluido",
    function () {

      if (!elemento.closest(".capitulo")?.querySelector(".sonic-flores")) return;
      desbloquearMusica();

    }
  );


  return elemento;
}

  /*
   * Cofre
   */

  function criarCofre(dados) {
    const elemento =
      document.createElement("article");

    elemento.className =
      "componente puzzle cofre";

    const opcoes = Array.isArray(dados.opcoes)
      ? dados.opcoes
      : [];

    const modo =
      dados.modo ||
      (opcoes.length > 0 ? "opcoes" : "texto");

    const respostaCorreta =
      dados.resposta ??
      dados.respostaCorreta ??
      "";

    const mensagemSucesso =
      dados.mensagemSucesso ??
      dados.feedbackCorreto ??
      "Você encontrou a resposta. ♡";

    const mensagemErro =
      dados.mensagemErro ??
      dados.feedbackErrado ??
      "Ainda não. Tente novamente.";

    elemento.innerHTML = `
      <span class="componente__etiqueta">
        Uma chave para continuar
      </span>

      <h3>
        ${escaparHTML(dados.titulo || "Cofre")}
      </h3>

      ${
        dados.descricao
          ? `
            <p class="puzzle__descricao">
              ${escaparHTML(dados.descricao)}
            </p>
          `
          : ""
      }

      <p class="cofre__pergunta">
        ${escaparHTML(dados.pergunta || "")}
      </p>

      <div class="cofre__conteudo"></div>

      <p
        class="puzzle__feedback"
        data-feedback
        aria-live="polite"
      ></p>
    `;

    const conteudo =
      elemento.querySelector(".cofre__conteudo");

    const feedback =
      elemento.querySelector("[data-feedback]");

    function conferir(valor) {
      const acertou =
        normalizar(valor) ===
        normalizar(respostaCorreta);

      if (!acertou) {
        feedback.textContent = mensagemErro;

        feedback.className =
          "puzzle__feedback puzzle__feedback--erro";

        return false;
      }

      feedback.textContent = mensagemSucesso;

      feedback.className =
        "puzzle__feedback puzzle__feedback--certo";

      concluirPuzzle(elemento);

      return true;
    }

    if (modo === "opcoes") {
      const grade =
        document.createElement("div");

      grade.className = "cofre__opcoes";

      opcoes.forEach(function (opcao, indice) {
        const botao =
          document.createElement("button");

        botao.type = "button";
        botao.className = "cofre__opcao";

        botao.innerHTML = `
          <span>${indice + 1}</span>
          ${escaparHTML(opcao)}
        `;

        botao.addEventListener(
          "click",
          function () {
            const acertou = conferir(opcao);

            if (!acertou) {
              botao.classList.add(
                "cofre__opcao--errada"
              );

              window.setTimeout(function () {
                botao.classList.remove(
                  "cofre__opcao--errada"
                );
              }, 550);

              return;
            }

            grade
              .querySelectorAll("button")
              .forEach(function (item) {
                item.disabled = true;
              });

            botao.classList.add(
              "cofre__opcao--correta"
            );
          }
        );

        grade.appendChild(botao);
      });

      conteudo.appendChild(grade);

      return elemento;
    }

    const formulario =
      document.createElement("form");

    formulario.className = "puzzle__formulario";

    formulario.innerHTML = `
      <input
        class="puzzle__input"
        type="text"
        placeholder="${escaparHTML(
          dados.placeholder ||
          "Digite sua resposta..."
        )}"
        autocomplete="off"
        required
      >

      <button class="botao" type="submit">
        Abrir
      </button>
    `;

    const input =
      formulario.querySelector("input");

    const botao =
      formulario.querySelector("button");

    formulario.addEventListener(
      "submit",
      function (evento) {
        evento.preventDefault();

        const acertou = conferir(input.value);

        if (acertou) {
          input.disabled = true;
          botao.disabled = true;
        } else {
          input.select();
        }
      }
    );

    conteudo.appendChild(formulario);

    return elemento;
  }

  /*
   * Termo
   */

  function criarTermo(dados) {
    const elemento =
      document.createElement("article");

    elemento.className =
      "componente puzzle termo";

    const palavra =
      normalizar(dados.palavra).toUpperCase();

    const totalTentativas =
      Math.max(1, Number(dados.tentativas) || 6);

    let tentativaAtual = 0;
    let finalizado = false;

    elemento.innerHTML = `
      <span class="componente__etiqueta">
        Palavra escondida
      </span>

      <h3>
        ${escaparHTML(dados.titulo || "Termo")}
      </h3>

      <p class="puzzle__descricao">
        ${escaparHTML(dados.descricao || "")}
      </p>

      ${
        dados.dica
          ? `
            <div class="termo__dica">
              <span>Dica</span>
              ${escaparHTML(dados.dica)}
            </div>
          `
          : ""
      }

      <div class="termo__grade"></div>

      <form class="puzzle__formulario">
        <input
          class="puzzle__input"
          type="text"
          maxlength="${palavra.length}"
          placeholder="Digite ${palavra.length} letras"
          autocomplete="off"
          required
        >

        <button class="botao" type="submit">
          Tentar
        </button>
      </form>

      <p
        class="puzzle__feedback"
        data-feedback
        aria-live="polite"
      ></p>
    `;

    const grade =
      elemento.querySelector(".termo__grade");

    const formulario =
      elemento.querySelector("form");

    const input =
      formulario.querySelector("input");

    const botao =
      formulario.querySelector("button");

    const feedback =
      elemento.querySelector("[data-feedback]");

    for (
      let linha = 0;
      linha < totalTentativas;
      linha += 1
    ) {
      const linhaElemento =
        document.createElement("div");

      linhaElemento.className = "termo__linha";
      linhaElemento.dataset.linha = String(linha);

      for (
        let coluna = 0;
        coluna < palavra.length;
        coluna += 1
      ) {
        const celula =
          document.createElement("span");

        celula.className = "termo__celula";
        linhaElemento.appendChild(celula);
      }

      grade.appendChild(linhaElemento);
    }

    formulario.addEventListener(
      "submit",
      function (evento) {
        evento.preventDefault();

        if (finalizado) {
          return;
        }

        const tentativa =
          normalizar(input.value).toUpperCase();

        if (tentativa.length !== palavra.length) {
          feedback.textContent =
            `Digite exatamente ${palavra.length} letras.`;

          feedback.className =
            "puzzle__feedback puzzle__feedback--erro";

          return;
        }

        const linha = grade.querySelector(
          `[data-linha="${tentativaAtual}"]`
        );

        if (!linha) {
          return;
        }

        const celulas =
          [...linha.querySelectorAll(
            ".termo__celula"
          )];

        const restantes = palavra.split("");

        tentativa
          .split("")
          .forEach(function (letra, indice) {
            celulas[indice].textContent = letra;

            if (letra === palavra[indice]) {
              celulas[indice].classList.add(
                "termo__celula--certa"
              );

              restantes[indice] = null;
            }
          });

        tentativa
          .split("")
          .forEach(function (letra, indice) {
            if (
              celulas[indice].classList.contains(
                "termo__celula--certa"
              )
            ) {
              return;
            }

            const posicao =
              restantes.indexOf(letra);

            if (posicao >= 0) {
              celulas[indice].classList.add(
                "termo__celula--presente"
              );

              restantes[posicao] = null;
            } else {
              celulas[indice].classList.add(
                "termo__celula--ausente"
              );
            }
          });

        tentativaAtual += 1;
        input.value = "";

        if (tentativa === palavra) {
          finalizado = true;

          feedback.textContent =
            dados.mensagemSucesso ||
            "Você encontrou a palavra. ♡";

          feedback.className =
            "puzzle__feedback puzzle__feedback--certo";

          input.disabled = true;
          botao.disabled = true;

          concluirPuzzle(elemento);

          return;
        }

        if (tentativaAtual >= totalTentativas) {
          finalizado = true;

          feedback.textContent =
            `A palavra era ${palavra}.`;

          feedback.className =
            "puzzle__feedback puzzle__feedback--erro";

          input.disabled = true;
          botao.disabled = true;
        }
      }
    );

    return elemento;
  }

  /*
  * Contexto
  */
 function criarContexto(dados = {}) {
  const elemento = document.createElement("article");
  elemento.className = "componente contexto";

  const palavras = Array.isArray(dados.palavras)
    ? dados.palavras
    : [];

  const resposta = normalizar(
    dados.resposta || palavras.find((item) => item.posicao === 1)?.palavra || ""
  );

  const limiteTentativas = Number(dados.tentativas) || 10;

  let tentativas = 0;
  let finalizado = false;
  const historico = [];

  elemento.innerHTML = `
    <header class="puzzle__cabecalho">
      <span class="puzzle__etiqueta">Contexto</span>

      <h3>
        ${escaparHTML(dados.titulo || "Descubra a palavra")}
      </h3>

      <p>
        ${escaparHTML(
          dados.descricao ||
          "Digite palavras relacionadas até encontrar a palavra secreta."
        )}
      </p>
    </header>

    <div class="contexto__informacoes">
      <span>
        Tentativas:
        <strong data-contexto-tentativas>0</strong>
        / ${limiteTentativas}
      </span>

      <span>
        Melhor posição:
        <strong data-contexto-melhor>—</strong>
      </span>
    </div>

    <div class="contexto__entrada">
      <label class="sr-only" for="contexto-palavra">
        Digite uma palavra
      </label>

      <input
        id="contexto-palavra"
        type="text"
        autocomplete="off"
        placeholder="Digite uma palavra"
        data-contexto-input
      >

      <button
        type="button"
        data-contexto-enviar
      >
        Tentar
      </button>
    </div>

    <p
      class="contexto__mensagem"
      data-contexto-mensagem
      aria-live="polite"
    ></p>

    <div
      class="contexto__historico"
      data-contexto-historico
    ></div>
  `;

  const input = elemento.querySelector("[data-contexto-input]");
  const botao = elemento.querySelector("[data-contexto-enviar]");
  const lista = elemento.querySelector("[data-contexto-historico]");
  const mensagem = elemento.querySelector("[data-contexto-mensagem]");
  const contador = elemento.querySelector("[data-contexto-tentativas]");
  const melhorElemento = elemento.querySelector("[data-contexto-melhor]");

  function localizarPalavra(valor) {
    const palavraNormalizada = normalizar(valor);

    return palavras.find((item) => {
      return normalizar(item.palavra) === palavraNormalizada;
    });
  }

  function atualizarHistorico() {
    lista.innerHTML = "";

    historico
      .slice()
      .sort((a, b) => a.posicao - b.posicao)
      .forEach((item) => {
        const linha = document.createElement("div");
        linha.className = "contexto__resultado";

        if (item.posicao === 1) {
          linha.classList.add("contexto__resultado--correto");
        } else if (item.posicao <= 10) {
          linha.classList.add("contexto__resultado--muito-perto");
        } else if (item.posicao <= 100) {
          linha.classList.add("contexto__resultado--perto");
        } else if (item.posicao <= 1000) {
          linha.classList.add("contexto__resultado--medio");
        }

        linha.innerHTML = `
          <span>${escaparHTML(item.palavra)}</span>
          <strong>${item.posicao}</strong>
        `;

        lista.appendChild(linha);
      });

    const melhor = historico.reduce((menor, item) => {
      return item.posicao < menor ? item.posicao : menor;
    }, Infinity);

    melhorElemento.textContent =
      Number.isFinite(melhor) ? melhor : "—";
  }

  function concluir() {
    finalizado = true;
    input.disabled = true;
    botao.disabled = true;

    mensagem.textContent =
      dados.mensagemSucesso ||
      "Você encontrou a palavra secreta. ♡";

    elemento.classList.add("contexto--resolvido");

    elemento.dispatchEvent(
      new CustomEvent("puzzle-resolvido", {
        bubbles: true,
        detail: {
          tipo: "contexto",
          resposta
        }
      })
    );
  }

  function tentar() {
    if (finalizado) {
      return;
    }

    const valor = input.value.trim();

    if (!valor) {
      mensagem.textContent = "Digite uma palavra.";
      input.focus();
      return;
    }

    const palavraNormalizada = normalizar(valor);

    const repetida = historico.some((item) => {
      return normalizar(item.palavra) === palavraNormalizada;
    });

    if (repetida) {
      mensagem.textContent = "Você já tentou essa palavra.";
      input.select();
      return;
    }

    tentativas += 1;
    contador.textContent = tentativas;

    const encontrada = localizarPalavra(valor);

    const resultado = encontrada
      ? {
          palavra: encontrada.palavra,
          posicao: Number(encontrada.posicao)
        }
      : {
          palavra: valor,
          posicao: 10000
        };

    historico.push(resultado);
    atualizarHistorico();

    input.value = "";
    input.focus();

    if (resultado.posicao === 1 || palavraNormalizada === resposta) {
      concluir();
      return;
    }

    if (resultado.posicao <= 10) {
      mensagem.textContent = "Muito perto!";
    } else if (resultado.posicao <= 100) {
      mensagem.textContent = "Você está perto.";
    } else if (resultado.posicao <= 1000) {
      mensagem.textContent = "Está ficando mais quente.";
    } else {
      mensagem.textContent = "Ainda está distante.";
    }

    if (tentativas >= limiteTentativas) {
      finalizado = true;
      input.disabled = true;
      botao.disabled = true;

      mensagem.textContent =
        `Fim das tentativas. A palavra era “${dados.resposta}”.`;
    }
  }

  botao.addEventListener("click", tentar);

  input.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      tentar();
    }
  });

  return elemento;
}

  /*
   * Conexo
   */

  function criarConexo(dados) {
    const elemento =
      document.createElement("article");

    elemento.className =
      "componente puzzle conexo";

    const grupos = Array.isArray(dados.grupos)
      ? dados.grupos.filter(function (grupo) {
          return (
            grupo &&
            Array.isArray(grupo.palavras) &&
            grupo.palavras.length > 0
          );
        })
      : [];

    const palavras = [];

    grupos.forEach(function (grupo) {
      grupo.palavras.forEach(function (palavra) {
        palavras.push({
          texto: String(palavra),
          grupo: String(grupo.titulo)
        });
      });
    });

    let selecionadas = [];
    let encontrados = 0;

    elemento.innerHTML = `
      <span class="componente__etiqueta">
        Encontre as conexões
      </span>

      <h3>
        ${escaparHTML(dados.titulo || "Conexo")}
      </h3>

      <p class="puzzle__descricao">
        ${escaparHTML(dados.descricao || "")}
      </p>

      <p class="conexo__contador">
        Grupos encontrados:
        <strong data-contador>
          0/${grupos.length}
        </strong>
      </p>

      <div class="conexo__resultados"></div>

      <div class="conexo__grade"></div>

      <div class="conexo__acoes">
        <button
          class="botao"
          data-confirmar
          type="button"
        >
          Confirmar seleção
        </button>

        <button
          class="botao botao--secundario"
          data-limpar
          type="button"
        >
          Limpar
        </button>
      </div>

      <p
        class="puzzle__feedback"
        data-feedback
        aria-live="polite"
      ></p>
    `;

    const grade =
      elemento.querySelector(".conexo__grade");

    const resultados =
      elemento.querySelector(
        ".conexo__resultados"
      );

    const contador =
      elemento.querySelector("[data-contador]");

    const confirmar =
      elemento.querySelector("[data-confirmar]");

    const limpar =
      elemento.querySelector("[data-limpar]");

    const feedback =
      elemento.querySelector("[data-feedback]");

    function limparSelecao() {
      selecionadas.forEach(function (botao) {
        botao.classList.remove(
          "conexo__palavra--selecionada"
        );
      });

      selecionadas = [];
    }

    embaralhar(palavras).forEach(function (item) {
      const botao =
        document.createElement("button");

      botao.type = "button";
      botao.className = "conexo__palavra";
      botao.textContent = item.texto;
      botao.dataset.grupo = item.grupo;

      botao.addEventListener(
        "click",
        function () {
          const selecionada =
            botao.classList.contains(
              "conexo__palavra--selecionada"
            );

          if (selecionada) {
            botao.classList.remove(
              "conexo__palavra--selecionada"
            );

            selecionadas =
              selecionadas.filter(function (item) {
                return item !== botao;
              });

            return;
          }

          if (selecionadas.length >= 4) {
            feedback.textContent =
              "Selecione apenas quatro palavras.";

            feedback.className =
              "puzzle__feedback puzzle__feedback--erro";

            return;
          }

          botao.classList.add(
            "conexo__palavra--selecionada"
          );

          selecionadas.push(botao);

          feedback.textContent = "";
        }
      );

      grade.appendChild(botao);
    });

    limpar.addEventListener(
      "click",
      limparSelecao
    );

    confirmar.addEventListener(
      "click",
      function () {
        if (selecionadas.length !== 4) {
          feedback.textContent =
            "Selecione exatamente quatro palavras.";

          feedback.className =
            "puzzle__feedback puzzle__feedback--erro";

          return;
        }

        const grupo =
          selecionadas[0].dataset.grupo;

        const mesmoGrupo =
          selecionadas.every(function (botao) {
            return botao.dataset.grupo === grupo;
          });

        if (!mesmoGrupo) {
          feedback.textContent =
            "Essas palavras não formam um grupo.";

          feedback.className =
            "puzzle__feedback puzzle__feedback--erro";

          const erradas = [...selecionadas];

          erradas.forEach(function (botao) {
            botao.classList.add(
              "conexo__palavra--errada"
            );
          });

          window.setTimeout(function () {
            erradas.forEach(function (botao) {
              botao.classList.remove(
                "conexo__palavra--errada"
              );
            });

            limparSelecao();
          }, 650);

          return;
        }

        const resultado =
          document.createElement("div");

        resultado.className = "conexo__grupo";

        resultado.innerHTML = `
          <strong>${escaparHTML(grupo)}</strong>

          <span>
            ${selecionadas
              .map(function (botao) {
                return escaparHTML(
                  botao.textContent
                );
              })
              .join(" · ")}
          </span>
        `;

        resultados.appendChild(resultado);

        selecionadas.forEach(function (botao) {
          botao.remove();
        });

        selecionadas = [];
        encontrados += 1;

        contador.textContent =
          `${encontrados}/${grupos.length}`;

        feedback.textContent =
          "Você encontrou uma conexão. ♡";

        feedback.className =
          "puzzle__feedback puzzle__feedback--certo";

        if (encontrados === grupos.length) {
          feedback.textContent =
            dados.mensagemSucesso ||
            "Você encontrou todas as conexões. ♡";

          confirmar.disabled = true;
          limpar.disabled = true;

          concluirPuzzle(elemento);
        }
      }
    );

    return elemento;
  }

  /*
   * Ranking do álbum
   */

  function criarRankingAlbum(dados) {
    const elemento = document.createElement("article");
    elemento.className = "componente puzzle ranking-album";

    const faixas = Array.isArray(dados.faixas)
      ? dados.faixas.filter(function (faixa) {
          return faixa && faixa.titulo && Number.isFinite(Number(faixa.nota));
        })
      : [];

    const categorias = [
      { id: "nao-pegou", titulo: "Não me pegou", legenda: "até 5" },
      { id: "gostei", titulo: "Gostei", legenda: "de 6 a 7" },
      { id: "playlist", titulo: "Entraria na playlist", legenda: "de 8 a 9" },
      { id: "favorita", titulo: "Favorita do álbum", legenda: "nota 10" }
    ];

    function categoriaDaNota(nota) {
      if (nota <= 5) return "nao-pegou";
      if (nota <= 7) return "gostei";
      if (nota < 10) return "playlist";
      return "favorita";
    }

    let selecionada = "";
    const palpites = {};

    elemento.innerHTML = `
      <span class="componente__etiqueta">Monte meu ranking</span>
      <h3>${escaparHTML(dados.titulo || "Como você acha que eu avaliei?")}</h3>
      <p class="puzzle__descricao">${escaparHTML(
        dados.descricao || "Toque em uma faixa e escolha a categoria em que acha que eu a coloquei."
      )}</p>
      <div class="ranking-album__faixas" data-faixas></div>
      <div class="ranking-album__categorias" data-categorias></div>
      <div class="ranking-album__acoes">
        <button class="botao" type="button" data-revelar>Revelar meu ranking</button>
        <button class="botao botao--secundario" type="button" data-recomecar>Recomeçar</button>
      </div>
      <p class="puzzle__feedback" data-feedback aria-live="polite"></p>
      <div class="ranking-album__revelacao" data-revelacao hidden></div>
    `;

    const areaFaixas = elemento.querySelector("[data-faixas]");
    const areaCategorias = elemento.querySelector("[data-categorias]");
    const feedback = elemento.querySelector("[data-feedback]");
    const revelacao = elemento.querySelector("[data-revelacao]");
    const botaoRevelar = elemento.querySelector("[data-revelar]");
    const botaoRecomecar = elemento.querySelector("[data-recomecar]");

    const botoesFaixas = {};
    embaralhar(faixas).forEach(function (faixa) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "ranking-album__faixa";
      botao.textContent = faixa.titulo;
      botao.dataset.faixa = faixa.titulo;
      botao.addEventListener("click", function () {
        selecionada = faixa.titulo;
        Object.values(botoesFaixas).forEach(function (item) {
          item.classList.toggle("ranking-album__faixa--selecionada", item === botao);
        });
        feedback.textContent = "Agora escolha uma categoria para esta faixa.";
        feedback.className = "puzzle__feedback";
      });
      botoesFaixas[faixa.titulo] = botao;
      areaFaixas.appendChild(botao);
    });

    function atualizarCategorias() {
      areaCategorias.querySelectorAll("[data-lista]").forEach(function (lista) {
        lista.innerHTML = "";
        const categoria = lista.dataset.lista;
        Object.keys(palpites).forEach(function (titulo) {
          if (palpites[titulo] !== categoria) return;
          const item = document.createElement("span");
          item.textContent = titulo;
          lista.appendChild(item);
        });
      });
      Object.keys(botoesFaixas).forEach(function (titulo) {
        botoesFaixas[titulo].classList.toggle(
          "ranking-album__faixa--colocada",
          Boolean(palpites[titulo])
        );
      });
    }

    categorias.forEach(function (categoria) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = `ranking-album__categoria ranking-album__categoria--${categoria.id}`;
      botao.innerHTML = `
        <strong>${escaparHTML(categoria.titulo)}</strong>
        <small>${escaparHTML(categoria.legenda)}</small>
        <span class="ranking-album__lista" data-lista="${categoria.id}"></span>
      `;
      botao.addEventListener("click", function () {
        if (!selecionada) {
          feedback.textContent = "Escolha uma música primeiro.";
          feedback.className = "puzzle__feedback puzzle__feedback--erro";
          return;
        }
        palpites[selecionada] = categoria.id;
        botoesFaixas[selecionada].classList.remove("ranking-album__faixa--selecionada");
        selecionada = "";
        atualizarCategorias();
        feedback.textContent = "Faixa posicionada. ♡";
        feedback.className = "puzzle__feedback puzzle__feedback--certo";
      });
      areaCategorias.appendChild(botao);
    });

    botaoRecomecar.addEventListener("click", function () {
      Object.keys(palpites).forEach(function (titulo) { delete palpites[titulo]; });
      selecionada = "";
      atualizarCategorias();
      Object.values(botoesFaixas).forEach(function (botao) {
        botao.classList.remove("ranking-album__faixa--selecionada");
      });
      feedback.textContent = "Ranking limpo. Pode tentar de novo.";
      feedback.className = "puzzle__feedback";
    });

    botaoRevelar.addEventListener("click", function () {
      if (Object.keys(palpites).length !== faixas.length) {
        feedback.textContent = "Coloque todas as músicas em uma categoria antes de revelar.";
        feedback.className = "puzzle__feedback puzzle__feedback--erro";
        return;
      }

      const acertos = faixas.filter(function (faixa) {
        return palpites[faixa.titulo] === categoriaDaNota(Number(faixa.nota));
      }).length;
      const ordenadas = [...faixas].sort(function (a, b) { return Number(b.nota) - Number(a.nota); });
      revelacao.innerHTML = `
        <div class="ranking-album__placar">
          <span>Você acertou</span>
          <strong>${acertos} de ${faixas.length}</strong>
          <small>${escaparHTML(dados.mensagemResultado || "Já sabe reconhecer quando eu finjo que não gostei? ♡")}</small>
        </div>
        <div class="ranking-album__resultado">
          ${ordenadas.map(function (faixa, indice) {
            const comentario = String(faixa.comentario || "").trim();
            return `<article>
              <span>${indice + 1}</span>
              <div><strong>${escaparHTML(faixa.titulo)}</strong>${
                comentario ? `<p>${escaparHTML(comentario)}</p>` : ""
              }</div>
              <b>${escaparHTML(String(faixa.nota).replace(".", ","))}/10</b>
            </article>`;
          }).join("")}
        </div>
        <div class="ranking-album__nota-final">
          <span>Minha nota para o álbum</span>
          <strong>${escaparHTML(String(dados.notaAlbum).replace(".", ","))}</strong>
          <small>de 10</small>
        </div>
      `;
      revelacao.hidden = false;
      botaoRevelar.disabled = true;
      botaoRecomecar.disabled = true;
      areaFaixas.querySelectorAll("button").forEach(function (botao) { botao.disabled = true; });
      areaCategorias.querySelectorAll("button").forEach(function (botao) { botao.disabled = true; });
      feedback.textContent = dados.mensagemFinal || "Esse é o meu ranking. Agora quero saber o seu. ♡";
      feedback.className = "puzzle__feedback puzzle__feedback--certo";
      concluirPuzzle(elemento);
    });

    return elemento;
  }

  /*
   * Memória
   */

  function criarConteudoMemoria(par) {
    if (par.imagem) {
      return `
        <img
          src="${escaparHTML(par.imagem)}"
          alt="${escaparHTML(
            par.alt || "Carta da memória"
          )}"
        >
      `;
    }

    if (par.emoji) {
      return `
        <span class="memoria__emoji">
          ${escaparHTML(par.emoji)}
        </span>
      `;
    }

    return `
      <span class="memoria__texto">
        ${escaparHTML(par.texto || "♡")}
      </span>
    `;
  }

  function criarMemoria(dados) {
    const elemento =
      document.createElement("article");

    elemento.className =
      "componente puzzle memoria";

    const pares = Array.isArray(dados.pares)
      ? dados.pares
      : [];

    elemento.innerHTML = `
      <span class="componente__etiqueta">
        Jogo da memória
      </span>

      <h3>
        ${escaparHTML(
          dados.titulo || "Memórias"
        )}
      </h3>

      <p class="puzzle__descricao">
        ${escaparHTML(
          dados.descricao ||
          "Encontre todos os pares."
        )}
      </p>

      <div class="memoria__informacoes">
        <span>
          Movimentos:
          <strong data-movimentos>0</strong>
        </span>

        <span>
          Pares:
          <strong data-pares>
            0/${pares.length}
          </strong>
        </span>
      </div>

      <div class="memoria__grade"></div>

      <div class="memoria__acoes">
        <button
          class="botao botao--secundario"
          data-reiniciar
          type="button"
        >
          Reiniciar
        </button>
      </div>

      <p
        class="puzzle__feedback"
        data-feedback
        aria-live="polite"
      ></p>
    `;

    const grade =
      elemento.querySelector(".memoria__grade");

    const movimentosElemento =
      elemento.querySelector("[data-movimentos]");

    const paresElemento =
      elemento.querySelector("[data-pares]");

    const feedback =
      elemento.querySelector("[data-feedback]");

    const reiniciar =
      elemento.querySelector("[data-reiniciar]");

    let primeira = null;
    let segunda = null;
    let bloqueado = false;
    let movimentos = 0;
    let encontrados = 0;

    function atualizar() {
      movimentosElemento.textContent =
        String(movimentos);

      paresElemento.textContent =
        `${encontrados}/${pares.length}`;
    }

    function limparCartas() {
      primeira = null;
      segunda = null;
      bloqueado = false;
    }

    function selecionar(carta) {
      if (
        bloqueado ||
        carta.disabled ||
        carta === primeira
      ) {
        return;
      }

      carta.classList.add(
        "memoria__carta--aberta"
      );

      if (!primeira) {
        primeira = carta;
        return;
      }

      segunda = carta;
      bloqueado = true;
      movimentos += 1;

      atualizar();

      if (
        primeira.dataset.par ===
        segunda.dataset.par
      ) {
        primeira.disabled = true;
        segunda.disabled = true;

        primeira.classList.add(
          "memoria__carta--encontrada"
        );

        segunda.classList.add(
          "memoria__carta--encontrada"
        );

        encontrados += 1;
        atualizar();
        limparCartas();

        feedback.textContent =
          "Você encontrou um par. ♡";

        feedback.className =
          "puzzle__feedback puzzle__feedback--certo";

        if (encontrados === pares.length) {
          feedback.textContent =
            `Você encontrou todos os pares em ${movimentos} movimentos. ♡`;

          concluirPuzzle(elemento);
        }

        return;
      }

      feedback.textContent =
        "Essas cartas não formam um par.";

      feedback.className =
        "puzzle__feedback puzzle__feedback--erro";

      window.setTimeout(function () {
        primeira?.classList.remove(
          "memoria__carta--aberta"
        );

        segunda?.classList.remove(
          "memoria__carta--aberta"
        );

        limparCartas();
      }, 850);
    }

    function montar() {
      grade.innerHTML = "";

      primeira = null;
      segunda = null;
      bloqueado = false;
      movimentos = 0;
      encontrados = 0;

      elemento.dataset.resolvido = "false";
      elemento.classList.remove(
        "puzzle--resolvido"
      );

      feedback.textContent = "";
      atualizar();

      const cartas = [];

      pares.forEach(function (par, indice) {
        const id =
          String(par.id || `par-${indice}`);

        cartas.push({
          ...par,
          identificador: id
        });

        cartas.push({
          ...par,
          identificador: id
        });
      });

      embaralhar(cartas).forEach(
        function (dadosCarta) {
          const botao =
            document.createElement("button");

          botao.type = "button";
          botao.className = "memoria__carta";
          botao.dataset.par =
            dadosCarta.identificador;

          botao.innerHTML = `
            <span class="memoria__interior">
              <span class="memoria__verso">
                ♡
              </span>

              <span class="memoria__frente">
                ${criarConteudoMemoria(
                  dadosCarta
                )}
              </span>
            </span>
          `;

          botao.addEventListener(
            "click",
            function () {
              selecionar(botao);
            }
          );

          grade.appendChild(botao);
        }
      );
    }

    reiniciar.addEventListener("click", montar);

    montar();

    return elemento;
  }

  /*
 * Memória de complementos
 * Capítulo 03.10.2026
 */

function criarMemoriaComplementos(dados) {
  const elemento = document.createElement("article");

  elemento.className =
    "componente puzzle memoria memoria-complementos";

  const pares = Array.isArray(dados.pares)
    ? dados.pares
    : [];

  elemento.innerHTML = `
    <span class="componente__etiqueta">
      ${escaparHTML(dados.etiqueta || "O que completa?")}
    </span>

    <h3>
      ${escaparHTML(
        dados.titulo ||
        "Algumas coisas só fazem sentido juntas"
      )}
    </h3>

    <p class="puzzle__descricao">
      ${escaparHTML(
        dados.descricao ||
        "Encontre aquilo que completa cada coisa."
      )}
    </p>

    <div class="memoria__informacoes">
      <span>
        Movimentos:
        <strong data-movimentos>0</strong>
      </span>

      <span>
        Encontros:
        <strong data-pares>
          0/${pares.length}
        </strong>
      </span>
    </div>

    <div class="memoria__grade"></div>

    <div
      class="memoria-complementos__encontro"
      data-encontro
      aria-live="polite"
    ></div>

    <div class="memoria__acoes">
      <button
        class="botao botao--secundario"
        data-reiniciar
        type="button"
      >
        Embaralhar novamente
      </button>
    </div>

    <p
      class="puzzle__feedback"
      data-feedback
      aria-live="polite"
    ></p>

    <div
      class="memoria-complementos__final"
      data-final
      hidden
    >
      <span class="memoria-complementos__final-etiqueta">
        O último encontro
      </span>

      <div class="memoria-complementos__equacao">
        <strong>EU</strong>
        <span>+</span>
        <strong>VOCÊ</strong>
      </div>

      <div class="memoria-complementos__nos">
        NÓS.
      </div>

      <p>
        ${escaparHTML(
          dados.mensagemFinal ||
          "No meio de tantas coisas que se completam, eu encontrei você."
        )}
      </p>

      <strong class="memoria-complementos__assinatura">
        ${escaparHTML(
          dados.assinatura ||
          "Seu. E só. ♡"
        )}
      </strong>
    </div>
  `;

  const grade =
    elemento.querySelector(".memoria__grade");

  const movimentosElemento =
    elemento.querySelector("[data-movimentos]");

  const paresElemento =
    elemento.querySelector("[data-pares]");

  const feedback =
    elemento.querySelector("[data-feedback]");

  const encontro =
    elemento.querySelector("[data-encontro]");

  const final =
    elemento.querySelector("[data-final]");

  const reiniciar =
    elemento.querySelector("[data-reiniciar]");

  let primeira = null;
  let segunda = null;
  let bloqueado = false;
  let movimentos = 0;
  let encontrados = 0;

  function atualizar() {
    movimentosElemento.textContent =
      String(movimentos);

    paresElemento.textContent =
      `${encontrados}/${pares.length}`;
  }

  function limparCartas() {
    primeira = null;
    segunda = null;
    bloqueado = false;
  }

  /*
   * Cada carta deste jogo pode ter
   * emoji + texto ao mesmo tempo.
   */
  function criarConteudoComplemento(carta) {
    return `
      <span class="memoria-complementos__conteudo">
        ${
          carta.emoji
            ? `
              <span class="memoria-complementos__emoji">
                ${escaparHTML(carta.emoji)}
              </span>
            `
            : ""
        }

        ${
          carta.texto
            ? `
              <span class="memoria-complementos__texto">
                ${escaparHTML(carta.texto)}
              </span>
            `
            : ""
        }
      </span>
    `;
  }

  function mostrarEncontro(par) {
    if (!encontro) {
      return;
    }

    encontro.innerHTML = `
      <span>♡</span>

      <p>
        ${escaparHTML(
          par.mensagem ||
          "Algumas coisas simplesmente se encontram."
        )}
      </p>
    `;

    encontro.classList.remove(
      "memoria-complementos__encontro--visivel"
    );

    void encontro.offsetWidth;

    encontro.classList.add(
      "memoria-complementos__encontro--visivel"
    );
  }

  /*
   * Folha decorativa que atravessa o puzzle.
   */
  function criarFolha() {
    const folha =
      document.createElement("span");

    folha.className =
      "memoria-complementos__folha";

    folha.textContent = "🍃";

    folha.style.left =
      `${Math.random() * 90}%`;

    folha.style.setProperty(
      "--folha-duracao",
      `${3 + Math.random() * 3}s`
    );

    elemento.appendChild(folha);

    window.setTimeout(function () {
      folha.remove();
    }, 6500);
  }

  function chuvaDeFolhas() {
    for (let indice = 0; indice < 16; indice += 1) {
      window.setTimeout(function () {
        criarFolha();
      }, indice * 120);
    }
  }

  function revelarFinal() {
    bloqueado = true;

    feedback.textContent = "";
    reiniciar.disabled = true;

    chuvaDeFolhas();

    window.setTimeout(function () {
      grade.classList.add(
        "memoria-complementos__grade--finalizada"
      );

      final.hidden = false;

      window.requestAnimationFrame(function () {
        final.classList.add(
          "memoria-complementos__final--visivel"
        );
      });
    }, 600);

    /*
     * Primeiro aparece EU + VOCÊ.
     * Depois a animação transforma em NÓS.
     */
    window.setTimeout(function () {
      final.classList.add(
        "memoria-complementos__final--nos"
      );
    }, 1900);

    /*
     * Só desbloqueia o próximo componente
     * depois da animação terminar.
     */
    window.setTimeout(function () {
      concluirPuzzle(elemento);
    }, 3400);
  }

  function selecionar(carta) {
    if (
      bloqueado ||
      carta.disabled ||
      carta === primeira
    ) {
      return;
    }

    carta.classList.add(
      "memoria__carta--aberta"
    );

    if (!primeira) {
      primeira = carta;
      return;
    }

    segunda = carta;
    bloqueado = true;
    movimentos += 1;

    atualizar();

    const acertou =
      primeira.dataset.par ===
      segunda.dataset.par;

    if (acertou) {
      const idPar =
        primeira.dataset.par;

      const par =
        pares.find(function (item, indice) {
          return (
            String(item.id || `par-${indice}`) ===
            idPar
          );
        });

      primeira.disabled = true;
      segunda.disabled = true;

      primeira.classList.add(
        "memoria__carta--encontrada"
      );

      segunda.classList.add(
        "memoria__carta--encontrada"
      );

      encontrados += 1;

      atualizar();

      if (par) {
        mostrarEncontro(par);
      }

      criarFolha();
      criarFolha();

      limparCartas();

      if (encontrados === pares.length) {
        revelarFinal();
      }

      return;
    }

    feedback.textContent =
      "Ainda não. Essas duas não se completam.";

    feedback.className =
      "puzzle__feedback puzzle__feedback--erro";

    window.setTimeout(function () {
      primeira?.classList.remove(
        "memoria__carta--aberta"
      );

      segunda?.classList.remove(
        "memoria__carta--aberta"
      );

      limparCartas();
    }, 900);
  }

  function montar() {
    grade.innerHTML = "";

    primeira = null;
    segunda = null;
    bloqueado = false;
    movimentos = 0;
    encontrados = 0;

    elemento.dataset.resolvido = "false";

    elemento.classList.remove(
      "puzzle--resolvido"
    );

    grade.classList.remove(
      "memoria-complementos__grade--finalizada"
    );

    final.hidden = true;

    final.classList.remove(
      "memoria-complementos__final--visivel",
      "memoria-complementos__final--nos"
    );

    reiniciar.disabled = false;

    feedback.textContent = "";
    feedback.className = "puzzle__feedback";

    encontro.innerHTML = "";

    encontro.classList.remove(
      "memoria-complementos__encontro--visivel"
    );

    atualizar();

    const cartas = [];

    pares.forEach(function (par, indice) {
      const id =
        String(par.id || `par-${indice}`);

      /*
       * Diferentemente da memória antiga,
       * aqui A e B são cartas diferentes.
       */
      const cartaA =
        par.a || {
          texto: "A"
        };

      const cartaB =
        par.b || {
          texto: "B"
        };

      cartas.push({
        ...cartaA,
        identificador: id
      });

      cartas.push({
        ...cartaB,
        identificador: id
      });
    });

    embaralhar(cartas).forEach(
      function (dadosCarta) {
        const botao =
          document.createElement("button");

        botao.type = "button";

        botao.className =
          "memoria__carta memoria-complementos__carta";

        botao.dataset.par =
          dadosCarta.identificador;

        botao.innerHTML = `
          <span class="memoria__interior">

            <span class="memoria__verso">
              ♡
            </span>

            <span class="memoria__frente">
              ${criarConteudoComplemento(
                dadosCarta
              )}
            </span>

          </span>
        `;

        botao.addEventListener(
          "click",
          function () {
            selecionar(botao);
          }
        );

        grade.appendChild(botao);
      }
    );
  }

  reiniciar.addEventListener(
    "click",
    montar
  );

  montar();

  return elemento;
}

  /*
   * Telescópio
   */

  function criarPuzzleFrase(dados) {
    const elemento = document.createElement("article");

    elemento.className = "componente puzzle puzzle-frase";
    elemento.innerHTML = `
      <span class="componente__etiqueta">Um pequeno desafio</span>
      <h3>${escaparHTML(dados.titulo || "Complete a frase")}</h3>
      <p class="puzzle__descricao">${escaparHTML(dados.instrucao || "")}</p>
      <form class="puzzle-frase__formulario">
        <label class="puzzle-frase__linha">
          <span class="puzzle-frase__frase">${escaparHTML(dados.frase || "")}</span>
          <input class="puzzle-frase__input" type="text" autocomplete="off"
            placeholder="${escaparHTML(dados.placeholder || "")}" aria-label="Complete a frase" required>
        </label>
        <button class="botao" type="submit">${escaparHTML(dados.botao || "Confirmar")}</button>
      </form>
      <div class="puzzle-frase__mensagem" aria-live="polite"></div>
    `;

    const formulario = elemento.querySelector("form");
    const input = elemento.querySelector("input");
    const botao = elemento.querySelector("button");
    const mensagem = elemento.querySelector(".puzzle-frase__mensagem");
    let processando = false;

    const esperar = (duracao) => new Promise((resolver) => {
      window.setTimeout(resolver, Math.max(0, Number(duracao) || 0));
    });

    async function mostrarFluxo(fluxo) {
      for (const etapa of Array.isArray(fluxo) ? fluxo : []) {
        mensagem.textContent = etapa.texto || "";
        await esperar(etapa.duracao);
      }
    }

    async function digitar(texto) {
      input.value = "";
      for (const caractere of String(texto || "")) {
        input.value += caractere;
        await esperar(dados.velocidadeDigitacao || 120);
      }
    }

    formulario.addEventListener("submit", async function (evento) {
      evento.preventDefault();
      if (processando || !input.value.trim()) return;

      processando = true;
      input.disabled = true;
      botao.disabled = true;

      const acertou = normalizar(input.value) === normalizar(dados.respostaCorreta);

      if (acertou) {
        await mostrarFluxo(dados.fluxoAcerto);
      } else {
        await mostrarFluxo(dados.fluxoErro);
        if (dados.apagarResposta !== false) input.value = "";
        await digitar(dados.textoDigitadoAutomaticamente || dados.respostaCorreta);
        await mostrarFluxo(dados.mensagensFinais);
      }

      mensagem.textContent = dados.mensagemDesbloqueio || "Desbloqueado.";
      mensagem.classList.add("puzzle-frase__mensagem--final");
      elemento.classList.add("puzzle-frase--finalizado");
      concluirPuzzle(elemento);
    });

    return elemento;
  }

  function criarPuzzleSorvete(dados) {
    const elemento = document.createElement("article");
    elemento.className = "componente puzzle sorveteria";
    elemento.innerHTML = `
      <span class="componente__etiqueta">Bodas de sorvete</span>
      <h3>${escaparHTML(dados.titulo || "Monte seu sorvete")}</h3>
      <p class="puzzle__descricao">${escaparHTML(dados.instrucao || "")}</p>
      <div class="sorveteria__jogo">
        <div class="sorveteria__palco" aria-live="polite">
          <span class="sorveteria__coracao" aria-hidden="true">♡</span>
          <div class="sorvete-montado"><div class="sorvete-montado__bolas" data-bolas></div><div class="sorvete-montado__casquinha" aria-hidden="true"></div></div>
          <p class="sorveteria__instrucao" data-instrucao>Escolha a primeira bola</p>
        </div>
        <div class="sorveteria__painel">
          <span class="sorveteria__passo">Sabores da nossa história</span>
          <div class="sabores" role="group" aria-label="Escolha os sabores do sorvete">
            <button class="sabor sabor--flocos" type="button" data-sabor="flocos"><i></i><span><strong>Flocos</strong><small>leve e cheio de surpresas</small></span></button>
            <button class="sabor sabor--chocolate" type="button" data-sabor="chocolate"><i></i><span><strong>Chocolate</strong><small>intenso como o que sinto</small></span></button>
            <button class="sabor sabor--creme" type="button" data-sabor="creme"><i></i><span><strong>Creme</strong><small>doce como o seu carinho</small></span></button>
            <button class="sabor sabor--morango" type="button" data-sabor="morango"><i></i><span><strong>Morango</strong><small>romântico como nós duas</small></span></button>
          </div>
          <div class="sorveteria__acoes"><button class="sorveteria__limpar" data-limpar type="button">Recomeçar</button><button class="sorveteria__finalizar" data-finalizar type="button" disabled>Finalizar meu sorvete ♡</button></div>
        </div>
      </div>
      <div class="sorveteria__surpresa" data-surpresa hidden><span>🍦</span><p>${escaparHTML(dados.mensagem || "")}</p><h3>${escaparHTML(dados.dedicatoria || "")}</h3><small>${escaparHTML(dados.final || "")}</small></div>`;

    const nomes = { flocos: "Flocos", chocolate: "Chocolate", creme: "Creme", morango: "Morango" };
    const bolas = elemento.querySelector("[data-bolas]");
    const instrucao = elemento.querySelector("[data-instrucao]");
    const finalizar = elemento.querySelector("[data-finalizar]");
    const surpresa = elemento.querySelector("[data-surpresa]");
    function atualizar() { const quantidade = bolas.children.length; instrucao.textContent = quantidade === 0 ? "Escolha a primeira bola" : quantidade < 3 ? `Mais ${3 - quantidade} ${quantidade === 2 ? "sabor" : "sabores"} para completar` : "Sua combinação está pronta!"; finalizar.disabled = quantidade !== 3; }
    elemento.querySelectorAll("[data-sabor]").forEach(function (botao) { botao.addEventListener("click", function () { if (bolas.children.length >= 3) return; const sabor = botao.dataset.sabor; const bola = document.createElement("button"); bola.type = "button"; bola.className = `sorvete-bola sorvete-bola--${sabor}`; bola.setAttribute("aria-label", `Remover bola de ${nomes[sabor]}`); bola.addEventListener("click", function () { bola.remove(); surpresa.hidden = true; atualizar(); }); bolas.appendChild(bola); surpresa.hidden = true; atualizar(); }); });
    elemento.querySelector("[data-limpar]").addEventListener("click", function () { bolas.replaceChildren(); surpresa.hidden = true; atualizar(); });
    finalizar.addEventListener("click", function () { surpresa.hidden = false; finalizar.disabled = true; concluirPuzzle(elemento); });
    return elemento;
  }

  function criarTelescopio(dados) {
    const elemento = document.createElement("article");

    elemento.className =
      "componente puzzle telescopio";

    elemento.innerHTML = `
      <span class="componente__etiqueta">
        Um céu guardado no tempo
      </span>

      <h3>
        ${escaparHTML(
          dados.titulo || "Olhe pelo telescópio"
        )}
      </h3>

      <p class="puzzle__descricao">
        ${escaparHTML(dados.descricao || "")}
      </p>

      <button
        class="telescopio__visor"
        type="button"
        aria-label="Olhar pelo telescópio e aproximar o céu"
      >
        <span class="telescopio__ceu">
          <img
            src="${escaparHTML(dados.imagem || "")}"
            alt="${escaparHTML(
              dados.alt ||
              "Representação artística do céu no momento do nascimento"
            )}"
          >
        </span>

        <span class="telescopio__mira" aria-hidden="true"></span>

        <span class="telescopio__instrucao">
          <span aria-hidden="true">✦</span>
          <span data-instrucao>Toque para aproximar</span>
        </span>
      </button>

      <div class="telescopio__revelacao" aria-live="polite">
        <span class="telescopio__data">
          ${escaparHTML(dados.data || "")}
        </span>

        <p>${escaparHTML(dados.mensagem || "")}</p>
      </div>
    `;

    const visor =
      elemento.querySelector(".telescopio__visor");

    const instrucao =
      elemento.querySelector("[data-instrucao]");

    let nivel = 0;

    visor.addEventListener("click", function () {
      nivel += 1;
      elemento.dataset.zoom = String(nivel);

      if (nivel === 1) {
        instrucao.textContent = "Mais perto...";
        return;
      }

      visor.disabled = true;
      elemento.classList.add(
        "telescopio--revelado"
      );

      concluirPuzzle(elemento);
    });

    return elemento;
  }

  function criarSonicFlores(dados = {}) {

  const elemento = document.createElement("article");

  elemento.className =
    "componente puzzle sonic-flores";

  /*
   * Escape LOCAL.
   * O Sonic não depende mais de escaparHTML().
   */
  const seguro = function (valor) {
    const div = document.createElement("div");
    div.textContent = String(valor ?? "");
    return div.innerHTML;
  };

  const imagem =
    dados.imagem ||
    "./assets/imagens/sonic-zoiudo-flor.jpg";

  const titulo =
    dados.titulo ||
    "Tem uma última coisinha...";

  const descricao =
    dados.descricao ||
    "Acho que o Sonic tem alguma coisa para te entregar.";

  const instrucao =
    dados.instrucao ||
    "Talvez você devesse clicar nele...";

  elemento.innerHTML = `
    <span class="componente__etiqueta">
      Uma pequena surpresa
    </span>

    <h3>
      ${seguro(titulo)}
    </h3>

    <p class="puzzle__descricao">
      ${seguro(descricao)}
    </p>

    <div class="sonic-flores__area">

      <button
        type="button"
        class="sonic-flores__botao"
        aria-label="Clique no Sonic"
      >

        <img
          src="${seguro(imagem)}"
          alt="${seguro(
            dados.alt ||
            "Sonic segurando uma flor"
          )}"
          draggable="false"
        >

      </button>

    </div>

    <p class="sonic-flores__instrucao">
      ${seguro(instrucao)}
    </p>
  `;


  const botao =
    elemento.querySelector(
      ".sonic-flores__botao"
    );


  let ativado = false;


  /*
   * =====================================================
   * EXPLOSÃO
   * =====================================================
   */

  function explodir(x, y) {

    const flores = [
      "🌹",
      "🌷",
      "🌸",
      "🌺",
      "🌻",
      "🌼",
      "💐",
      "🌿",
      "💗",
      "✨"
    ];


    for (
      let i = 0;
      i < 55;
      i++
    ) {

      const flor =
        document.createElement("span");

      flor.className =
        "sonic-flor-explosao";

      flor.textContent =
        flores[
          Math.floor(
            Math.random() *
            flores.length
          )
        ];


      flor.style.left =
        `${x}px`;

      flor.style.top =
        `${y}px`;


      const angulo =
        Math.random() *
        Math.PI *
        2;

      const distancia =
        120 +
        Math.random() *
        380;


      flor.style.setProperty(
        "--x",
        `${Math.cos(angulo) * distancia}px`
      );

      flor.style.setProperty(
        "--y",
        `${Math.sin(angulo) * distancia}px`
      );

      flor.style.setProperty(
        "--rotacao",
        `${-180 + Math.random() * 360}deg`
      );

      flor.style.setProperty(
        "--tamanho",
        `${18 + Math.random() * 28}px`
      );


      document.body.appendChild(
        flor
      );


      setTimeout(
        function () {
          flor.remove();
        },
        2200
      );
    }
  }


  /*
   * =====================================================
   * TELA DA SURPRESA
   * =====================================================
   */

  function abrirTelaSurpresa() {

    const tela =
      document.createElement("div");

    tela.className =
      "sonic-flores__tela";


    tela.innerHTML = `

      <div class="sonic-flores__flores"></div>

      <div class="sonic-flores__conteudo">

        <span class="sonic-flores__para">
          ${seguro(
            dados.mensagemPequena ||
            "para você, Rayane"
          )}
        </span>

        <h2>
          ${seguro(
            dados.mensagemTitulo ||
            "Algumas coisas florescem em dias simples."
          )}
        </h2>

        <p>
          ${seguro(
            dados.mensagemFinal ||
            "Principalmente quando encontram a pessoa certa. ❤️"
          )}
        </p>

        <button
          type="button"
          class="sonic-flores__fechar"
        >
          continuar ♡
        </button>

      </div>
    `;


    document.body.appendChild(
      tela
    );


    document.documentElement.classList.add(
      "sonic-flores-aberto"
    );

    document.body.classList.add(
      "sonic-flores-aberto"
    );


    /*
     * Entrada da tela
     */

    requestAnimationFrame(
      function () {

        tela.classList.add(
          "sonic-flores__tela--visivel"
        );

      }
    );


    /*
     * Chuva de flores
     */

    const containerFlores =
      tela.querySelector(
        ".sonic-flores__flores"
      );


    const flores = [
      "🌹",
      "🌷",
      "🌸",
      "🌺",
      "🌻",
      "🌼",
      "💐",
      "🌿",
      "💗"
    ];


    for (
      let i = 0;
      i < 160;
      i++
    ) {

      setTimeout(
        function () {

          if (
            !tela.isConnected
          ) {
            return;
          }


          const flor =
            document.createElement(
              "span"
            );


          flor.className =
            "sonic-flor";


          flor.textContent =
            flores[
              Math.floor(
                Math.random() *
                flores.length
              )
            ];


          flor.style.left =
            `${Math.random() * 100}%`;


          flor.style.fontSize =
            `${18 + Math.random() * 25}px`;


          flor.style.animationDuration =
            `${3 + Math.random() * 4}s`;


          flor.style.animationDelay =
            `${Math.random() * 1.5}s`;


          containerFlores.appendChild(
            flor
          );


          setTimeout(
            function () {
              flor.remove();
            },
            8000
          );

        },
        i * 18
      );
    }


    /*
     * Botão continuar
     */

    const fechar =
      tela.querySelector(
        ".sonic-flores__fechar"
      );


    fechar.addEventListener(
      "click",
      function (evento) {

        evento.preventDefault();

        evento.stopPropagation();


        /*
         * Fecha visualmente
         */

        tela.classList.add(
          "sonic-flores__tela--saindo"
        );


        document.documentElement.classList.remove(
          "sonic-flores-aberto"
        );

        document.body.classList.remove(
          "sonic-flores-aberto"
        );


        /*
         * Remove depois da animação
         */

        setTimeout(
          function () {

            tela.remove();

          },
          700
        );

      }
    );

  }


  /*
   * =====================================================
   * CLIQUE NO SONIC
   * =====================================================
   */

  botao.addEventListener(
    "click",
    function () {

      if (ativado) {
        return;
      }


      ativado = true;


      elemento.classList.add(
        "sonic-flores--ativado"
      );


      const rect =
        botao.getBoundingClientRect();


      const x =
        rect.left +
        rect.width / 2;


      const y =
        rect.top +
        rect.height / 2;


      /*
       * Explode flores
       */

      explodir(
        x,
        y
      );


      /*
       * Pequeno atraso para
       * deixar a explosão acontecer
       */

      setTimeout(
        function () {

          abrirTelaSurpresa();


          /*
           * Marca o puzzle como resolvido.
           *
           * O próprio sistema do capítulo
           * coloca dataset.chaveDesbloqueio
           * no elemento.
           */

          concluirPuzzle(
            elemento
          );

        },
        450
      );

    }
  );


  return elemento;
}

  function criarComponente(dados) {
    const tipo =
      normalizar(dados?.tipo);

    try {
      switch (tipo) {
        case "carta":
          return criarCarta(dados);

        case "vale-night":
          return criarValeNight(dados);

        case "musica":
          return criarMusica(dados);

        case "cofre":
          return criarCofre(dados);

        case "termo":
          return criarTermo(dados);

        case "contexto":
          return criarContexto(dados);

        case "conexo":
          return criarConexo(dados);

        case "ranking-album":
          return criarRankingAlbum(dados);

        case "memoria":
          return criarMemoria(dados);

        case "memoria-complementos":
          return criarMemoriaComplementos(dados);

        case "puzzle":
          return criarPuzzleFrase(dados);

        case "boa-noite":
          return criarBoaNoite(dados);

        case "hora-de-dormir":
          return criarHoraDeDormir(dados);

        case "labirinto-chocolate":
          return criarLabirintoChocolate(dados);

        case "sorvete":
          return criarPuzzleSorvete(dados);

        case "telescopio":
          return criarTelescopio(dados);
        
        case "sonic-flores":
        return criarSonicFlores(dados);

        case "investigacao-pipoca": {
          const elemento = document.createElement("section");
          elemento.className = "componente investigacao-pipoca";
          const quadro = document.createElement("iframe");
          quadro.src = "./investigacao-pipoca.html";
          quadro.title = "O Caso da Garota que Não Era Luisa — investigação interativa";
          quadro.loading = "lazy";
          quadro.style.cssText = "width:100%;height:min(82dvh,860px);min-height:540px;border:0;border-radius:18px;background:#1d1520;";
          elemento.appendChild(quadro);
          window.addEventListener("message", function(event) {
            if (event.source === quadro.contentWindow && event.data?.tipo === "investigacao-pipoca-concluida") concluirPuzzle(elemento);
          });
          return elemento;
        }

        case "puzzle-algodao":
          return window.criarPuzzleAlgodao(dados, concluirPuzzle);

        default:
          return criarElementoErro(
            `Tipo não reconhecido: ${
              tipo || "sem tipo"
            }`
          );
      }
    } catch (erro) {
      console.error(
        `Erro no componente "${tipo}":`,
        erro,
        dados
      );

      return criarElementoErro(
        `Não foi possível mostrar o componente "${tipo}".`
      );
    }
  }

  /*
   * Capítulo
   */

  function criarCapitulo(dados) {
    const capitulo =
      document.createElement("section");

    capitulo.className = "capitulo";
    capitulo.id =
      String(dados.id || "");

    capitulo.innerHTML = `
      <header class="capitulo__cabecalho">
        <button
          class="capitulo__botao"
          type="button"
          aria-expanded="false"
          aria-controls="${escaparHTML(
            `${dados.id || "capitulo"}-conteudo`
          )}"
        >
          <span class="capitulo__resumo">
            <time
              class="capitulo__data"
              datetime="${escaparHTML(
                dados.id || ""
              )}"
            >
              ${escaparHTML(dados.data || "")}
            </time>

            <span class="capitulo__titulo">
              ${escaparHTML(
                dados.titulo || "Capítulo"
              )}
            </span>
          </span>

          <span
            class="capitulo__icone"
            aria-hidden="true"
          ></span>
        </button>
      </header>

      <div
        class="capitulo__componentes"
        id="${escaparHTML(
          `${dados.id || "capitulo"}-conteudo`
        )}"
        hidden
      ></div>
    `;

    const container =
      capitulo.querySelector(
        ".capitulo__componentes"
      );

    const botao =
      capitulo.querySelector(".capitulo__botao");

    const componentes =
      Array.isArray(dados.componentes)
        ? dados.componentes.filter(function (componente) {
            return normalizar(componente?.tipo) !== "mapa";
          })
        : [];

    let puzzlePendente = null;
    let numeroPuzzle = 0;
    let chavePuzzleAnterior = null;

    componentes.forEach(function (
      componente,
      indice
    ) {
      try {
        const tipo =
          normalizar(componente?.tipo);

        // Padrão: a música que fecha o capítulo fica guardada até o desafio
        // anterior ser resolvido. Sem desafio antes, ela já aparece aberta.
        if (tipo === "musica") {
          componente = { ...componente, bloqueada: Boolean(puzzlePendente) };
        }

        const elemento =
          criarComponente(componente);

        if (TIPOS_PUZZLE.has(tipo)) {
  numeroPuzzle += 1;

  puzzlePendente =
    `${dados.id || "capitulo"}-puzzle-${numeroPuzzle}`;

  elemento.dataset.chaveDesbloqueio =
    puzzlePendente;

  elemento.dataset.puzzleId =
    puzzlePendente;
}

        if (
  tipo === "musica" &&
  componente.bloqueada === true
) {

  if (puzzlePendente) {

    elemento.dataset.chaveDesbloqueio =
      puzzlePendente;

  } else {

    elemento.classList.remove(
      "musica--bloqueada"
    );

  }

  puzzlePendente = null;
}

        container.appendChild(elemento);
      } catch (erro) {
        console.error(
          `Erro no componente ${indice}:`,
          erro
        );

        container.appendChild(
          criarElementoErro(
            "Este componente apresentou um erro."
          )
        );
      }
    });

    capitulo.addEventListener(
      "puzzle-resolvido",
      function (evento) {
        const chave =
          evento.detail?.chave;

        if (!chave) {
          return;
        }

        const musicas =
          capitulo.querySelectorAll(
            ".musica--bloqueada"
          );

        const musica = [...musicas].find(
          function (item) {
            return (
              item.dataset.chaveDesbloqueio ===
              chave
            );
          }
        );

        if (!musica) {
          return;
        }

        // Todo desafio termina com o mesmo aviso levando até a música.
        // (Os joguinhos que já têm o botão no próprio final usam o deles.)
        const desafio = evento.target;
        if (desafio instanceof HTMLElement && !desafio.querySelector("[data-ir-musica]")) {
          const aviso = document.createElement("button");
          aviso.type = "button";
          aviso.className = "hora-dormir__musica musica-aviso";
          aviso.dataset.irMusica = "";
          aviso.hidden = true;
          desafio.appendChild(aviso);
          ligarBotaoMusica(desafio, aviso);
        }

        musica.classList.add(
          "musica--desbloqueando"
        );

        window.setTimeout(function () {
          musica.classList.remove(
            "musica--bloqueada",
            "musica--desbloqueando"
          );

          musica.classList.add(
            "musica--desbloqueada"
          );
          musica.dataset.musicaBloqueada = "false";
          const bloqueio = musica.querySelector(".musica__bloqueio");
          const interior = musica.querySelector(".musica__interior");
          if (bloqueio) bloqueio.hidden = true;
          if (interior) interior.hidden = false;
        }, 650);
      }
    );

    botao.addEventListener("click", function () {
      const deveAbrir =
        botao.getAttribute("aria-expanded") !== "true";

      document
        .querySelectorAll(".capitulo--aberto")
        .forEach(function (outroCapitulo) {
          if (outroCapitulo === capitulo) {
            return;
          }

          outroCapitulo.classList.remove(
            "capitulo--aberto"
          );

          const outroBotao =
            outroCapitulo.querySelector(
              ".capitulo__botao"
            );

          const outroConteudo =
            outroCapitulo.querySelector(
              ".capitulo__componentes"
            );

          outroBotao?.setAttribute(
            "aria-expanded",
            "false"
          );

          if (outroConteudo) {
            outroConteudo.hidden = true;
          }
        });

      capitulo.classList.toggle(
        "capitulo--aberto",
        deveAbrir
      );

      botao.setAttribute(
        "aria-expanded",
        String(deveAbrir)
      );

      container.hidden = !deveAbrir;

      if (deveAbrir) {
        container.querySelectorAll("video[autoplay]").forEach(function (video) {
          video.defaultMuted = true;
          video.muted = true;
          video.volume = 0;
          const tentativa = video.play();
          if (tentativa && typeof tentativa.catch === "function") {
            tentativa.catch(function () {
              video.closest(".vale-night")?.classList.add("vale-night--aguardando-toque");
            });
          }
        });
      }
    });

    capitulo.addEventListener(
  "puzzle:concluido",
  function (evento) {

    const detalhe =
      evento.detail || {};

    const puzzleId =
      detalhe.puzzleId ||
      detalhe.elemento?.dataset?.puzzleId ||
      "";

    if (!puzzleId) {
      return;
    }

    const musica =
      capitulo.querySelector(
        ".musica--bloqueada[data-chave-desbloqueio='" +
        CSS.escape(String(puzzleId)) +
        "']"
      );

    if (!musica) {
      return;
    }

    const bloqueio =
      musica.querySelector(
        ".musica__bloqueio"
      );

    const interior =
      musica.querySelector(
        ".musica__interior"
      );

    musica.classList.remove(
      "musica--bloqueada"
    );

    musica.classList.add(
      "musica--desbloqueada"
    );

    musica.dataset.musicaBloqueada =
      "false";

    if (bloqueio) {
      bloqueio.hidden = true;
    }

    if (interior) {
      interior.hidden = false;
    }

  }
);

    return capitulo;
  }

  /*
   * Carregamento
   */

  async function carregarCapitulos() {
    const container =
      document.getElementById("capitulos");

    if (!container) {
      return;
    }

    try {
      const resposta = await fetch(
        "./data/capitulos.json",
        {
          cache: "no-store"
        }
      );

      if (!resposta.ok) {
        throw new Error(
          `Erro ${resposta.status} ao carregar capitulos.json.`
        );
      }

      const texto = await resposta.text();

      let capitulos;

      try {
        capitulos = JSON.parse(texto);
      } catch (erro) {
        throw new Error(
          `O JSON possui um erro: ${erro.message}`
        );
      }

      if (!Array.isArray(capitulos)) {
        throw new Error(
          "O capitulos.json precisa começar com [ e terminar com ]."
        );
      }

      container.innerHTML = "";

      const meses = new Map();
      const nomesMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];

      capitulos.forEach(function (dados) {
        const partes = String(dados.id || "").split("-");
        const ano = Number(partes[0]);
        const mes = Number(partes[1]);
        const chave = Number.isFinite(ano) && mes >= 1 && mes <= 12
          ? `${ano}-${String(mes).padStart(2, "0")}`
          : "sem-data";

        if (!meses.has(chave)) meses.set(chave, []);
        meses.get(chave).push(dados);
      });

      meses.forEach(function (itens, chave) {
        const grupo = document.createElement("section");
        const [ano, mes] = chave.split("-").map(Number);
        const titulo = chave === "sem-data"
          ? "Outras memórias"
          : `${nomesMeses[mes - 1]} de ${ano}`;

        const idMes = `mes-${chave}`;
        grupo.className = "mes-timeline";
        grupo.innerHTML = `<header class="mes-timeline__cabecalho"><button type="button" class="mes-timeline__botao" aria-expanded="false" aria-controls="${escaparHTML(idMes)}"><span class="mes-timeline__titulo"><span class="mes-timeline__icone">♡</span><span><strong>${escaparHTML(titulo)}</strong></span></span><span class="mes-timeline__meta"><small>${itens.length} ${itens.length === 1 ? "capítulo" : "capítulos"}</small><i aria-hidden="true"></i></span></button></header><div class="mes-timeline__capitulos" id="${escaparHTML(idMes)}" hidden></div>`;
        const lista = grupo.querySelector(".mes-timeline__capitulos");
        const botaoMes = grupo.querySelector(".mes-timeline__botao");

        botaoMes.addEventListener("click", function () {
          const abrir = botaoMes.getAttribute("aria-expanded") !== "true";
          botaoMes.setAttribute("aria-expanded", String(abrir));
          grupo.classList.toggle("mes-timeline--aberto", abrir);
          lista.hidden = !abrir;
        });

        itens.forEach(function (dados, indice) {
        try {
          lista.appendChild(criarCapitulo(dados));
        } catch (erro) {
          console.error(
            `Erro no capítulo ${indice}:`,
            erro
          );

          lista.appendChild(
            criarElementoErro(
              `Não foi possível mostrar o capítulo ${
                dados?.titulo || indice + 1
              }.`
            )
          );
        }
        });

        container.appendChild(grupo);
      });

      const mapaPrincipal = document.getElementById("mapa-principal");
      if (mapaPrincipal && !mapaPrincipal.children.length) {
        const componenteMapa = capitulos
          .flatMap(function (capitulo) { return Array.isArray(capitulo.componentes) ? capitulo.componentes : []; })
          .find(function (componente) { return normalizar(componente?.tipo) === "mapa"; });
        mapaPrincipal.appendChild(criarMapa(componenteMapa || { id: "nosso-mapa" }));
      }
    } catch (erro) {
      console.error(
        "Erro ao carregar capítulos:",
        erro
      );

      container.innerHTML = `
        <div class="mensagem-erro">
          <strong>
            Não foi possível carregar as memórias.
          </strong>

          <p>
            ${escaparHTML(erro.message)}
          </p>
        </div>
      `;
    }
  }

  /*
   * Datas especiais — o sticker acima da contagem.
   * No dia, mostra a comemoração; nos outros dias, quanto falta para a próxima.
   * Para conferir como fica em outra data: ?data=2026-11-16
   */
  const NAMORO = { ano: 2026, mes: 6, dia: 16 };
  const NASCIMENTO_RAYANE = 2005;

  function porExtenso(numero) {
    const nomes = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze",
      "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove", "vinte"];
    return nomes[numero] || String(numero);
  }

  function capitalizar(texto) {
    return texto.charAt(0).toLocaleUpperCase("pt-BR") + texto.slice(1);
  }

  function tempoJuntas(meses) {
    const anos = Math.floor(meses / 12);
    const resto = meses % 12;
    const parteAnos = anos ? `${porExtenso(anos)} ${anos === 1 ? "ano" : "anos"}` : "";
    const parteMeses = resto ? `${porExtenso(resto)} ${resto === 1 ? "mês" : "meses"}` : "";
    return [parteAnos, parteMeses].filter(Boolean).join(" e ");
  }

  // Devolve o que comemorar numa data, ou null se for um dia comum.
  function dataEspecial(data) {
    const ano = data.getFullYear();
    const mes = data.getMonth() + 1;
    const dia = data.getDate();

    if (mes === 7 && dia === 30) {
      return {
        icone: "🎂",
        titulo: "O dia mais importante do ano",
        texto: `Feliz aniversário, Rayane! ${porExtenso(ano - NASCIMENTO_RAYANE)} anos de você no mundo ♡`
      };
    }

    const meses = (ano - NAMORO.ano) * 12 + (mes - NAMORO.mes);
    if (dia === NAMORO.dia && meses > 0) {
      if (meses % 12 === 0) {
        return {
          icone: "💍",
          titulo: `${capitalizar(tempoJuntas(meses))} sendo sua`,
          texto: "Feliz aniversário de namoro, meu amor. O melhor dia em que eu disse sim ♡"
        };
      }
      return {
        icone: "♡",
        titulo: `${capitalizar(tempoJuntas(meses))} sendo sua`,
        texto: "Feliz mesversário, minha princesa. Mais um mês te escolhendo ♡"
      };
    }

    if (mes === 3 && dia === 25 && ano > 2026) {
      const anos = ano - 2026;
      return {
        icone: "✨",
        titulo: "O dia em que a gente se conheceu",
        texto: `${capitalizar(porExtenso(anos))} ${anos === 1 ? "ano" : "anos"} desde aquele 25 de março ♡`
      };
    }

    if (mes === 6 && dia === 12) {
      return { icone: "💌", titulo: "Dia dos Namorados", texto: "Feliz Dia dos Namorados pra minha namorada favorita ♡" };
    }

    if (mes === 12 && dia === 25) {
      return { icone: "🎄", titulo: "Feliz Natal, meu amor", texto: "O meu presente favorito continua sendo você ♡" };
    }

    if (mes === 1 && dia === 1) {
      return { icone: "🥂", titulo: "Feliz Ano Novo!", texto: `Que ${ano} seja mais um ano inteirinho sendo sua ♡` };
    }

    return null;
  }

  function dataDeHoje() {
    const parametro = new URLSearchParams(window.location.search).get("data");
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(parametro || "");
    if (partes) return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
    const agora = new Date();
    return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  }

  function iniciarDataEspecial() {
    const area = document.getElementById("data-especial");
    if (!area) return;

    function mostrar() {
      const hoje = dataDeHoje();
      let evento = dataEspecial(hoje);
      let faltam = 0;

      for (let dias = 1; !evento && dias <= 400; dias += 1) {
        const dia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + dias);
        evento = dataEspecial(dia);
        if (evento) faltam = dias;
      }
      if (!evento) {
        area.hidden = true;
        return;
      }

      const aviso = faltam === 0 ? "hoje é dia especial" : faltam === 1 ? "é amanhã!" : `faltam ${faltam} dias`;
      area.className = `data-especial${faltam === 0 ? " data-especial--hoje" : ""}`;
      area.innerHTML = `
        <span class="data-especial__icone" aria-hidden="true">${escaparHTML(evento.icone)}</span>
        <span class="data-especial__texto">
          <small>${escaparHTML(aviso)}</small>
          <strong>${escaparHTML(evento.titulo)}</strong>
          ${faltam === 0 ? `<span>${escaparHTML(evento.texto)}</span>` : ""}
        </span>
      `;
      area.hidden = false;
    }

    mostrar();

    // Troca sozinho à meia-noite, se o site ficar aberto.
    function agendarMeiaNoite() {
      const agora = new Date();
      const meiaNoite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 0, 5);
      window.setTimeout(function () {
        mostrar();
        agendarMeiaNoite();
      }, meiaNoite - agora);
    }
    agendarMeiaNoite();
  }

  function iniciarAreaCartas() {
    const HASH_SENHA = "c5e68184d2869573febab888fe67355af26a5fc059a50f8d332efe105bd9404a";
    // Acesso de leitura. Em um site estático, o servidor ainda deve aplicar
    // suas próprias regras para proteger dados realmente confidenciais.
    const HASH_VISITANTE = "25d114d44f1ee498521f51cd12e524e8fd6e67c82a9d21fc29c0bbc7fff457c4";
    const modal = document.getElementById("senha-cartas");
    const formulario = document.getElementById("senha-cartas-form");
    const entrada = document.getElementById("senha-cartas-input");
    const aviso = document.getElementById("senha-cartas-aviso");
    const area = document.getElementById("cartas");
    const bloquear = document.getElementById("bloquear-cartas");
    const gatilhos = document.querySelectorAll("#abrir-cartas, [data-abrir-cartas]");

    if (!modal || !formulario || !entrada || !aviso || !area) return;

    async function calcularHash(valor) {
      const bytes = new TextEncoder().encode(valor.trim().toLocaleLowerCase("pt-BR"));
      const resumo = await crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(resumo))
        .map(function (byte) { return byte.toString(16).padStart(2, "0"); })
        .join("");
    }

    function fecharModal() {
      modal.hidden = true;
      document.body.classList.remove("senha-cartas-aberta");
      aviso.textContent = "";
      entrada.value = "";
    }

    function mostrarArea() {
      area.hidden = false;
      area.classList.remove("area-cartas--entrando");
      void area.offsetWidth;
      area.classList.add("area-cartas--entrando");
      window.setTimeout(function () {
        area.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }

    function aplicarPerfil(perfil) {
      const visitante = perfil === "visitante";
      document.body.classList.toggle("acesso-visitante", visitante);
      document.querySelectorAll("[data-somente-proprietaria]").forEach(function (elemento) {
        elemento.hidden = visitante;
      });
    }

    function abrir() {
      if (sessionStorage.getItem("rj-cartas-abertas") === "sim") {
        aplicarPerfil(sessionStorage.getItem("rj-perfil") || "proprietaria");
        mostrarArea();
        return;
      }

      modal.hidden = false;
      document.body.classList.add("senha-cartas-aberta");
      window.setTimeout(function () { entrada.focus(); }, 80);
    }

    gatilhos.forEach(function (gatilho) {
      gatilho.addEventListener("click", function (evento) {
        evento.preventDefault();
        abrir();
      });
    });

    modal.querySelectorAll("[data-fechar-senha]").forEach(function (botao) {
      botao.addEventListener("click", fecharModal);
    });

    formulario.addEventListener("submit", async function (evento) {
      evento.preventDefault();
      aviso.textContent = "Verificando...";

      try {
        const hash = await calcularHash(entrada.value);
        const perfil = hash === HASH_SENHA
          ? "proprietaria"
          : hash === HASH_VISITANTE ? "visitante" : "";
        if (!perfil) {
          aviso.textContent = "Essa senha não abriu o nosso cantinho.";
          formulario.classList.remove("senha-cartas__cartao--erro");
          void formulario.offsetWidth;
          formulario.classList.add("senha-cartas__cartao--erro");
          entrada.select();
          return;
        }

        sessionStorage.setItem("rj-cartas-abertas", "sim");
        sessionStorage.setItem("rj-perfil", perfil);
        aplicarPerfil(perfil);
        document.dispatchEvent(new CustomEvent("rj-acesso-alterado", { detail: { perfil } }));
        modal.classList.add("senha-cartas--saindo");
        window.setTimeout(function () {
          modal.classList.remove("senha-cartas--saindo");
          fecharModal();
          mostrarArea();
        }, 360);
      } catch (_) {
        aviso.textContent = "Não foi possível verificar agora. Tente novamente.";
      }
    });

    bloquear?.addEventListener("click", function () {
      sessionStorage.removeItem("rj-cartas-abertas");
      sessionStorage.removeItem("rj-perfil");
      document.body.classList.remove("acesso-visitante");
      area.hidden = true;
      document.getElementById("inicio")?.scrollIntoView({ behavior: "smooth" });
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && !modal.hidden) fecharModal();
    });
  }

  function iniciarSite() {
    iniciarAreaCartas();
    try {
      iniciarDataEspecial();
    } catch (erro) {
      console.error("Erro no aviso de datas especiais:", erro);
    }
    try {
      atualizarContadores();

      window.setInterval(
        atualizarContadores,
        1000
      );
    } catch (erro) {
      console.error(
        "Erro nos contadores:",
        erro
      );
    }

    try {
      window.setInterval(
        criarCoracaoFlutuante,
        1600
      );
    } catch (erro) {
      console.error(
        "Erro nos corações:",
        erro
      );
    }

    carregarCapitulos();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      iniciarSite,
      { once: true }
    );
  } else {
    iniciarSite();
  }
})();
