const lista =
document.getElementById("listaCartas");

const modal =
document.getElementById("modalCarta");

const conteudo =
document.getElementById("conteudoCarta");

const fechar =
document.getElementById("fecharCarta");

async function carregarCartas(){

    const resposta =
    await fetch("../data/posts.json");

    const cartas =
    await resposta.json();

    cartas
    .sort((a,b)=>new Date(b.data)-new Date(a.data))
    .forEach(carta=>{

        const envelope =
        document.createElement("article");

        envelope.className="envelope";

        envelope.innerHTML = `

<div class="flap"></div>

<div class="paper-preview">

    <h2>${carta.titulo}</h2>

    <small>${formatarData(carta.data)}</small>

    <p class="preview">

        ${carta.texto.substring(0,90)}...

    </p>

</div>
`;

        envelope.onclick = () => {

    envelope.style.transform = "scale(.96)";

    setTimeout(() => {

        envelope.style.transform = "";

        abrirCarta(carta);

    }, 180);

};

        lista.appendChild(envelope);

    });

}

function abrirCarta(carta){

    modal.classList.add("ativo");

document.body.style.overflow="hidden";

    conteudo.innerHTML=`

        <h2>${carta.titulo}</h2>

        <div class="data">
            ${formatarData(carta.data)}
        </div>

        ${
            carta.imagem
            ?
            `<img
            src="../${carta.imagem}"
            style="
            width:100%;
            border-radius:12px;
            margin-bottom:25px;">`
            :
            ""
        }

       ${carta.texto
    .split("\n\n")
    .map(paragrafo => `<p>${paragrafo}</p>`)
    .join("")}

        <div class="assinatura">

            Com amor,

            <br>

            Juliana

        </div>

    `;

    modal.classList.add("ativo");

}

fechar.onclick=()=>{

    document.body.style.overflow="";

modal.classList.remove("ativo");

};

modal.querySelector(".modal-overlay")
.onclick=()=>{

    modal.classList.remove("ativo");

};

function formatarData(data){

    const d = new Date(data);

    return d.toLocaleDateString("pt-BR",{

        day:"2-digit",
        month:"long",
        year:"numeric"

    }).replace(" de "," • ").replace(" de "," • ");

}

carregarCartas();

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        modal.classList.remove("ativo");

    }

});

