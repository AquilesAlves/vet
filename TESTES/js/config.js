// Dados da loja. É o único arquivo que muda de um cliente para outro.
// Campo opcional vazio ("", [] ou null) esconde a parte do site que depende dele.
// Nos textos, <br> quebra a linha e <em> pinta na cor de destaque; o resto vira texto puro.

const LOJA = {
  // ---------- Identidade ----------
  nome: "Amigo Fiel",
  // Endereço público do site, com https e barra no fim (usado nos dados para o Google).
  site: "https://aquilesalves.github.io/vet/",
  // Tipos do schema.org: a loja e, se houver horário de clínica, o departamento.
  tipoLoja: "PetStore",
  tipoClinica: "VeterinaryCare",

  // ---------- Contato ----------
  // Números só com dígitos: DDI + DDD + número.
  whatsapp: "5511999990000",
  whatsappExibicao: "(11) 99999-0000",
  // Número próprio da clínica. Vazio: a clínica usa o WhatsApp acima.
  whatsappClinica: "5511977770000",
  whatsappClinicaExibicao: "(11) 97777-0000",
  mensagemPadrao: "Olá! Vim pelo site e gostaria de mais informações.",
  telefone: "551133334444",
  telefoneExibicao: "(11) 3333-4444",
  email: "contato@amigofiel.com.br",
  instagram: "https://instagram.com/amigofiel",
  facebook: "https://facebook.com/amigofiel",

  // ---------- Endereço ----------
  endereco: "Rua das Acácias, 245 - Vila Mariana",
  cidade: "São Paulo - SP",
  cep: "04101-000",
  // Link "Incorporar um mapa" do Google Maps (só o endereço do src). Vazio: gera pelo endereço.
  mapa: "",
  // Fuso da loja: o status "aberto/fechado" usa a hora da loja, não a do visitante.
  fuso: "America/Sao_Paulo",
  cnpj: "00.000.000/0001-00",
  // Link do perfil no Google. Mostra o botão "Ver avaliações no Google".
  avaliacoesGoogle: "https://www.google.com/maps/search/?api=1&query=Amigo+Fiel+Pet+Shop",

  // ---------- Plantão ----------
  // null esconde a faixa de emergência.
  emergencia: {
    texto: "Plantão 24h para emergências",
    telefone: "5511988887777",
    exibicao: "(11) 98888-7777",
  },

  // ---------- Crédito no rodapé ----------
  credito: { texto: "Desenvolvido por", nome: "SHIFT", link: "https://aquilesalves.github.io/SHIFT/" },

  // ---------- Cores ----------
  cor: "#0b7a5c",       // modo claro
  corEscuro: "#4fd1a5", // modo escuro
  // true mostra a paleta para testar cores com o cliente; false ao entregar.
  seletorCores: true,

  // ---------- Abertura ----------
  titulo: "Cuidado de verdade<br>para quem <em>cuida de você</em>",
  subtitulo: "Clínica veterinária, banho e tosa e tudo o que seu pet precisa, no mesmo lugar e com hora marcada.",
  destaques: ["Veterinários com CRMV ativo", "Banho e tosa com hora marcada", "Leva e traz no bairro"],

  // ---------- Textos ----------
  sobreTexto: "Estamos na Vila Mariana desde 2012. Estacionamento próprio e entrada sem degraus para pets idosos.",
  rodapeTexto: "Pet shop e clínica veterinária na Vila Mariana. Cuidamos do seu pet como se fosse nosso.",

  // ---------- Horários ----------
  // 7 itens, de domingo a sábado: ["09:00", "18:00"] ou null (fechado). "24:00" = até meia-noite.
  // Pode ter só uma agenda; com as duas, o site mostra o status de cada uma.
  horarios: {
    petshop: [
      ["09:00", "13:00"],
      ["08:00", "19:00"],
      ["08:00", "19:00"],
      ["08:00", "19:00"],
      ["08:00", "19:00"],
      ["08:00", "19:00"],
      ["08:00", "17:00"],
    ],
    clinica: [
      null,
      ["08:00", "20:00"],
      ["08:00", "20:00"],
      ["08:00", "20:00"],
      ["08:00", "20:00"],
      ["08:00", "20:00"],
      ["08:00", "16:00"],
    ],
  },

  // ---------- Agendamento ----------
  // true mostra o formulário que monta a mensagem e abre o WhatsApp.
  agendamento: true,

  // ---------- Listas ----------
  // Ícones disponíveis: estetoscopio, seringa, exame, curativo, internacao, banho, tesoura, gota,
  // carro, racao, osso, bola, coleira, remedio, higiene, pata, coracao, escudo.
  clinica: [
    { icone: "estetoscopio", titulo: "Consulta", texto: "Avaliação completa, orientação e acompanhamento do seu pet.", detalhe: "Com hora marcada" },
    { icone: "seringa", titulo: "Vacinação", texto: "Vacinas para cães e gatos e controle da carteirinha.", detalhe: "Lembrete das doses" },
    { icone: "exame", titulo: "Exames", texto: "Exames de sangue, ultrassom e raio-x com resultado rápido.", detalhe: "Resultado em até 48h" },
    { icone: "curativo", titulo: "Cirurgias", texto: "Castração e cirurgias com anestesia monitorada.", detalhe: "Pré e pós-operatório" },
    { icone: "internacao", titulo: "Internação", texto: "Acompanhamento 24h para quem precisa ficar em observação.", detalhe: "Boletim diário" },
  ],
  banhoTosa: [
    { icone: "banho", titulo: "Banho", texto: "Shampoo próprio para cada pelagem, secagem e perfume.", detalhe: "a partir de R$ 50" },
    { icone: "tesoura", titulo: "Tosa", texto: "Tosa higiênica, na máquina ou na tesoura, do jeito que você pedir.", detalhe: "a partir de R$ 70" },
    { icone: "gota", titulo: "Hidratação", texto: "Hidratação dos pelos e cuidado com a pele sensível.", detalhe: "a partir de R$ 40" },
    { icone: "carro", titulo: "Leva e traz", texto: "Buscamos e levamos seu pet em casa, no bairro e arredores.", detalhe: "a partir de R$ 15" },
  ],
  // foto é opcional (proporção 16:10, até ~200 KB). Sem foto, aparece o ícone.
  produtos: [
    { icone: "racao", titulo: "Rações", texto: "Rações secas e úmidas, inclusive linhas terapêuticas.", foto: "" },
    { icone: "osso", titulo: "Petiscos", texto: "Petiscos naturais, ossinhos e bifinhos.", foto: "" },
    { icone: "bola", titulo: "Brinquedos", texto: "Bolinhas, mordedores e arranhadores.", foto: "" },
    { icone: "coleira", titulo: "Acessórios", texto: "Coleiras, guias, camas e caixas de transporte.", foto: "" },
    { icone: "remedio", titulo: "Farmácia veterinária", texto: "Antipulgas, vermífugos e medicamentos com receita.", foto: "" },
    { icone: "higiene", titulo: "Higiene", texto: "Areias, tapetes higiênicos, shampoos e escovas.", foto: "" },
  ],
  marcas: ["Royal Canin", "Premier", "Golden", "Hill's", "Pedigree", "Whiskas", "Bravecto", "NexGard", "Simparic", "Pipicat"],
  // foto é opcional (quadrada). Sem foto, aparecem as iniciais.
  equipe: [
    { nome: "Dra. Marina Lopes", especialidade: "Clínica geral e vacinas", crmv: "CRMV-SP 00000", foto: "" },
    { nome: "Dr. Rafael Nunes", especialidade: "Cirurgia e ortopedia", crmv: "CRMV-SP 00000", foto: "" },
    { nome: "Dra. Júlia Prado", especialidade: "Dermatologia e felinos", crmv: "CRMV-SP 00000", foto: "" },
  ],
  depoimentos: [
    { nome: "Ana Souza", pet: "tutora do Thor", nota: 5, texto: "Atendimento muito carinhoso. O Thor tem medo de veterinário e saiu de lá abanando o rabo." },
    { nome: "Carlos Mendes", pet: "tutor da Mel e da Nina", nota: 5, texto: "Faço banho e tosa das duas há dois anos. Sempre pontuais e o leva e traz ajuda demais." },
    { nome: "Fernanda Lima", pet: "tutora do Bento", nota: 5, texto: "Precisei do plantão de madrugada e fui atendida na hora. Equipe atenciosa e explicou tudo." },
  ],
  faq: [
    { pergunta: "Precisa agendar consulta?", resposta: "Recomendamos agendar pelo WhatsApp para não esperar. Emergências são atendidas na hora, a qualquer momento, pelo plantão." },
    { pergunta: "Quais formas de pagamento vocês aceitam?", resposta: "Pix, dinheiro e cartões de débito e crédito. Consultas e procedimentos podem ser parcelados no cartão." },
    { pergunta: "Atendem gatos e animais exóticos?", resposta: "Atendemos cães e gatos, com uma veterinária dedicada a felinos. Para exóticos, consulte a agenda pelo WhatsApp." },
    { pergunta: "O banho e tosa usa produtos próprios para pele sensível?", resposta: "Sim. Temos shampoos hipoalergênicos e, se o pet tiver indicação do veterinário, usamos o produto receitado." },
    { pergunta: "Como funciona o leva e traz?", resposta: "Buscamos o pet em casa no horário combinado e devolvemos depois do serviço. Atendemos a Vila Mariana e bairros vizinhos." },
  ],
};
