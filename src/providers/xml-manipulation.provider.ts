import  { toXml } from 'xml2json';

export class XmlManipulationProvider {
  private requestParsed: string;
  private responseParsed: string;
  private requestSourceParsed: string;
  private responseSourceParsed: string;
  
  constructor(
    private readonly request: string, 
    private readonly response: string,
    private readonly rfcName: string
  ) {
    this.requestParsed = '';
    this.responseParsed = '';
    this.requestSourceParsed = '';
    this.responseSourceParsed = '';
  }

  private parseToXml() {
    this.requestParsed = toXml(JSON.stringify(this.request, null, 2));
    this.responseParsed = toXml(JSON.stringify(this.response, null, 2));
  
  }

  private fixDateTimeTypes() {
    this.requestParsed = this.requestParsed.replace(new RegExp('xsd', 'g'), 'xs')
    .replace(new RegExp('s0:date', 'g'), 'xs:string')
    .replace(new RegExp('s0:time', 'g'), 'xs:string'); 
    this.responseParsed = this.responseParsed.replace(new RegExp('xsd', 'g'), 'xs')
    .replace(new RegExp('s0:date', 'g'), 'xs:string')
    .replace(new RegExp('s0:time', 'g'), 'xs:string');
  }

  private addSchemaTag() {
    this.requestParsed = '<?xml version="1.0" encoding="utf-8"?>' +
      '<xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema">' +
      this.requestParsed +
      '</xs:schema>';

    this.responseParsed = '<?xml version="1.0" encoding="utf-8"?>' +
      '<xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema">' +
      this.responseParsed +
      '</xs:schema>';
  }

  private getSourcesParsed() {
    this.requestSourceParsed = this.requestParsed.replace(`${this.rfcName}`, 'root');
    this.responseSourceParsed = this.responseParsed.replace(`${this.rfcName}.Response`, 'root');
  }

  public getXmlParsedStrings() {
    this.parseToXml();
    this.fixDateTimeTypes();
    this.addSchemaTag();
    this.getSourcesParsed();
    return { 
      requestXml: this.requestParsed,
      responseXml: this.responseParsed,
      requestSourceXml: this.requestSourceParsed,
      responseSourceXml: this.responseSourceParsed
    }
  }

}