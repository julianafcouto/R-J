"use strict";

(function () {
  const TIPOS_PUZZLE = new Set([
    "cofre",
    "termo",
    "conexo",
    "memoria",
    "puzzle",
    "telescopio"
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

  function criarComponente(dados) {
    const tipo =
      normalizar(dados?.tipo);

    try {
      switch (tipo) {
        case "carta":
          return criarCarta(dados);

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

        case "telescopio":
          return criarTelescopio(dados);

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
        ? dados.componentes
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

      capitulos.forEach(function (dados, indice) {
        try {
          container.appendChild(
            criarCapitulo(dados)
          );
        } catch (erro) {
          console.error(
            `Erro no capítulo ${indice}:`,
            erro
          );

          container.appendChild(
            criarElementoErro(
              `Não foi possível mostrar o capítulo ${
                dados?.titulo || indice + 1
              }.`
            )
          );
        }
      });
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

      anotacoes.forEach(function (anotacao) {
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

        guardados.appendChild(cartao);
      });
    }

    async function carregarPublicacoes() {
      try {
        const resposta = await fetch(
          `${SUPABASE_URL}/rest/v1/publicacoes_rayane?select=*&order=criada_em.desc`,
          opcoesRequisicao({ cache: "no-store" })
        );

        if (!resposta.ok) throw new Error("leitura");
        mostrar(await resposta.json());
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

  function iniciarSite() {
    iniciarCantinho();
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
