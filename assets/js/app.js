"use strict";

(function () {
  const TIPOS_PUZZLE = new Set([
    "cofre",
    "termo",
    "conexo",
    "memoria",
    "puzzle",
    "sorvete",
    "telescopio",
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
   * Música
   */

  function criarMusica(dados) {
    const elemento =
      document.createElement("article");

    const bloqueada =
      dados.bloqueada === true;

    const link =
      dados.link ||
      dados.spotify ||
      "#";

    elemento.className = bloqueada
      ? "componente musica musica--bloqueada"
      : "componente musica";

    elemento.innerHTML = `
      <div class="musica__bloqueio">
        <span class="musica__cadeado">♡</span>

        <strong>Música guardada</strong>

        <p>
          Resolva o desafio anterior para revelar
          esta parte da história.
        </p>
      </div>

      <div class="musica__interior">
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
            ${escaparHTML(dados.titulo || "Música")}
          </h3>

          <p class="musica__artista">
            ${escaparHTML(dados.artista || "")}
          </p>

          <p class="musica__mensagem">
            ${escaparHTML(dados.mensagem || "")}
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

  /*
   * Seleção de componentes
   */

  function criarMapa(dados) {
    const elemento = document.createElement("article");
    const chave = `rj-mapa-${dados.id || "destinos"}`;
    const chaveCodigo = "rayane-cantinho-codigo-v1";
    const prefixoMapa = "__MAPA_RJ__";
    const SUPABASE_URL = "https://mmipkjzdnnrgovvlihlp.supabase.co";
    const SUPABASE_KEY = "sb_publishable_vokCdlS5rBIiogRyIy0WPA_D5xTADIN";
    let pontos = [];
    let posicaoNova = { lat: -15, lng: -48 };
    try { pontos = JSON.parse(localStorage.getItem(chave) || "[]"); if (!Array.isArray(pontos)) pontos = []; }
    catch (_) { pontos = []; }

    pontos = pontos.map(function (ponto) {
      if (Number.isFinite(ponto.lat) && Number.isFinite(ponto.lng)) return ponto;
      return { ...ponto, lat: 85 - (Number(ponto.y) || 50) * 1.7, lng: (Number(ponto.x) || 50) * 3.6 - 180 };
    });

    elemento.className = "componente puzzle mapa-afetivo";
    elemento.innerHTML = `
      <span class="componente__etiqueta">Nosso mapa do futuro</span>
      <h3>${escaparHTML(dados.titulo || "Lugares onde ainda seremos nós")}</h3>
      <p class="puzzle__descricao">${escaparHTML(dados.descricao || "Toque no mapa e guarde um destino, uma imagem e um sonho.")}</p>
      <div class="mapa-afetivo__barra"><span>Arraste para passear pelo mundo e toque nos corações para ler.</span><button type="button" class="botao mapa-afetivo__adicionar" data-adicionar>♡ Marcar lugar</button></div>
      <div class="mapa-afetivo__quadro mapa-afetivo__quadro--real" data-mapa aria-label="Mapa-múndi interativo"></div>
      <form class="mapa-afetivo__formulario" data-form hidden>
        <div class="mapa-afetivo__form-cabecalho"><strong>Novo destino</strong><button type="button" class="mapa-afetivo__fechar" data-fechar aria-label="Fechar">×</button></div>
        <label>Que lugar é esse?<input type="text" name="lugar" maxlength="80" placeholder="Ex.: ver o pôr do sol em Paraty" required></label>
        <label>O que você quer viver lá?<textarea name="observacao" rows="3" maxlength="500" placeholder="Uma ideia, promessa ou detalhe para lembrar..."></textarea></label>
        <label class="mapa-afetivo__foto">Uma imagem para esse sonho <span>(opcional)</span><input type="file" name="imagem" accept="image/*"></label>
        <label>Código de acesso<input type="password" name="codigo" autocomplete="current-password" placeholder="O mesmo código do Cantinho" required></label>
        <button class="botao" type="submit">Guardar no mapa ♡</button><p class="puzzle__feedback" data-feedback aria-live="polite"></p>
      </form><div class="mapa-afetivo__lugares" data-lugares></div>`;

    const mapa = elemento.querySelector("[data-mapa]");
    const formulario = elemento.querySelector("[data-form]");
    const lugares = elemento.querySelector("[data-lugares]");
    const feedback = elemento.querySelector("[data-feedback]");
    let modoAdicionar = false;
    let mapaReal = null;
    let camadaPontos = null;
    formulario.elements.codigo.value = localStorage.getItem(chaveCodigo) || "";

    function opcoesRequisicao(extras) {
      return { ...extras, headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", ...(extras?.headers || {}) } };
    }

    async function enviarPonto(ponto, codigo) {
      const dadosPonto = { id: ponto.id, lugar: ponto.lugar, observacao: ponto.observacao, imagem: ponto.imagem, lat: ponto.lat, lng: ponto.lng };
      const resposta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/criar_publicacao_rayane`, opcoesRequisicao({ method: "POST", body: JSON.stringify({ p_id: ponto.id, p_texto: prefixoMapa + JSON.stringify(dadosPonto), p_data: null, p_link: null, p_codigo: codigo }) }));
      if (!resposta.ok) { const detalhe = await resposta.text(); throw new Error(detalhe.includes("codigo_incorreto") ? "codigo" : "envio"); }
      ponto.online = true;
    }

    async function apagarPontoOnline(ponto, codigo) {
      if (!ponto.online) return;
      const resposta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/apagar_publicacao_rayane`, opcoesRequisicao({ method: "POST", body: JSON.stringify({ p_id: ponto.id, p_codigo: codigo }) }));
      if (!resposta.ok) { const detalhe = await resposta.text(); throw new Error(detalhe.includes("codigo_incorreto") ? "codigo" : "exclusao"); }
    }

    async function carregarPontosOnline() {
      try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/publicacoes_rayane?select=id,texto&order=criada_em.asc`, opcoesRequisicao({ cache: "no-store" }));
        if (!resposta.ok) throw new Error("leitura");
        const remotos = (await resposta.json()).filter(function (item) { return String(item.texto || "").startsWith(prefixoMapa); }).map(function (item) {
          try { return { ...JSON.parse(item.texto.slice(prefixoMapa.length)), id: item.id, online: true }; } catch (_) { return null; }
        }).filter(Boolean);
        const porId = new Map(pontos.map(function (ponto) { return [ponto.id, ponto]; }));
        remotos.forEach(function (ponto) { porId.set(ponto.id, ponto); });
        pontos = [...porId.values()]; salvar(); desenhar();
        if (pontos.length > 0) concluirPuzzle(elemento);
      } catch (_) {
        feedback.textContent = "Sem conexão. Mostrando os lugares salvos neste aparelho.";
      }
    }

    function salvar() {
      try { localStorage.setItem(chave, JSON.stringify(pontos)); return true; }
      catch (_) { feedback.textContent = "A imagem ficou grande demais para guardar. Tente uma foto menor."; feedback.className = "puzzle__feedback puzzle__feedback--erro"; return false; }
    }
    function desenhar() {
      lugares.innerHTML = "";
      if (camadaPontos) camadaPontos.clearLayers();
      pontos.forEach(function (ponto) {
        if (camadaPontos) {
          const icone = L.divIcon({ className: "mapa-afetivo__icone", html: `<span><b>♡</b></span>`, iconSize: [46, 52], iconAnchor: [23, 50], popupAnchor: [0, -46] });
          const conteudo = `<div class="mapa-afetivo__popup">${ponto.imagem ? `<img src="${ponto.imagem}" alt="Imagem escolhida para ${escaparHTML(ponto.lugar)}">` : ""}<span>Um lugar para nós</span><h4>${escaparHTML(ponto.lugar)}</h4><p>${escaparHTML(ponto.observacao || "Um sonho guardado no nosso mapa.")}</p><button type="button" class="mapa-afetivo__popup-remover" data-remover-ponto="${escaparHTML(ponto.id)}">Apagar destino</button></div>`;
          L.marker([ponto.lat, ponto.lng], { icon: icone, title: ponto.lugar }).bindPopup(conteudo, { maxWidth: 310 }).addTo(camadaPontos);
        }
      });
    }

    mapa.addEventListener("click", async function (evento) {
      const botaoRemover = evento.target.closest("[data-remover-ponto]");
      if (!botaoRemover) return;

      const ponto = pontos.find(function (item) { return item.id === botaoRemover.dataset.removerPonto; });
      if (!ponto || !window.confirm(`Quer mesmo apagar ${ponto.lugar} do mapa de vocês?`)) return;

      const codigoSalvo = localStorage.getItem(chaveCodigo) || formulario.elements.codigo.value.trim();
      const codigo = codigoSalvo || window.prompt("Digite o código de acesso para apagar este destino:")?.trim();
      if (!codigo) return;

      botaoRemover.disabled = true;
      try {
        await apagarPontoOnline(ponto, codigo);
        localStorage.setItem(chaveCodigo, codigo);
        pontos = pontos.filter(function (item) { return item.id !== ponto.id; });
        salvar();
        desenhar();
        feedback.textContent = "Lugar apagado do mapa compartilhado.";
        feedback.className = "puzzle__feedback puzzle__feedback--certo";
      } catch (erro) {
        feedback.textContent = erro.message === "codigo" ? "Código de acesso incorreto." : "Não foi possível apagar. Confira a conexão.";
        feedback.className = "puzzle__feedback puzzle__feedback--erro";
        botaoRemover.disabled = false;
      }
    });
    function abrirFormulario(lat, lng) { posicaoNova = { lat, lng }; formulario.hidden = false; formulario.scrollIntoView({ behavior: "smooth", block: "nearest" }); formulario.querySelector("input[name='lugar']").focus(); }
    elemento.querySelector("[data-adicionar]").addEventListener("click", function () {
      modoAdicionar = true; mapa.classList.add("mapa-afetivo__quadro--marcando");
      this.textContent = "Agora toque no mapa ♡";
    });
    elemento.querySelector("[data-fechar]").addEventListener("click", function () { formulario.hidden = true; formulario.reset(); });
    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();
      const lugar = formulario.elements.lugar.value.trim(); const observacao = formulario.elements.observacao.value.trim(); const arquivo = formulario.elements.imagem.files[0]; const codigo = formulario.elements.codigo.value.trim();
      async function guardar(imagem) {
        const pontoNovo = { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`, lugar, observacao, imagem: imagem || "", lat: posicaoNova.lat, lng: posicaoNova.lng };
        pontos.push(pontoNovo);
        if (!salvar()) { pontos.pop(); return; }
        try {
          for (const ponto of pontos.filter(function (item) { return !item.online; })) await enviarPonto(ponto, codigo);
          localStorage.setItem(chaveCodigo, codigo); salvar();
          formulario.reset(); formulario.elements.codigo.value = codigo; formulario.hidden = true;
          elemento.querySelector("[data-adicionar]").textContent = "♡ Marcar lugar"; desenhar(); concluirPuzzle(elemento);
          feedback.textContent = "Guardado no mapa de vocês. ♡"; feedback.className = "puzzle__feedback puzzle__feedback--certo";
        } catch (erro) {
          feedback.textContent = erro.message === "codigo" ? "Código de acesso incorreto." : "O lugar ficou salvo neste aparelho, mas ainda não foi sincronizado.";
          feedback.className = "puzzle__feedback puzzle__feedback--erro";
        }
      }
      if (!arquivo) { guardar(""); return; }
      if (arquivo.size > 1500000) { feedback.textContent = "Escolha uma imagem de até 1,5 MB."; feedback.className = "puzzle__feedback puzzle__feedback--erro"; return; }
      const leitor = new FileReader(); leitor.onload = function () { guardar(leitor.result); }; leitor.readAsDataURL(arquivo);
    });
    if (window.L) {
      mapaReal = L.map(mapa, { worldCopyJump: true, minZoom: 2 }).setView([-15, -48], 2);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>" }).addTo(mapaReal);
      camadaPontos = L.layerGroup().addTo(mapaReal);
      mapaReal.on("click", function (evento) {
        if (!modoAdicionar) return;
        modoAdicionar = false; mapa.classList.remove("mapa-afetivo__quadro--marcando");
        abrirFormulario(evento.latlng.lat, evento.latlng.lng);
      });
      window.setTimeout(function () { mapaReal.invalidateSize(); }, 250);
      if (window.ResizeObserver) {
        const observadorMapa = new ResizeObserver(function () {
          if (mapa.offsetWidth > 0) mapaReal.invalidateSize();
        });
        observadorMapa.observe(mapa);
      }
    } else {
      mapa.innerHTML = `<p class="mapa-afetivo__erro">O mapa não conseguiu carregar. Verifique sua conexão e tente novamente.</p>`;
    }
    salvar(); desenhar(); carregarPontosOnline(); if (pontos.length > 0) window.setTimeout(function () { concluirPuzzle(elemento); }, 0);
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

        case "memoria":
          return criarMemoria(dados);

        case "puzzle":
          return criarPuzzleFrase(dados);

        case "sorvete":
          return criarPuzzleSorvete(dados);

        case "telescopio":
          return criarTelescopio(dados);

        case "mapa":
          return criarMapa(dados);

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

    componentes.forEach(function (
      componente,
      indice
    ) {
      try {
        const tipo =
          normalizar(componente?.tipo);

        const elemento =
          criarComponente(componente);

        if (TIPOS_PUZZLE.has(tipo)) {
          numeroPuzzle += 1;

          puzzlePendente =
            `${dados.id || "capitulo"}-puzzle-${numeroPuzzle}`;

          elemento.dataset.chaveDesbloqueio =
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

  function iniciarCantinho() {
    const SUPABASE_URL = "https://mmipkjzdnnrgovvlihlp.supabase.co";
    const SUPABASE_KEY = "sb_publishable_vokCdlS5rBIiogRyIy0WPA_D5xTADIN";
    const texto = document.getElementById("cantinho-texto");
    const dataEscolhida = document.getElementById("cantinho-data");
    const link = document.getElementById("cantinho-link");
    const codigo = document.getElementById("cantinho-codigo");
    const guardar = document.getElementById("cantinho-guardar");
    const contador = document.getElementById("cantinho-contador");
    const aviso = document.getElementById("cantinho-aviso");
    const guardados = document.getElementById("cantinho-guardados");
    const chaveLocal = "rayane-cantinho-v1";
    const chaveCodigo = "rayane-cantinho-codigo-v1";

    if (!texto || !dataEscolhida || !link || !codigo || !guardar || !contador || !aviso || !guardados) return;

    dataEscolhida.value = new Date().toLocaleDateString("en-CA");
    codigo.value = localStorage.getItem(chaveCodigo) || "";

    function opcoesRequisicao(extras) {
      return {
        ...extras,
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          ...(extras?.headers || {})
        }
      };
    }

    function prepararLink(valor) {
      if (!valor) return "";

      try {
        const completo = /^https?:\/\//i.test(valor) ? valor : `https://${valor}`;
        const endereco = new URL(completo);
        return ["http:", "https:"].includes(endereco.protocol) ? endereco.href : "";
      } catch (erro) {
        return "";
      }
    }

    function lerLocais() {
      try {
        const valor = JSON.parse(localStorage.getItem(chaveLocal) || "[]");
        return Array.isArray(valor) ? valor : [];
      } catch (erro) {
        return [];
      }
    }

    async function enviar(anotacao, codigoAcesso) {
      const resposta = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/criar_publicacao_rayane`,
        opcoesRequisicao({
          method: "POST",
          body: JSON.stringify({
            p_id: anotacao.id,
            p_texto: anotacao.texto,
            p_data: anotacao.data || null,
            p_link: anotacao.link || null,
            p_codigo: codigoAcesso
          })
        })
      );

      if (!resposta.ok) {
        const detalhe = await resposta.text();
        throw new Error(detalhe.includes("codigo_incorreto") ? "codigo" : "envio");
      }
    }

    async function migrarLocais(codigoAcesso) {
      const locais = lerLocais();
      if (!locais.length) return;

      for (const anotacao of locais) {
        await enviar(anotacao, codigoAcesso);
      }

      localStorage.removeItem(chaveLocal);
    }

    function mostrar(anotacoes) {
      guardados.innerHTML = "";

      if (!anotacoes.length) {
        guardados.innerHTML = '<p class="cantinho__vazio">As coisas que você guardar vão aparecer aqui. ♡</p>';
        return;
      }

      const nomesMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      const grupos = new Map();

      function dataDaAnotacao(anotacao) {
        if (anotacao.data) {
          const partes = anotacao.data.split("-").map(Number);
          return new Date(partes[0], partes[1] - 1, partes[2]);
        }

        return new Date(anotacao.criada_em || anotacao.criadaEm || Date.now());
      }

      function obterGrupo(anotacao) {
        const dataReferencia = dataDaAnotacao(anotacao);
        const ano = dataReferencia.getFullYear();
        const mes = dataReferencia.getMonth();
        const chave = `${ano}-${String(mes + 1).padStart(2, "0")}`;

        if (grupos.has(chave)) return grupos.get(chave);

        const grupo = document.createElement("section");
        const lista = document.createElement("div");
        const titulo = `${nomesMeses[mes]} de ${ano}`;
        const id = `cantinho-${chave}`;

        grupo.className = "cantinho-mes";
        grupo.innerHTML = `<button type="button" class="cantinho-mes__botao" aria-expanded="false" aria-controls="${id}"><span class="cantinho-mes__titulo"><span class="cantinho-mes__icone">♡</span><span><strong>${escaparHTML(titulo)}</strong></span></span><span class="cantinho-mes__meta"><small data-total>0 publicações</small><i aria-hidden="true"></i></span></button>`;
        lista.className = "cantinho-mes__publicacoes";
        lista.id = id;
        lista.hidden = true;
        grupo.appendChild(lista);

        const botao = grupo.querySelector(".cantinho-mes__botao");
        botao.addEventListener("click", function () {
          const abrir = botao.getAttribute("aria-expanded") !== "true";
          botao.setAttribute("aria-expanded", String(abrir));
          grupo.classList.toggle("cantinho-mes--aberto", abrir);
          lista.hidden = !abrir;
        });

        const dadosGrupo = { grupo, lista, total: 0 };
        grupos.set(chave, dadosGrupo);
        guardados.appendChild(grupo);
        return dadosGrupo;
      }

      anotacoes.forEach(function (anotacao) {
        const grupo = obterGrupo(anotacao);
        const cartao = document.createElement("article");
        const cabecalho = document.createElement("div");
        const data = document.createElement("time");
        const excluir = document.createElement("button");
        const conteudo = document.createElement("p");

        cartao.className = "cantinho__anotacao";
        cabecalho.className = "cantinho__anotacao-cabecalho";
        if (anotacao.data) {
          const partes = anotacao.data.split("-").map(Number);
          const dataLocal = new Date(partes[0], partes[1] - 1, partes[2]);
          data.dateTime = anotacao.data;
          data.textContent = new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "long"
          }).format(dataLocal);
        } else {
          const criadaEm = anotacao.criada_em || anotacao.criadaEm;
          data.dateTime = criadaEm;
          data.textContent = new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "long",
            timeStyle: "short"
          }).format(new Date(criadaEm));
        }
        excluir.type = "button";
        excluir.className = "cantinho__excluir";
        excluir.textContent = "Apagar";
        excluir.setAttribute("aria-label", "Apagar esta mensagem");
        conteudo.textContent = anotacao.texto;

        excluir.addEventListener("click", async function () {
          if (!window.confirm("Quer mesmo apagar esta mensagem?")) return;

          const codigoAcesso = codigo.value.trim();
          if (!codigoAcesso) {
            aviso.textContent = "Digite o código de acesso para apagar.";
            codigo.focus();
            return;
          }

          excluir.disabled = true;
          try {
            const resposta = await fetch(
              `${SUPABASE_URL}/rest/v1/rpc/apagar_publicacao_rayane`,
              opcoesRequisicao({
                method: "POST",
                body: JSON.stringify({
                  p_id: anotacao.id,
                  p_codigo: codigoAcesso
                })
              })
            );

            if (!resposta.ok) {
              const detalhe = await resposta.text();
              throw new Error(detalhe.includes("codigo_incorreto") ? "codigo" : "exclusao");
            }

            localStorage.setItem(chaveCodigo, codigoAcesso);
            aviso.textContent = "Publicação apagada.";
            await carregarPublicacoes();
          } catch (erro) {
            aviso.textContent = erro.message === "codigo"
              ? "Código de acesso incorreto."
              : "Não foi possível apagar. Confira sua conexão.";
            excluir.disabled = false;
          }
        });

        cabecalho.append(data, excluir);
        cartao.append(cabecalho, conteudo);

        if (anotacao.link) {
          const acesso = document.createElement("a");
          acesso.className = "cantinho__link";
          acesso.href = anotacao.link;
          acesso.target = "_blank";
          acesso.rel = "noopener noreferrer";
          acesso.textContent = "Abrir link ↗";
          cartao.appendChild(acesso);
        }

        grupo.lista.appendChild(cartao);
        grupo.total += 1;
        grupo.grupo.querySelector("[data-total]").textContent =
          `${grupo.total} ${grupo.total === 1 ? "publicação" : "publicações"}`;
      });
    }

    async function carregarPublicacoes() {
      try {
        const resposta = await fetch(
          `${SUPABASE_URL}/rest/v1/publicacoes_rayane?select=*&order=criada_em.desc`,
          opcoesRequisicao({ cache: "no-store" })
        );

        if (!resposta.ok) throw new Error("leitura");
        const publicacoes = await resposta.json();
        mostrar(publicacoes.filter(function (item) {
          const conteudo = String(item.texto || "");
          return !conteudo.startsWith("__MAPA_RJ__") && !conteudo.startsWith("__FEED_RJ__");
        }));
      } catch (erro) {
        const locais = lerLocais().slice().reverse();
        mostrar(locais);
        aviso.textContent = "Sem conexão. Mostrando o que estava salvo neste aparelho.";
      }
    }

    texto.addEventListener("input", function () {
      contador.textContent = `${texto.value.length} de 16000000`;
      aviso.textContent = "";
    });

    guardar.addEventListener("click", async function () {
      const valor = texto.value.trim();
      const linkDigitado = link.value.trim();
      const linkPreparado = prepararLink(linkDigitado);
      const codigoAcesso = codigo.value.trim();

      if (!valor) {
        aviso.textContent = "Escreva alguma coisinha antes de guardar.";
        texto.focus();
        return;
      }

      if (linkDigitado && !linkPreparado) {
        aviso.textContent = "Confira o link antes de guardar.";
        link.focus();
        return;
      }

      if (!codigoAcesso) {
        aviso.textContent = "Digite o código de acesso para publicar.";
        codigo.focus();
        return;
      }

      guardar.disabled = true;
      try {
        await migrarLocais(codigoAcesso);
        await enviar({
          id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
          texto: valor,
          data: dataEscolhida.value,
          link: linkPreparado
        }, codigoAcesso);

        localStorage.setItem(chaveCodigo, codigoAcesso);
        texto.value = "";
        link.value = "";
        dataEscolhida.value = new Date().toLocaleDateString("en-CA");
        contador.textContent = "0 de 16000000";
        aviso.textContent = "Guardado com carinho. ♡";
        await carregarPublicacoes();
      } catch (erro) {
        aviso.textContent = erro.message === "codigo"
          ? "Código de acesso incorreto."
          : "Não foi possível publicar. Confira sua conexão.";
      } finally {
        guardar.disabled = false;
      }
    });

    carregarPublicacoes();
  }

  function iniciarMomentos() {
    const SUPABASE_URL = "https://mmipkjzdnnrgovvlihlp.supabase.co";
    const SUPABASE_KEY = "sb_publishable_vokCdlS5rBIiogRyIy0WPA_D5xTADIN";
    const PREFIXO = "__FEED_RJ__";
    const formulario = document.getElementById("momentos-form");
    const fotos = document.getElementById("momentos-fotos");
    const previas = document.getElementById("momentos-previas");
    const descricao = document.getElementById("momentos-descricao");
    const data = document.getElementById("momentos-data");
    const autora = document.getElementById("momentos-autora");
    const codigo = document.getElementById("momentos-codigo");
    const aviso = document.getElementById("momentos-aviso");
    const feed = document.getElementById("momentos-feed");

    if (!formulario || !fotos || !previas || !descricao || !data || !autora || !codigo || !aviso || !feed) return;

    data.value = new Date().toLocaleDateString("en-CA");
    codigo.value = localStorage.getItem("rayane-cantinho-codigo-v1") || "";

    function opcoesRequisicao(extras) {
      return {
        ...extras,
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          ...(extras?.headers || {})
        }
      };
    }

    function comprimirImagem(arquivo, quantidade) {
      return new Promise(function (resolve, reject) {
        const leitor = new FileReader();
        leitor.onerror = reject;
        leitor.onload = function () {
          const imagem = new Image();
          imagem.onerror = reject;
          imagem.onload = function () {
            const limite = quantidade > 20 ? 720 : quantidade > 10 ? 900 : 1200;
            const qualidade = quantidade > 20 ? 0.62 : quantidade > 10 ? 0.68 : 0.76;
            const escala = Math.min(1, limite / Math.max(imagem.width, imagem.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(imagem.width * escala));
            canvas.height = Math.max(1, Math.round(imagem.height * escala));
            canvas.getContext("2d").drawImage(imagem, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", qualidade));
          };
          imagem.src = leitor.result;
        };
        leitor.readAsDataURL(arquivo);
      });
    }

    function mostrarPrevias() {
      const arquivos = Array.from(fotos.files || []).slice(0, 50);
      previas.innerHTML = "";
      previas.hidden = arquivos.length === 0;
      arquivos.forEach(function (arquivo) {
        const imagem = document.createElement("img");
        imagem.alt = "Prévia da foto escolhida";
        imagem.src = URL.createObjectURL(arquivo);
        imagem.onload = function () { URL.revokeObjectURL(imagem.src); };
        previas.appendChild(imagem);
      });
      if ((fotos.files?.length || 0) > 50) aviso.textContent = "Serão usadas as primeiras 50 fotos.";
    }

    function criarCarrossel(imagens, titulo) {
      const carrossel = document.createElement("div");
      carrossel.className = "momento__carrossel";
      carrossel.innerHTML = `<div class="momento__trilha"></div>${imagens.length > 1 ? `<button type="button" class="momento__seta momento__seta--anterior" aria-label="Foto anterior">‹</button><button type="button" class="momento__seta momento__seta--proxima" aria-label="Próxima foto">›</button><span class="momento__indicador">1 / ${imagens.length}</span>` : ""}`;
      const trilha = carrossel.querySelector(".momento__trilha");
      imagens.forEach(function (origem, indice) {
        const imagem = document.createElement("img");
        imagem.src = origem;
        imagem.alt = `${titulo}, foto ${indice + 1} de ${imagens.length}`;
        imagem.loading = "lazy";
        trilha.appendChild(imagem);
      });

      if (imagens.length > 1) {
        let atual = 0;
        const indicador = carrossel.querySelector(".momento__indicador");
        function irPara(indice) {
          atual = (indice + imagens.length) % imagens.length;
          trilha.scrollTo({ left: trilha.clientWidth * atual, behavior: "smooth" });
          indicador.textContent = `${atual + 1} / ${imagens.length}`;
        }
        carrossel.querySelector(".momento__seta--anterior").addEventListener("click", function () { irPara(atual - 1); });
        carrossel.querySelector(".momento__seta--proxima").addEventListener("click", function () { irPara(atual + 1); });
        trilha.addEventListener("scrollend", function () {
          atual = Math.round(trilha.scrollLeft / Math.max(1, trilha.clientWidth));
          indicador.textContent = `${atual + 1} / ${imagens.length}`;
        });
      }
      return carrossel;
    }

    function desenhar(momentos) {
      feed.innerHTML = "";
      if (!momentos.length) {
        feed.innerHTML = '<div class="momentos__vazio"><span>◎</span><h3>O primeiro momento começa aqui</h3><p>Escolham algumas fotos e contem um pedacinho do dia.</p></div>';
        return;
      }

      momentos.forEach(function (item) {
        const cartao = document.createElement("article");
        const dados = item.dados;
        const dataPartes = String(dados.data || "").split("-").map(Number);
        const dataLocal = dataPartes.length === 3 ? new Date(dataPartes[0], dataPartes[1] - 1, dataPartes[2]) : new Date(item.criada_em);
        cartao.className = "momento";
        cartao.appendChild(criarCarrossel(dados.imagens || [], dados.descricao || "Nosso momento"));
        const corpo = document.createElement("div");
        corpo.className = "momento__corpo";
        const classeAutora = normalizar(dados.autora) === "juliana" ? "juliana" : normalizar(dados.autora) === "rayane" ? "rayane" : "nos";
        corpo.innerHTML = `<div class="momento__meta"><span class="momento__autora momento__autora--${classeAutora}">Por ${escaparHTML(dados.autora || "Nós")}</span><time datetime="${escaparHTML(dados.data || "")}">${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(dataLocal)}</time></div><p>${escaparHTML(dados.descricao || "")}</p><button type="button" class="momento__apagar">Apagar</button>`;
        corpo.querySelector(".momento__apagar").addEventListener("click", async function () {
          if (!window.confirm("Quer mesmo apagar este momento?")) return;
          const senha = codigo.value.trim() || window.prompt("Digite a senha para apagar:")?.trim();
          if (!senha) return;
          try {
            const resposta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/apagar_publicacao_rayane`, opcoesRequisicao({ method: "POST", body: JSON.stringify({ p_id: item.id, p_codigo: senha }) }));
            if (!resposta.ok) { const detalhe = await resposta.text(); throw new Error(detalhe.includes("codigo_incorreto") ? "codigo" : "exclusao"); }
            await carregar();
          } catch (erro) {
            aviso.textContent = erro.message === "codigo" ? "Senha incorreta." : "Não foi possível apagar agora.";
          }
        });
        cartao.appendChild(corpo);
        feed.appendChild(cartao);
      });
    }

    async function carregar() {
      try {
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/publicacoes_rayane?select=id,texto,criada_em&order=criada_em.desc`, opcoesRequisicao({ cache: "no-store" }));
        if (!resposta.ok) throw new Error("leitura");
        const itens = (await resposta.json()).filter(function (item) { return String(item.texto || "").startsWith(PREFIXO); }).map(function (item) {
          try { return { ...item, dados: JSON.parse(item.texto.slice(PREFIXO.length)) }; } catch (_) { return null; }
        }).filter(Boolean);
        desenhar(itens);
      } catch (_) {
        feed.innerHTML = '<p class="cantinho__vazio">Não foi possível carregar os momentos agora.</p>';
      }
    }

    fotos.addEventListener("change", mostrarPrevias);

    formulario.addEventListener("submit", async function (evento) {
      evento.preventDefault();
      const arquivos = Array.from(fotos.files || []).slice(0, 50);
      const senha = codigo.value.trim();
      if (!arquivos.length || !descricao.value.trim() || !senha) return;

      const botao = formulario.querySelector("button[type='submit']");
      botao.disabled = true;
      aviso.textContent = "Preparando as fotos...";
      try {
        const imagens = [];
        for (const arquivo of arquivos) {
          aviso.textContent = `Preparando foto ${imagens.length + 1} de ${arquivos.length}...`;
          imagens.push(await comprimirImagem(arquivo, arquivos.length));
        }
        const payload = { imagens, descricao: descricao.value.trim(), data: data.value, autora: autora.value };
        aviso.textContent = "Publicando o momento...";
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/criar_publicacao_rayane`, opcoesRequisicao({ method: "POST", body: JSON.stringify({ p_id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, p_texto: PREFIXO + JSON.stringify(payload), p_data: data.value || null, p_link: null, p_codigo: senha }) }));
        if (!resposta.ok) { const detalhe = await resposta.text(); throw new Error(detalhe.includes("codigo_incorreto") ? "codigo" : "envio"); }
        localStorage.setItem("rayane-cantinho-codigo-v1", senha);
        formulario.reset();
        data.value = new Date().toLocaleDateString("en-CA");
        codigo.value = senha;
        previas.hidden = true;
        previas.innerHTML = "";
        aviso.textContent = "Momento publicado. ♡";
        await carregar();
      } catch (erro) {
        aviso.textContent = erro.message === "codigo" ? "Senha incorreta." : "As fotos ficaram grandes demais ou houve uma falha na conexão. Tente menos fotos.";
      } finally {
        botao.disabled = false;
      }
    });

    carregar();
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
    const escolhas = document.querySelectorAll("[data-painel-cartas]");
    const paineis = document.querySelectorAll(".area-cartas__painel");

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
      if (visitante) {
        const painelMomentos = document.getElementById("momentos");
        if (painelMomentos) painelMomentos.hidden = true;
      }
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

        if (perfil === "proprietaria") {
          const codigoPostagem = document.getElementById("cantinho-codigo");
          if (codigoPostagem) codigoPostagem.value = entrada.value.trim();
          const codigoMomentos = document.getElementById("momentos-codigo");
          if (codigoMomentos) codigoMomentos.value = entrada.value.trim();
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

    escolhas.forEach(function (escolha) {
      escolha.addEventListener("click", function () {
        const idPainel = escolha.dataset.painelCartas;
        if (idPainel === "momentos" && sessionStorage.getItem("rj-perfil") === "visitante") return;
        paineis.forEach(function (painel) { painel.hidden = painel.id !== idPainel; });
        escolhas.forEach(function (item) { item.classList.toggle("carta-acesso--ativo", item === escolha); });
        document.getElementById(idPainel)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    bloquear?.addEventListener("click", function () {
      sessionStorage.removeItem("rj-cartas-abertas");
      sessionStorage.removeItem("rj-perfil");
      document.body.classList.remove("acesso-visitante");
      area.hidden = true;
      paineis.forEach(function (painel) { painel.hidden = true; });
      escolhas.forEach(function (item) { item.classList.remove("carta-acesso--ativo"); });
      document.getElementById("inicio")?.scrollIntoView({ behavior: "smooth" });
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && !modal.hidden) fecharModal();
    });
  }

  function iniciarSite() {
    iniciarAreaCartas();
    iniciarCantinho();
    let momentosIniciados = false;
    function iniciarMomentosDaProprietaria() {
      if (momentosIniciados) return;
      momentosIniciados = true;
      iniciarMomentos();
    }
    const perfilSalvo = sessionStorage.getItem("rj-perfil");
    if (sessionStorage.getItem("rj-cartas-abertas") === "sim" && perfilSalvo !== "visitante") {
      iniciarMomentosDaProprietaria();
    }
    document.addEventListener("rj-acesso-alterado", function (evento) {
      if (evento.detail?.perfil === "proprietaria") iniciarMomentosDaProprietaria();
    });
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
