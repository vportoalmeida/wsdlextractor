export class CallSapProvider {
  constructor(
    private readonly name: string,
    private readonly user: string,
    private readonly password: string
  ) {}

  private getBasicAuth() {
    return Buffer.from(this.user + ':' + this.password, 'utf-8');
  }

  private getUrlFromEnv() {    
    return process.env.NODE_ENV == 'PRD' ? process.env.SAP_URL_PRD : process.env.SAP_URL_QAS;
  }

  async getRfcXml() {      
    return fetch(`${this.getUrlFromEnv()}${this.name}`, { 
        method: 'GET',
        headers: { 
        Authorization: 'Basic ' + `${this.getBasicAuth().toString("base64")}`
        } 
      }
    );
  }
}