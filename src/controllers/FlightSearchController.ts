import PostModel from "../model/PostModel";
import { Request, response } from "express";
import UserLogingModel from "../model/UserLoginModel";
import Sequelize from "sequelize";
import { ResponseMessage } from "../Utils/ResponseMessage";
import { Response } from "express";
import { Op } from "sequelize"; // Import Op from sequelize
import request from "request"; // Import request module
import * as xml2js from "xml2js"; // Import xml2js
import { ErrorMessage } from "../Utils/ErrorMessage";

export const CreatFlightSearch = async (req: any, res: Response): Promise<any> => {
    const { gds } = req.body;
    try {
        if (gds.toUpperCase() === "HITIT")
            await hititNDCAvailability(req, res)
        //   else if (gds.toUpperCase() === "SERENE") await sereneAvailability(req, res);
        //   else if (gds.toUpperCase() === "SERENE-API")
        //     await sereneApiAvailability(req, res);
        //   else f (gds.toUpperCase() === "AIRSIAL") 
        //     await airSialAvailability(req, res);
        //   else if (gds.toUpperCase() === "AIRBLUE")
        //     await airblueAvailability(req, res);
        //   else if (gds.toUpperCase() === "SABRE") await sabreAvailability(req, res);
        //   else if (gds.toUpperCase() === "AMADEUS")
        //     await amadeusAvailability(req, res);
        //   else if (gds.toUpperCase() === "FLYJINNAH")
        //     await FlyJinnahAvailability(req, res);
        //   else if (gds.toUpperCase() === "FLYDUBAI")
        //     await flyDubaiAvailability(req, res);
        //   else if (gds.toUpperCase() === "TURKISH") await TKAvailability(req, res);
        //   else if (gds.toUpperCase() === "EMIRATES") await EKAvailability(req, res);
        //   else if (gds.toUpperCase() === "TRAVELPORT")
        //     await travelportAvailibility(req, res);
        else {
            console.log("error", "error");
        }
    } catch (error) {
        console.log("error", error);
    }
};
const reArrangeDate = (date: string) => {
    const dateSend = date.split("-");
    //  arrange date to YYYY-MM-DD
    return `${dateSend[2]}-${dateSend[1]}-${dateSend[0]}`;
};

const hititNDCAvailability = async (req: Request, res: Response) => {
    try {
        let originDestinationOptionList = [] as any;
        //   const credentials = await getAllPKCredential();
        const credentials = [{
            pk_agent_id: "PSA2746216",
            pk_service_url: "https://app-stage.crane.aero/",
            pk_agent_password: "Pia123"
        }]
        const {
            departingOn,
            locationDep,
            locationArrival,
            ReturningOn,
            adultsCount,
            childCount,
            infantNo,
            trip_type,
            ticket_class,
            multi_des_from,
            multi_des_from_date,
            multi_des_to,
        } = req.body;

        // to arrange date in YYYY-MM-DD format
        const reArrangeDeparture = reArrangeDate(departingOn);
        const reArrangeReturn = reArrangeDate(ReturningOn);
        let segments = [
            {
                origin: locationDep.split("-")[0],
                destination: locationArrival.split("-")[0],
                date: reArrangeDeparture,
            },
        ];
        if (trip_type === "ROUND TRIP") {
            segments.push({
                origin: locationArrival.split("-")[0],
                destination: locationDep.split("-")[0],
                date: reArrangeReturn,
            });
        }

        if (trip_type.toUpperCase() === "MULTI DESTINATION") {
            const multiDes = multi_des_from?.map((orig: string, index: number) => {
                return {
                    origin: orig.split("-")?.at(0),
                    destination: multi_des_to?.at(index).split("-")?.at(0),
                    date: reArrangeDate(multi_des_from_date?.at(index)),
                };
            });
            segments = [...segments, ...multiDes];
        }

        let paxes = [] as any;
        let paxId = 0;
        Array.from({ length: adultsCount })?.forEach(() => {
            paxId = paxId + 1;
            paxes.push({ paxID: `SH${paxId}`, ptc: "ADT" });
        });
        Array.from({ length: childCount })?.forEach(() => {
            paxId = paxId + 1;
            paxes.push({ paxID: `SH${paxId}`, ptc: "CHD" });
        });
        Array.from({ length: infantNo })?.forEach(() => {
            paxId = paxId + 1;
            paxes.push({ paxID: `SH${paxId}`, ptc: "INF" });
        });

        credentials?.forEach(async (item: any, index: any) => {
            const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://www.iata.org/IATA/2015/00/2020.1/IATA_AirShoppingRQ">
     <soapenv:Header />
     <soapenv:Body>
        <IATA_AirShoppingRQ>
           <MessageDoc>
              <Name>NDC GATEWAY</Name>
              <RefVersionNumber>20.1</RefVersionNumber>
           </MessageDoc>
           <Party>
              <Sender>
                 <TravelAgency>
                    <AgencyID>${item?.pk_agent_id}</AgencyID>
                 </TravelAgency>
              </Sender>
           </Party>
           <Request>
              <FlightRequest>
                 ${segments
                    ?.map(
                        ({ origin, destination, date }) => `<OriginDestCriteria>
                    <DestArrivalCriteria>
                       <IATA_LocationCode>${destination}</IATA_LocationCode>
                    </DestArrivalCriteria>
                    <OriginDepCriteria>
                       <Date>${date}</Date>
                       <IATA_LocationCode>${origin}</IATA_LocationCode>
                    </OriginDepCriteria>
                    <PreferredCabinType>
                       <CabinTypeCode>Y</CabinTypeCode>
                    </PreferredCabinType>
                 </OriginDestCriteria>`
                    )
                    ?.join("")}
              </FlightRequest>
              <Paxs>
                 ${paxes
                    ?.map(
                        ({ paxID, ptc }: any) => `<Pax>
                    <PaxID>${paxID}</PaxID>
                    <PTC>${ptc}</PTC>
                 </Pax>`
                    )
                    ?.join("")}
              </Paxs>
              <ResponseParameters>
                 <CurParameter>
                    <RequestedCurCode>PKR</RequestedCurCode>
                 </CurParameter>
                 <LangUsage>
                    <LangCode>EN</LangCode>
                 </LangUsage>
              </ResponseParameters>
           </Request>
        </IATA_AirShoppingRQ>
     </soapenv:Body>
        </soapenv:Envelope>`;

            // storeCache(
            //   `hitit ${item.agent_name}`.replace(/ /g, "_"),
            //   JSON.stringify({
            //     ...item,
            //   })
            // );

            var options = {
                url: `${item.pk_service_url}/cranendc/v20.1/CraneNDCService`,
                method: "POST",
                body: xml,
                headers: {
                    "Content-Type": "text/xml",
                    userName: `${item.pk_agent_id}`,
                    password: `${item?.pk_agent_password}`,
                },
            };
            // deleteLogs(`uploads/app/hitit/${req.user?.user_id}`);
            // createLogs(
            //   `uploads/app/hitit/${req.user?.user_id}`,
            //   "avail_req.xml",
            //   xml
            // );

            let callback = (error: any, response: any, body: any) => {
                let cookie = response?.headers?.["set-cookie"]?.find((cookie: string) =>
                    cookie?.startsWith("ckPAXpersist=")
                );
                cookie = cookie?.split(";")?.at(0);
                //   createLogs(
                //     `uploads/app/hitit/${req.user?.user_id}`,
                //     "avail_res.xml",
                //     body
                //   );
                const stripPrefix = xml2js.processors.stripPrefix;
                var parser = new xml2js.Parser({
                    explicitArray: false,
                    trim: true,
                    tagNameProcessors: [stripPrefix],
                });
                let resultFlight = {} as any;
                parser.parseString(body, (_err: any, result: any) => {
                    resultFlight = result;
                });
                const shoppingResponse =
                    resultFlight?.Envelope?.Body?.IATA_AirShoppingRS;
                if (shoppingResponse?.Error?.DescText || !shoppingResponse?.Response) {
                    return ErrorMessage(
                        res,
                        shoppingResponse?.Error?.DescText ||
                        "Invalid Response from airline",
                        500
                    );
                }
                res.status(201).send({
                    message: response,
                    // data: getCustomRespBody(shoppingResponse?.Response, item),
                    data: shoppingResponse?.Response
                });
            };
            request(options, callback);
        });
        // return res.send(xml);
    } catch (error) {
        console.log(error);
        return ErrorMessage(res, error, 500);
    }
};