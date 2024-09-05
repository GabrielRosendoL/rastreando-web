import cors from 'cors';
import { NextFunction, Request, Response } from 'express';

// Step 1: Import the parts of the module you want to use
// import { MercadoPagoConfig, Payment } from 'mercadopago';

const { MercadoPagoConfig, Payment } = require('mercadopago');

require('dotenv').config();

const { v4: uuidv4 } = require('uuid');

// YT 22JUNHO2024Webhook
const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACESS_TOKEN_TESTE

const NGROK_URL = process.env.NGROK_URL

// Step 2: Initialize the client object
const client = new MercadoPagoConfig(
  { 
    accessToken: 'APP_USR-4054898672117452-082108-649257760e82802eb4ce4d12754adf0e-198390511' ,
    options: { timeout: 5000, idempotencyKey: 'abc' }
  }
);

// Step 3: Initialize the API object
const payment = new Payment(client);

var express = require('express');
const e = require('express');
var app = express();

// Middleware para analisar o corpo das requisições
app.use(express.json());

// Configuração do CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
};

app.use(cors(corsOptions));

/* GET home page. */
app.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.render('index', { title: 'Express v0.0.2' });
});

app.post('/criar-pix', function(req: Request, res: Response, next: NextFunction) {
  console.log("REQUEST")
  console.log(req.body.body)

  const body = {
    transaction_amount: req.body.body.transaction_amount,
    description: req.body.body.description,
    payment_method_id: req.body.body.paymentMethodId,
    payer: {
        email: req.body.body.email,
        identification: {
          type: req.body.body.identificationType,
          number: req.body.body.number
        }
    },
    notification_url: `${NGROK_URL}/v1/webhook`
  }

  const requestOptions = { idempotencyKey: uuidv4() };

  payment.create({ body, requestOptions })
    .then((result: any) => {
      console.log("result")
      console.log(result)
      res.send(result)
    })
    .catch((error: any) => {
      console.log("ERROR")
      console.log(error)
      res.status(500).json({ error: error.message });
    });
});

app.post('/process_payment', function(req: Request, res: Response, next: NextFunction) {
  console.log("REQUEST")
  console.log(req.body.body)
  console.log(req.body.body.payment_method_id)
  console.log("REQUEST-V3")

  const body = req.body.body;

  payment.create({
    body: {
      transaction_amount: body.transaction_amount,
      token: body.token,
      description: body.description,
      installments:  body.installments,
      payment_method_id: body.payment_method_id,
      issuer_id: body.issuer_id,
      payer: {
        email: body.payer.email,
        identification: {
          type: body.payer.identification.type,
          number: body.payer.identification.number
        }
      }
    },
    requestOptions: { idempotencyKey: uuidv4() }
  })
  .then((result: any) => {
    console.log("THEN")
    console.log(result)
  })
  .catch((error: any) => {
    console.log("CATCH")
    console.log(error)
  });

  res.send("DEU BOM");
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});