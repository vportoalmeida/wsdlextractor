export class ProcessXsdProvider {
  constructor(
    private readonly wsdlJsonStr: string
  ) {}

  private isTable(element: any): boolean {
    return (
      element["xsd:complexType"] &&
      element["xsd:complexType"]["xsd:sequence"] &&
      element["xsd:complexType"]["xsd:sequence"]["xsd:element"] &&
      element["xsd:complexType"]["xsd:sequence"]["xsd:element"].maxOccurs === "unbounded"
    );
  }

  private parseElement(element: any, schema: any, insideTable = false): any {    
    const result: any = element.name == 'item' ? {
      name: element.name,
      ...(element.minOccurs && { minOccurs: element.minOccurs }),
      ...(element.maxOccurs && { maxOccurs: element.maxOccurs }),    
    } : {
      name: element.name,
      ...(element.minOccurs && { minOccurs: element.minOccurs }),
      ...(element.maxOccurs && { maxOccurs: element.maxOccurs }),
      ...(element.type && { type: element.type })    
    };


    if (element["xsd:complexType"]) {
      const complexType = element["xsd:complexType"];
      result["xsd:complexType"] = {};

      if (complexType["xsd:sequence"] && this.isTable(element)) {
        const container = complexType["xsd:sequence"];
        const elements = Array.isArray(container["xsd:element"]) ? container["xsd:element"] : [container["xsd:element"]];

        result["xsd:complexType"]["xsd:sequence"] = {
          "xsd:element": elements.map((childElement: any) => this.parseElement(childElement, schema, true))
        };
      } else {
        const container = complexType["xsd:sequence"] || complexType["xsd:all"];
        const elements = Array.isArray(container["xsd:element"]) ? container["xsd:element"] : [container["xsd:element"]];

        result["xsd:complexType"]["xsd:sequence"] = {
          "xsd:element": elements.map((childElement: any) => this.parseElement(childElement, schema, false))
        };
      }
    } else if (element["xsd:simpleType"]) {    
      Object.assign(result, this.parseSimpleType(element));
    } else if (element["type"]) {    
      const referencedType = this.findReferencedType(element.type, schema);    
      if (referencedType) {
        if (insideTable) {
          result["xsd:complexType"] = {
            "xsd:sequence": {
              "xsd:element": referencedType.map((field: any) => this.parseElement(field, schema, true))
            }
          };
        } else {
          return {
            "xsd:sequence": {
              "xsd:element": referencedType.map((field: any) => this.parseElement(field, schema, false))
            }
          };
        }
      }
    }

    return result;
  }

  private findReferencedType(typeName: string, schema: any): any {
    const typeNameWithoutPrefix = typeName.split(":")[1];
    const complexTypes = Array.isArray(schema["xsd:complexType"]) ? schema["xsd:complexType"] : [schema["xsd:complexType"]];

    const referencedType = complexTypes.find((type: any) => type.name === typeNameWithoutPrefix);

    if (referencedType && referencedType["xsd:sequence"]) {
      const sequenceElements = referencedType["xsd:sequence"]["xsd:element"];
      return Array.isArray(sequenceElements) ? sequenceElements : [sequenceElements];
    }

    return null;
  }

  private parseSimpleType(element: any): any {
    if (element["xsd:simpleType"] && element["xsd:simpleType"]["xsd:restriction"]) {
      const restriction = element["xsd:simpleType"]["xsd:restriction"];
      return {
        type: restriction.base,      
      };
    }
    return {};
  }

  public generateRequestAndResponse(): { request: any; response: any } {
    const wsdlJson = JSON.parse(this.wsdlJsonStr);
    const requestJson: any = {};
    const responseJson: any = {};

    const definitions = wsdlJson.definitions;

    for (const key in definitions) {
      if (key === "types" && definitions[key]["xsd:schema"]) {
        const schema = definitions[key]["xsd:schema"];

        const elements = Array.isArray(schema["xsd:element"]) ? schema["xsd:element"] : [schema["xsd:element"]];

        elements.forEach((element: any) => {        
          const parsedElement = this.parseElement(element, schema);        
          const finalElement = parsedElement;

          if (element.name.endsWith(".Response")) {
            responseJson["xsd:element"] = finalElement;
          } else {
            requestJson["xsd:element"] = finalElement;
          }
        });
      }
    }

    return { request: requestJson, response: responseJson };
  }
}