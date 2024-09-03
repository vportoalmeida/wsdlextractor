import express, { Express } from 'express';
import path from 'path';
import { config } from 'dotenv';
import { BtpXsdFileGeneratorService } from './service/btp-xsd-file-generator.service';

config();

class App {
  constructor(private app: Express) {
    this.configureApp();
  }

  configureApp() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '/public')));
    this.app.post('/execute-rfc', (req, res) => {
        const { rfcName, username, password } = req.body;
          
        if (rfcName && username && password) {
            const btpXsdFileGeneratorService = new BtpXsdFileGeneratorService(rfcName, username, password);
            const {  } = btpXsdFileGeneratorService.generateFiles().then(({ 
              fileRequestXml, 
              fileResponseXml,
              fileRequestSourceXml,
              fileResponseSourceXml
            }) => {
              res.json({ 
                success: true, 
                message: `Dados WSDL extraidos da RFC ${rfcName} com sucesso para o usuário ${username}:`,
                filePath: fileRequestXml + '\n' +
                  fileResponseXml + '\n' +
                  fileRequestSourceXml + '\n' +
                  fileResponseSourceXml
              });
            });            
        } else {
            res.status(400).json({ success: false, message: 'Dados inválidos.' });
        }
    });
  }

  runApp() {

    this.app.listen(process.env.PORT || 3000, () => {
        console.log('Servidor rodando na porta 3000');
    });
  }
}

const app = new App(express());

app.runApp();