import  { toJson } from 'xml2json';

import { CallSapProvider } from '../providers/call-sap.provider';
import { ProcessXsdProvider } from '../providers/process-xsd.provider';
import { XmlManipulationProvider } from '../providers/xml-manipulation.provider';
import { FileManipulationProvider } from '../providers/file-manipulation.provider';

export class BtpXsdFileGeneratorService {
  constructor(
    private readonly rfc: string,
    private readonly user: string,
    private readonly password: string,
  ) {}

  public async generateFiles() {
    const callSap = new CallSapProvider(this.rfc, this.user, this.password);  
  
    const xmlTextResponse = await callSap.getRfcXml();

    const wsdlJsonStr = toJson(await xmlTextResponse.text()); 
    
    const processXsdProvider = new ProcessXsdProvider(wsdlJsonStr);  

    const { request, response } = processXsdProvider.generateRequestAndResponse();

    const xmlManipulationProvider = new XmlManipulationProvider(request, response, this.rfc);

    const { 
      requestXml, 
      responseXml, 
      requestSourceXml, 
      responseSourceXml 
    } = xmlManipulationProvider.getXmlParsedStrings();      

    const fileManipulationProvider = new FileManipulationProvider(
      requestXml, 
      responseXml, 
      requestSourceXml, 
      responseSourceXml, 
      this.rfc
    );

    return fileManipulationProvider.generateXsdFiles();
  }
}
