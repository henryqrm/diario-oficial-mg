'use strict';
const Promise = require('bluebird');
const $ = require('jquery');
const request = require('request');
const jsdom = require('jsdom');
const http = require('http');


var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.contentType("text/html");
    crawlerICarros(res, null);
});

app.get('/:nome', function (req, res) {
    res.contentType("text/html");
    const nome = req.param('nome');
    console.log(nome);
    crawlerICarros(res, nome);
});
app.listen(process.env.PORT);

// http.createServer(function (req, res) {
//     console.log(req);
//     res.writeHead(200, {
//         'Content-Type': 'text/html'
//     });
// }).listen(8080);
function crawlerICarros(res, nome) {
    if(nome === null){
        nome = "Pedro Henrique Lopes Frias Vimeiro de Medeiros".split(' ').join('+');
    }
    let url = `http://jornal.iof.mg.gov.br/xmlui/search?noticiario=Notici%C3%A1rio&caderno1=Di%C3%A1rio+do+Executivo&caderno2=Di%C3%A1rio+do+Legislativo&caderno3=Di%C3%A1rio+do+Judici%C3%A1rio&caderno4=Publica%C3%A7%C3%B5es+de+Terceiro&dataInicio=01%2F01%2F2017&dataFim=28%2F01%2F2018&texto=${nome}&tipoBusca=buscaFrase&query=%28%28%28bloco%3A%28+%2BNotici%C3%A1rio%29%29+OR+%28bloco%3A%28+%2BDi%C3%A1rio+%2Bdo+%2BExecutivo%29%29+OR+%28bloco%3A%28+%2BDi%C3%A1rio+%2Bdo+%2BLegislativo%29%29+OR+%28bloco%3A%28+%2BDi%C3%A1rio+%2Bdo+%2BJudici%C3%A1rio%29%29++OR+%28bloco%3A%28+%2BDi%C3%A1rio+%2Bda+%2BJusti%C3%A7a%29%29++OR+%28bloco%3A%28+%2BPublica%C3%A7%C3%B5es+%2Bde+%2BTerceiro%29%29%29+AND++data%3A%5B20170101+TO+20180128%5D+%29+AND+%28%22${nome}%22%29&sort_by=0&order=DESC&rpp=10`;

    request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
            jsdom.env(html, (errors, window) => {
                const jq = $(window);
                const link = (jq('#id-resultado-pesquisa tr td').html());
                if( link === undefined){
                    res.end('Nenhum resultado com o nome: ' + nome + '<br> Para pesquisar altere a url<br>ex: /Henrique+Rodrigues+Moreira');
                } else {
                    request(jq('#id-resultado-pesquisa a').attr('onclick').split('\'')[1], (error2, response2, html2) => {
                        if (!error2 && response2.statusCode === 200) {
                            jsdom.env(html2, (errors2, window2) => {
                                const jq2 = $(window2);
                                const linkPDF = jq2('iframe').attr('src');
                                jq('#id-resultado-pesquisa a').before('<span>Resultado em: </span>').after(` <span> ou acesse o <a href="${linkPDF}"><strong>PDF</strong></a></span>`);
                                const result = (jq('#id-resultado-pesquisa tr td').html());
                                res.end(result);
                            });
                        }
                    });
                }
            });
        }
    });
}