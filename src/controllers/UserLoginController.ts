import UserLogingModel from "../model/UserLoginModel";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { sign } from "jsonwebtoken";
import { ErrorMessage } from "../Utils/ErrorMessage";
import requestedIp from "ip";
import os from "os";
import { ResponseMessage } from "../Utils/ResponseMessage";
import axios from "axios";
export const CreateUserLogin = async (
  req: any,
  res: Response
): Promise<any> => {
  const { email, password } = req.body;
  if (!email || !password) {
    return ErrorMessage(res, "Please enter email or password", 200);
    // res.status(200).json({Message:"Please enter email or password"})
  }
  try {
    const user: any = await UserLogingModel.findOne({
      // attributes: { include: ["password"] },
    });
    // console.log("user", user);

    // console.log("userLogin pass", user.dataValues.password);

    // UserAttributes
    if (!user) return ErrorMessage(res, "wrong credentials", 400);
    const comparePassword = await bcrypt.compare(password, user.password);
    // console.log("comparePassword", comparePassword);

    if (!comparePassword) return ErrorMessage(res, "wrong credentials", 400);
    // condition to login only active users
    // if (!user) return ErrorMessage(res, "only active users allowed", 400);
    const token = jwt.sign(
      { email: user.email, id: user.user_id },
      process.env.SECRETE_KEY as string
    );
    const options = {
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    // let {user_id,role_id,agent_id,l_name,f_name}=user
    // we are extracting the password from the user object that is not gona be shown in the end point
    const userData = user.get({ plain: true }) as { [key: string]: any };
    if (userData) {
      const deviceName = os.hostname();
      const agentUserId: any = userData.user_id;
      // Assuming requestedIp.address() returns the IP address as a string
      // const ipAddress: string = requestedIp.address();
      //     await UserLoginIpModel.create({
      //       user_id:agentUserId,
      //       ip_address:ipAddress,
      //       device_name:deviceName,
      //       current_time:moment(new Date()).format('YYYY-MM-DDThh:mm')
      //     })
    }
    delete userData.password; // Remove the password field from the user data
    return res
      .status(200)
      .cookie("token", token, options)
      .json({ result: userData, token });
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
    // ErrorMessage(res, error, 400);
  }
};

export const CreateUsers = async (req: Request, res: Response): Promise<any> => {
  const { password, email } = req.body;
  const ipAddress = req.ip

  try {
    // 🔐 1. Hash password
    const hashPassword = await bcrypt.hash(password, 12);

    // 🧑‍💼 2. Create user in DB
    const user = await UserLogingModel.create({
      ...req.body,
      password: hashPassword,
    }) as any;
// console.log("useruseruseruseruser",user);

    // 🔑 3. Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, email: user.email, ipAddress },
      process.env.SECRETE_KEY as string,
      { expiresIn: "1d" }
    );

    // 🍪 4. Set token in cookie
    const cookieOptions = {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // true in production
      // sameSite: "lax" as const,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json({
        result: user,
        token,
        message: "User created and logged in successfully",
      });

  } catch (error) {
    ErrorMessage(res, error, 400);
  }
};


export const GetAllUserLogin = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
   
    const data = await UserLogingModel.findAll();
    res.status(200).json(data);
    //   ResponseMessage(res, 200, data);
  } catch (error) {
    console.log("error", error);

    //   ErrorMessage(res, error, 400);
  }
};


// export const getPaymentToken = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { MERCHANT_ID, SECURED_KEY, BASKET_ID, TXNAMT, CURRENCY_CODE } = req.body;

//     if (!MERCHANT_ID || !SECURED_KEY || !BASKET_ID || !TXNAMT || !CURRENCY_CODE) {
//       return ErrorMessage(res, "Missing required payment parameters", 400);
//     }

//     const params = new URLSearchParams({
//       MERCHANT_ID,
//       SECURED_KEY,
//       BASKET_ID,
//       TXNAMT,
//       CURRENCY_CODE,
//     });

//     const { data } = await axios.post(
//       "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken",
//       params.toString(),
//       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//     );

//     // Example response: { ACCESS_TOKEN: "...", TOKEN_EXPIRY: "..." }
//     if (data?.ACCESS_TOKEN) {
//       return ResponseMessage(res, 200, data);
//     } else {
//       console.log("data",data);
      
//       return ErrorMessage(res, "Failed to get token from PayFast", 400);
//     }
//   } catch (error: any) {
//     console.error("💥 PayFast Token Error:", error.response?.data || error.message);
//     ErrorMessage(res, "Error while fetching PayFast token", 500);
//   }
// };




// Helper function to generate token
const getPayfastToken = async (
  MERCHANT_ID: string,
  SECURED_KEY: string,
  BASKET_ID: string,
  TXNAMT: string,
  CURRENCY_CODE: string
) => {
  const params = new URLSearchParams({
    MERCHANT_ID,
    SECURED_KEY,
    BASKET_ID,
    TXNAMT,
    CURRENCY_CODE,
  });

  const { data } = await axios.post(
    "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken",
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (!data?.ACCESS_TOKEN) {
    throw new Error("Failed to get access token");
  }

  return data.ACCESS_TOKEN;
};

// New unified route
export const startPayfastPayment = async (req: Request, res: Response) => {
  try {
    const {
      MERCHANT_ID,
      SECURED_KEY,
      TXNAMT,
      CURRENCY_CODE,
      CUSTOMER_EMAIL_ADDRESS,
      CUSTOMER_MOBILE_NO,
      MERCHANT_NAME,
      TXNDESC,
      SUCCESS_URL,
      FAILURE_URL,
      CHECKOUT_URL,
      ITEMS = [],
    } = req.body;

    const BASKET_ID = `FLUX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Step 1: Get Access Token
    const token = await getPayfastToken(MERCHANT_ID, SECURED_KEY, BASKET_ID, TXNAMT, CURRENCY_CODE);

    // Step 2: Build dynamic PayFast fields
    const payfastUrl = "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction";

    const fields: Record<string, any> = {
      CURRENCY_CODE,
      MERCHANT_ID,
      MERCHANT_NAME: MERCHANT_NAME || "Payfast Merchant",
      TOKEN: token,
      BASKET_ID,
      TXNAMT,
      ORDER_DATE: new Date().toISOString(),
      SUCCESS_URL,
      FAILURE_URL,
      CHECKOUT_URL,
      CUSTOMER_EMAIL_ADDRESS,
      CUSTOMER_MOBILE_NO,
      SIGNATURE: "SOME-RANDOM-STRING",
      VERSION: "MERCHANT-CART-0.1",
      TXNDESC: TXNDESC || "Item Purchased from Cart",
      PROCCODE: "00",
      TRAN_TYPE: "ECOMM_PURCHASE",
      STORE_ID: "",
    };

    // Add dynamic items
    ITEMS.forEach((item: any, index: number) => {
      fields[`ITEMS[${index}][SKU]`] = item.SKU;
      fields[`ITEMS[${index}][NAME]`] = item.NAME;
      fields[`ITEMS[${index}][PRICE]`] = item.PRICE;
      fields[`ITEMS[${index}][QTY]`] = item.QTY;
    });

    // Step 3: Return auto-submitting HTML form
    let formHtml = `<form id="payfastForm" method="POST" action="${payfastUrl}">`;
    for (const [key, value] of Object.entries(fields)) {
      formHtml += `<input type="hidden" name="${key}" value="${value}" />`;
    }
    formHtml += `</form>
    <script>document.getElementById('payfastForm').submit();</script>`;

    res.send(formHtml);
  } catch (error: any) {
    console.error("💥 PayFast Payment Start Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};







// const getPayfastToken = async (
//   MERCHANT_ID: string,
//   SECURED_KEY: string,
//   BASKET_ID: string,
//   TXNAMT: string,
//   CURRENCY_CODE: string
// ) => {
//   const params = new URLSearchParams({
//     MERCHANT_ID,
//     SECURED_KEY,
//     BASKET_ID,
//     TXNAMT,
//     CURRENCY_CODE,
//     PROCCODE: "00"
//   });

//   const { data } = await axios.post(
//     "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken",
//     params.toString(),
//     { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//   );

//   if (!data?.ACCESS_TOKEN) {
//     throw new Error("Failed to get access token");
//   }

//   return data.ACCESS_TOKEN;
// };

// // New unified route
// export const startPayfastPayment = async (req: Request, res: Response) => {
//   try {
//     const {
//       MERCHANT_ID,
//       SECURED_KEY,
//       TXNAMT,
//       CURRENCY_CODE,
//       CUSTOMER_EMAIL_ADDRESS,
//       CUSTOMER_MOBILE_NO,
//       MERCHANT_NAME,
//       TXNDESC,
//       SUCCESS_URL,
//       FAILURE_URL,
//       CHECKOUT_URL,
//       ITEMS = [],
//     } = req.body;

//     const BASKET_ID = `FLUX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

//     // ✅ Step 1: Get Token
//     const token = await getPayfastToken(MERCHANT_ID, SECURED_KEY, BASKET_ID, TXNAMT, CURRENCY_CODE);
//     console.log("🔑 Token:", token);

//     // ✅ Step 2: Build fields
//     const fields: Record<string, any> = {
//       CURRENCY_CODE,
//       MERCHANT_ID,
//       MERCHANT_NAME: MERCHANT_NAME || "Payfast Merchant",
//       TOKEN: token,
//       BASKET_ID,
//       TXNAMT,
//       ORDER_DATE: new Date().toISOString(),
//       SUCCESS_URL,
//       FAILURE_URL,
//       CHECKOUT_URL,
//       CUSTOMER_EMAIL_ADDRESS,
//       CUSTOMER_MOBILE_NO,
//       SIGNATURE: "SOME-RANDOM-STRING",
//       VERSION: "MERCHANT-CART-0.1",
//       TXNDESC: TXNDESC || "Item Purchased from Cart",
//       PROCCODE: "00",
//       TRAN_TYPE: "ECOMM_PURCHASE",
//     };

//     ITEMS.forEach((item: any, index: number) => {
//       fields[`ITEMS[${index}][SKU]`] = item.SKU;
//       fields[`ITEMS[${index}][NAME]`] = item.NAME;
//       fields[`ITEMS[${index}][PRICE]`] = item.PRICE;
//       fields[`ITEMS[${index}][QTY]`] = item.QTY;
//     });

//     const payfastUrl = "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction";

//     // ✅ Step 3: Send fields to PayFast
//     const { data } = await axios.post(payfastUrl, qs.stringify(fields), {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });

//     // ✅ Step 4: Return HTML directly to frontend
//     res.setHeader("Content-Type", "text/html");
//     res.send(data);

//   } catch (error: any) {
//     console.error("💥 PayFast Payment Start Error:", error.message);
//     res.status(500).send(`<h2>Payment Initialization Failed</h2><pre>${error.message}</pre>`);
//   }
// };
