require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Olá, seja bem vindo ao bot da barbearia ${process.env.APP_NAME}!\nPara fazer o registro na barbearia e poder fazer reservas de horários, preciso que você compartilhe seu contato.`, {
        reply_markup: {
            keyboard: [[{
                text: 'Compartilhar meu número de telefone',
                request_contact: true,
            }]],
            one_time_keyboard: true,
        },
    });
});

bot.on('message', (msg) => {
    if (msg.contact) {
        registerUser(msg);
    } else if (msg.text !== '/start') {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Entendo que você possa não querer compartilhar seu contato. No entanto, precisamos dele para realizar seu cadastro na barbearia e fazer reservas de horários. Quando você estiver pronto para compartilhar, basta iniciar novamente com /start. Até logo!');
    }
});

bot.on('contact', async (msg) => {
    registerUser(msg);
});

async function registerUser(msg) {
    const chatId = msg.chat.id;
    const name = msg.contact.first_name;
    const phone = msg.contact.phone_number;

    try {
        const response = await axios.post(`${process.env.API_URL}/client/test`, {
            name: name,
            telephone: phone,
        });

        if (response.status === 200) {
            bot.sendMessage(chatId, `Olá, ${name}!\nEsta é uma mensagem automática, selecione a opção desejada:`, {
                reply_markup: {
                    keyboard: [
                        ['Realizar reserva'],
                        ['Consultar reserva'],
                        ['Cancelar reserva']
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            });
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Houve um erro durante o registro. Por favor, tente novamente mais tarde.');
    }
}

bot.onText(/Realizar reserva/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Você escolheu Realizar reserva. Vamos processar isso.');
});

bot.onText(/Consultar reserva/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Você escolheu Consultar reserva. Vamos processar isso.');
});

bot.onText(/Cancelar reserva/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Você escolheu Cancelar reserva. Vamos processar isso.');
});
