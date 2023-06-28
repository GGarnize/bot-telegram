require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

let chatStates = {};
let serviceOptions = {};
let sendObjectAPI = { nivel2: "barba", nivel3: "barbeiro2" };

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Define as opções válidas para cada estado.
const stateOptions = {
  1: ["Realizar reserva", "Consultar reserva", "Cancelar reserva"],
  2: [],  // Populado dinamicamente quando o usuário escolhe "Realizar reserva".
};

// Define as funções de manipulação para cada estado.
const stateHandlers = {
  1: handleState1,
  2: handleState2,
};

bot.on("message", async (msg) => {
  if (!msg.contact && msg.text !== "/start") {
    const chatId = msg.chat.id;
    const userState = chatStates[chatId];

    // Se o estado atual do usuário não tem um manipulador definido, registre o usuário.
    if (!stateHandlers[userState]) {
      const valida = await validaUser(chatId);
      if (valida.exists) {
        saudacao(chatId, valida.data.name);
        chatStates[chatId] = 1;
      } else {
        return registerUser(msg, chatId);
      }
    }

    // Se a mensagem não é uma opção válida para o estado atual, envie uma mensagem de erro.
    if (!stateOptions[userState].includes(msg.text)) {
      return bot.sendMessage(chatId, "Opção inválida! Digite novamente");
    }

    // Se a mensagem é uma opção válida, execute o manipulador do estado.
    return stateHandlers[userState](msg, chatId);
  }
});

async function handleState1(msg, chatId) {
  switch (msg.text) {
    case "Realizar reserva":
      const servicos = [];
      const options = [];
      try {
        const response = await axios.get(`${process.env.API_URL}/service`);
        if (response.status === 200) {
          response.data.map((each) => {
            servicos.push(each);
            options.push([each.category.name]);
          });
        }
        stateOptions[2] = options;  // Atualiza as opções para o estado 2.
        chatStates[chatId] = 2;  // Muda o estado para 2.
        mostrarOpcoes(chatId, "Selecione o serviço desejado:", options);
      } catch (error) {
        errorMsg(chatId, error);
      }
      break;
    case "Consultar reserva":
      bot.sendMessage(chatId, "Você escolheu Consultar reserva. Vamos processar isso.");
      break;
    case "Cancelar reserva":
      bot.sendMessage(chatId, "Você escolheu Cancelar reserva. Vamos processar isso.");
      break;
  }
}

async function handleState2(msg, chatId) {
  sendObjectAPI.nivel2 = msg.text;
  // Continue a lógica para o estado 2 aqui.
}

// Continue com as funções já definidas como registerUser, validaUser, saudacao, errorMsg...
