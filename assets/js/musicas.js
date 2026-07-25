document.addEventListener("DOMContentLoaded", carregarMusicas);

async function carregarMusicas() {

    const lista = document.getElementById("listaMusicas");

    try {

        console.log("Iniciando...");

        const resposta = await fetch("../data/musicas.json");

        console.log("Status:", resposta.status);
        console.log("URL:", resposta.url);

        if (!resposta.ok) {
            throw new Error("HTTP " + resposta.status);
        }

        const texto = await resposta.text();

        console.log("Conteúdo recebido:");
        console.log(texto);

        const musicas = JSON.parse(texto);

        lista.innerHTML = "";

        musicas.forEach((musica) => {

            const card = document.createElement("article");

            card.className = "song-card";

            card.innerHTML = `
                <div class="album">🎵</div>

                <div class="song-info">

                    <h3>${musica.titulo}</h3>

                    <span>${musica.artista}</span>

                    <p>${musica.mensagem}</p>

                    <a
                        href="${musica.spotify}"
                        target="_blank"
                        class="listen">

                        Ouvir no Spotify

                    </a>

                </div>
            `;

            lista.appendChild(card);

        });

    } catch (erro) {

        console.error("ERRO COMPLETO:", erro);

        lista.innerHTML = `
            <p class="erro">
                ${erro.message}
            </p>
        `;

    }

}