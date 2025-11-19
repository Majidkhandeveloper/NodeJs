export const getCustomRespBody = (result: any, item: { agent_name: string}) => {
    const { DataLists, OffersGroup, ShoppingResponse } = result;
  
    let baggageAllowanceList = DataLists?.BaggageAllowanceList?.BaggageAllowance;
    baggageAllowanceList = Array.isArray(baggageAllowanceList)
      ? baggageAllowanceList
      : [baggageAllowanceList];
  
    let originDestList = DataLists?.OriginDestList?.OriginDest;
    originDestList = Array.isArray(originDestList)
      ? originDestList
      : [originDestList];
  
    let paxJourneyList = DataLists?.PaxJourneyList?.PaxJourney;
    paxJourneyList = Array.isArray(paxJourneyList)
      ? paxJourneyList
      : [paxJourneyList];
  
    let paxList = DataLists?.PaxList?.Pax;
    paxList = Array.isArray(paxList) ? paxList : [paxList];
  
    let paxSegmentList = DataLists?.PaxSegmentList?.PaxSegment;
    paxSegmentList = Array.isArray(paxSegmentList)
      ? paxSegmentList
      : [paxSegmentList];
  
    let serviceDefinitionList =
      DataLists?.ServiceDefinitionList?.ServiceDefinition;
    serviceDefinitionList = Array.isArray(serviceDefinitionList)
      ? serviceDefinitionList
      : [serviceDefinitionList];
  
    let offers = OffersGroup?.CarrierOffers?.Offer;
    offers = Array.isArray(offers) ? offers : [offers];
  
    let flightOffers = offers?.map((offer: any) => {///////////////////////////////////////////////
      let itenaries = offer?.JourneyOverview?.JourneyPriceClass;
      itenaries = Array.isArray(itenaries) ? itenaries : [itenaries];
  
      let paxes = offer?.OfferItem;
      paxes = Array.isArray(paxes) ? paxes : [paxes];
  
      let adult = paxes?.find(({ FareDetail, ...rest }: any) => {
        let fareDetail = Array.isArray(FareDetail)
          ? FareDetail?.at(0)
          : FareDetail;
        fareDetail =
          fareDetail?.PaxRefID?.includes("ADT") ||
          fareDetail?.PaxRefID?.at(0)?.includes("ADT")
            ? { fareDetail, ...rest }
            : null;
        return fareDetail;
      });
  
      let fareDetails = adult?.FareDetail;
      fareDetails = Array.isArray(fareDetails) ? fareDetails : [fareDetails];
  
      const getTaxesArray = (tax: any) => {
        tax = tax ? (Array.isArray(tax) ? tax : [tax]) : [];
        return tax?.map(({ TaxCode, Amount }: any) => ({
          code: TaxCode,
          amount: Number(Amount?._ || 0),
        }));
      };
  
      let services = adult?.Service;
      services = Array.isArray(services) ? services : [services];
  
      services = services
        ?.filter(
          (service: any) =>
            service?.ServiceAssociations?.ServiceDefinitionRef
              ?.ServiceDefinitionRefID
        )
        ?.map((service: any) =>
          serviceDefinitionList?.find(
            ({ ServiceDefinitionID }: any) =>
              ServiceDefinitionID ===
              service?.ServiceAssociations?.ServiceDefinitionRef
                ?.ServiceDefinitionRefID
          )
        )
        ?.map(({ ServiceDefinitionAssociation }: any) =>
          baggageAllowanceList?.find(
            ({ BaggageAllowanceID }: any) =>
              BaggageAllowanceID ===
              ServiceDefinitionAssociation?.BaggageAllowanceRef
                ?.BaggageAllowanceRefID
          )
        );
  
      itenaries = itenaries?.map((itenary: any, itenIndex: number) => {
        const paxJourney = paxJourneyList?.find(
          (pj: any) => pj?.PaxJourneyID === itenary?.PaxJourneyRefID
        );
        let segments = paxJourney?.PaxSegmentRefID;
        segments = Array.isArray(segments) ? segments : [segments];
  
        segments = segments?.map((PaxSegmentRefID: any) =>
          paxSegmentList?.find(
            ({ PaxSegmentID }: any) => PaxSegmentID === PaxSegmentRefID
          )
        );
  
        const pieceweight =
          services?.at(itenIndex)?.PieceAllowance?.PieceWeightAllowance;
        const bag = pieceweight?.MaximumWeightMeasure
          ? `${pieceweight?.MaximumWeightMeasure?._} ${pieceweight?.MaximumWeightMeasure?.$?.UnitCode}`
          : pieceweight?.TotalQty !== "0"
          ? `${pieceweight?.TotalQty} Piece(s)`
          : null;
  
        const baggage = {
          count: 1,
          weight: bag || `No Baggage`,
          handCarray: `1 Piece 7 KG`,
          unit: pieceweight?.MaximumWeightMeasure?.$?.UnitCode || "KG",
          description: bag || `No Baggage`,
        };
  
        return {
          marketingAirline: "PK",
          segments,
          baggage,
        };
      });
      return {
        itenaries,
        agent_name: item.agent_name,
        fareOptions: [
          {
            id: offer?.OfferID,
            ...offer?.OfferItem
          },
        ],
        metaData: {
          shoppingRefId: ShoppingResponse?.ShoppingResponseRefID,
        },
      };
    });
  
    return flightOffers;
  };
  