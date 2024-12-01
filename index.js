const venom = require("venom-bot")
const banco = require("./source/db")
const axios = require("axios")


const header = {
    "Content-Type": "application/json",
    "Authorization": `Bearer SK-proj-UFYxgAzWPcYgecPqNNAO479Fmy9VRcK3p4LJxikBdGg9QTRQBVkHRDvXoUbLKe8_DiyiXdYBZcT3BlbkFJ3I0m8yqd4kB4y2ppbR3XzMnx9YWHkjF34XJuHGhqP31hvcZ_OK0_DCehhQClSKDeQ_1qT5r8oA`
};

const Brain = `Você trabalha em uma barbearia, você atende o cliente incrivelmente com carisma , atenção e proatividade. Você deve mostrar as opções de corte de cabelo (corte na máquina ou tesoura), endereço da loja que é na rua Comendador Siqueira 1200, deve sempre incentivar os clientes a assinarem o plano mensal de 80 reais também!`

venom.create({session: "Barber-Bot", multidevice: true}).then(client => start(client)).catch(err => console.log(err))

const start = (client) => {
    client.onMessage(async (message) => {
        let userRegistered = banco.db.find(user => user.num === message.from)
        if (!userRegistered){
            console.log("Registering Client..")
            userRegistered = {num: message.from, historico: []}
            banco.db.push(userRegistered)
        } else {
            console.log("User already registered")
        }
        userRegistered.historico.push("user: " + message.body)
        console.log(userRegistered.historico)
        try {
            const response = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: [
                    {role: "system", content: Brain},
                    {role: "user", content: message.body},
                    {role: "system", content: "Historico : " + userRegistered.historico.join('\n')}
                ]
            }, {
                headers: header
            })

            const gptReply = response.data.choices[0].message.content;
            userRegistered.historico.push("assistant: " + gptReply)
            await client.sendText(message.from, gptReply)
            .then(result => {
                console.log("Message sent")
            }).catch(err => {
                console.log("error sending", err)
            })
        } catch (err) {
            console.log(err)
            await client.sendText(message.from, "Desculpe, não consigo responder no momento! Consulte um de nossos atendentes por ligação ou instagram!")
    
        }
      
    }) 
}
