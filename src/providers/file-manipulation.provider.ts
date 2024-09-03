import * as fs from 'fs';
import * as path from 'path';

export class FileManipulationProvider {
  constructor(
    private readonly requestXml: string,
    private readonly responseXml: string,
    private readonly requestSourceXml: string,
    private readonly responseSourceXml: string,
    private readonly rfcName: string,
  ) {}  

  private createFileWithContent(content: string, fileName: string, extension: string): string {    
    const filePath = path.join('src/output/', `${fileName}${extension}`);
    
    fs.writeFileSync(filePath, content, 'utf8');      

    return filePath;
  }

  public generateXsdFiles() {
    const fileRequestXml = this.createFileWithContent(this.requestXml, `${this.rfcName}Rfc`, '.xsd');
    const fileResponseXml = this.createFileWithContent(this.responseXml, `${this.rfcName}Response`, '.xsd');
    const fileRequestSourceXml = this.createFileWithContent(this.requestSourceXml, `${this.rfcName}Source`, '.xsd');
    const fileResponseSourceXml = this.createFileWithContent(this.responseSourceXml, `${this.rfcName}SourceResponse`, '.xsd');

    return {
      fileRequestXml,
      fileResponseXml,
      fileRequestSourceXml,
      fileResponseSourceXml
    }
  }
}