const SERVER_PORT = process.env.PORT || 3000;

let server = http.createServer((req, res) => {
    // Por definição, no pacote http, o corpo da requisição é recebido separado
    // em chunks, portanto precisamos reconstruí-lo.
    let body = [];
    req.on('data', (chunk) => body.push(chunk));

    req.on('end', () => {
        // Converte a string recebida como corpo da requisição para uma mensagem JSON
        let message = JSON.parse(body.toString());

        // Trata as mensagens recebidas
        handleMessage(req);

        res.end();
    });
});

server.listen(SERVER_PORT, () => {
    console.log(`Server is listening on port ${SERVER_PORT}`);
});

//segunda parte

let request = require('request-promise');
const MESSAGES_URL = 'https://msging.net/messages';

class MessagingHubHttpClient {

    // O cabeçalho de autenticação obtido ao configurar o Bot será passado para este construtor
    constructor(authHeader) {
        this._authHeader = `Key ${YnVzY2FpbWdiaW5nOm1oY0RCMld6Z1pzOEgxMDUzWjdR}`;
    }

    sendMessage(message) {
        return request({
            method: 'POST',
            uri: MESSAGES_URL,
            headers: {
                'Content-type': 'application/json',
                'Authorization': this._authHeader
            },
            body: message,
            json: true
        });
    }
}

// terceira parte

const BING_SERVICE_URI = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search';

function searchImage(query) {
    return request({
        method: 'GET',
        uri: `${BING_SERVICE_URI}?q=${query}&mkt=pt-br`,
        headers: {
            'Ocp-Apim-Subscription-Key': this._bingApiKey
        },
        json: true
    });
}

// quarta parte

// Substitua {SEU_CABECALHO_DE_AUTENTICACAO} pelo cabeçalho de autenticação obtido ao criar seu Bot no Painel Blip
let client = new MessagingHubHttpClient('{YnVzY2FpbWdiaW5nOm1oY0RCMld6Z1pzOEgxMDUzWjdR}');

function handleMessage(message) {
    if (message.type !== 'text/plain') {
        return;
    }

    // Obtem o conteudo da mensagem recebida pelo contato
    let query = message.content.toString();

    // Faz a chamada na API de busca do Bing
    searchImage(query)
        .then(data => {
            // Cria uma nova mensagem para responder o usuario que enviou a mensagem.
            // O campo `to` da messagem deve ser igual ao campo `from` da mensagem recebida
            let response = {
                id: uuid.v4(),
                to: message.from
            };

            if (data.value.length === 0) {
                // Cria um conteudo de somente texto para a mensagem de resposta
                response.content = `Nenhuma imagem encontrada para o termo '${query}'`;
                response.type = 'text/plain';
            }
            else {
                let image = data.value[0];

                // Cria um conteudo de imagem para a mensagem de resposta
                response.content = {
                    uri: image.contentUrl,
                    type: `image/${image.encodingFormat}`,
                    previewUri: image.thumbnailUrl,
                    previewType: `image/${image.encodingFormat}`,
                    size: parseInt(image.contentSize.match(/\d*/)[0])
                };
                response.type = 'application/vnd.lime.media-link+json';
            }

            // Responde a mensagem para o usuario
            return client.sendMessage(response);
        });
}