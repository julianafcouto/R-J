(function () {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyCFD7ozkwGWMMVbw7ilcetySbhwjtu8kI4",
    authDomain: "rvej-3bbb7.firebaseapp.com",
    projectId: "rvej-3bbb7",
    storageBucket: "rvej-3bbb7.firebasestorage.app",
    messagingSenderId: "348616606097",
    appId: "1:348616606097:web:6b3612cddc24b10c14da30"
  };
  const emailsAutorizados = [
    "julianafelix.jf425@gmail.com",
    "rayanebmlima@gmail.com"
  ];
  const URL_PONTE = "https://firebase.rayane.local";
  const fetchOriginal = window.fetch.bind(window);
  let autenticacaoEmAndamento = null;

  if (!window.firebase) return;
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

  const auth = firebase.auth();
  const banco = firebase.firestore();
  auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(function () {});

  function respostaJson(dados, status) {
    return new Response(JSON.stringify(dados), {
      status: status || 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  function codigoDisponivel() {
    return sessionStorage.getItem("rj-firebase-codigo") ||
      localStorage.getItem("rayane-cantinho-codigo-v1") || "";
  }

  async function autenticar(codigo) {
    if (auth.currentUser && emailsAutorizados.includes(auth.currentUser.email || "")) {
      return auth.currentUser;
    }
    if (autenticacaoEmAndamento) return autenticacaoEmAndamento;

    autenticacaoEmAndamento = (async function () {
      for (const email of emailsAutorizados) {
        try {
          const credencial = await auth.signInWithEmailAndPassword(email, codigo);
          return credencial.user;
        } catch (erro) {
          if (!["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(erro.code)) {
            throw erro;
          }
        }
      }
      throw new Error("codigo_incorreto");
    })();

    try {
      return await autenticacaoEmAndamento;
    } finally {
      autenticacaoEmAndamento = null;
    }
  }

  function esperarCodigo() {
    const existente = codigoDisponivel();
    if (existente) return Promise.resolve(existente);
    return new Promise(function (resolve) {
      document.addEventListener("rj-acesso-alterado", function () {
        resolve(codigoDisponivel());
      }, { once: true });
    });
  }

  async function listar() {
    await autenticar(await esperarCodigo());
    const consulta = await banco.collection("publicacoes_rayane")
      .orderBy("criada_em", "desc").get();
    return consulta.docs.map(function (documento) {
      return { id: documento.id, ...documento.data() };
    });
  }

  async function criar(parametros) {
    const usuario = await autenticar(parametros.p_codigo || "");
    const agora = new Date().toISOString();
    const dados = {
      id: String(parametros.p_id),
      texto: String(parametros.p_texto || ""),
      data: parametros.p_data || "",
      link: parametros.p_link || "",
      criada_em: agora,
      owner_uid: usuario.uid
    };
    await banco.collection("publicacoes_rayane").doc(dados.id).set(dados);
  }

  async function apagar(parametros) {
    await autenticar(parametros.p_codigo || "");
    await banco.collection("publicacoes_rayane").doc(String(parametros.p_id)).delete();
  }

  window.fetch = async function (entrada, opcoes) {
    const url = typeof entrada === "string" ? entrada : entrada.url;
    if (!url.startsWith(URL_PONTE)) return fetchOriginal(entrada, opcoes);

    try {
      if (url.includes("/publicacoes_rayane")) return respostaJson(await listar());
      const parametros = JSON.parse(opcoes?.body || "{}");
      if (url.endsWith("/criar_publicacao_rayane")) await criar(parametros);
      else if (url.endsWith("/apagar_publicacao_rayane")) await apagar(parametros);
      else return respostaJson({ erro: "rota_inexistente" }, 404);
      return respostaJson({ ok: true });
    } catch (erro) {
      const codigo = erro.message === "codigo_incorreto" || erro.code === "auth/invalid-credential";
      return respostaJson({ erro: codigo ? "codigo_incorreto" : "firebase_indisponivel" }, codigo ? 401 : 503);
    }
  };
})();
