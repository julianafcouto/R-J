"use strict";

(function () {
  const DATA_INICIO =
    new Date("2026-06-16T00:00:00");

  const TIPOS_PUZZLE = new Set([
    "cofre",
    "termo",
    "conexo",
    "memoria"
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

    const diferenca = Math.max(
      0,
      agora.getTime() - DATA_INICIO.getTime()
    );

    const dias = Math.floor(
      diferenca / 86400000
    );

    const horas = Math.floor(
      diferenca / 3600000
    );

    const minutos = Math.floor(
      diferenca / 60000
    );

    const elementoDias =
      document.getElementById("contador-dias");

    const elementoHoras =
      document.getElementById("contador-horas");

    const elementoMinutos =
      document.getElementById("contador-minutos");

    if (elementoDias) {
      elementoDias.textContent =
        dias.toLocaleString("pt-BR");
    }

    if (elementoHoras) {
      elementoHoras.textContent =
        horas.toLocaleString("pt-BR");
    }

    if (elementoMinutos) {
      elementoMinutos.textContent =
        minutos.toLocaleString("pt-BR");
    }
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

        case "conexo":
          return criarConexo(dados);

        case "memoria":
          return criarMemoria(dados);

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
        <time
          class="capitulo__data"
          datetime="${escaparHTML(
            dados.id || ""
          )}"
        >
          ${escaparHTML(dados.data || "")}
        </time>

        <h2 class="capitulo__titulo">
          ${escaparHTML(
            dados.titulo || "Capítulo"
          )}
        </h2>

        ${
          dados.subtitulo || dados.descricao
            ? `
              <p class="capitulo__subtitulo">
                ${escaparHTML(
                  dados.subtitulo ||
                  dados.descricao
                )}
              </p>
            `
            : ""
        }
      </header>

      <div class="capitulo__componentes"></div>
    `;

    const container =
      capitulo.querySelector(
        ".capitulo__componentes"
      );

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

  function iniciarSite() {
    try {
      atualizarContadores();

      window.setInterval(
        atualizarContadores,
        60000
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