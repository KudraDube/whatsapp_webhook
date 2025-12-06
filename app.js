const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const userState = {};   // temporary storage for conversation state
const ticketPrice = 300;

app.post("/", async (req, res) => {
  try {
    const data = req.body;

    if (!data.entry) return res.sendStatus(200);

    const message = data.entry[0].changes[0].value.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const userMsg = message.text?.body?.trim();

    // Initialize state
    if (!userState[from]) {
      userState[from] = {
        step: "welcome",
        order: {}
      };
    }

    const state = userState[from];

    // HELPER: send WhatsApp message
    async function sendMsg(text) {
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v20.0/${process.env.PHONE_NUMBER_ID}/messages`,
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: { body: text }
        }
      });
    }

    // STEP LOGIC
    switch (state.step) {

      case "welcome":
        await sendMsg(
          "This service is for buying bus tickets.\nWould you like to buy a ticket?\n\n1️⃣ Yes\n2️⃣ No"
        );
        state.step = "buyOrNot";
        break;

      case "buyOrNot":
        if (userMsg === "1") {
          await sendMsg("Please enter your *name* as per ID/Passport:");
          state.step = "name";
        } else {
          await sendMsg("Please visit our offices for further assistance.");
          delete userState[from];
        }
        break;

      case "name":
        state.order.name = userMsg;
        await sendMsg("Please enter your *surname*:");
        state.step = "surname";
        break;

      case "surname":
        state.order.surname = userMsg;
        await sendMsg("Please enter your *ID or Passport Number*:");
        state.step = "passport";
        break;

      case "passport":
        state.order.passport = userMsg;
        await sendMsg("Please enter *Next of Kin Name and Number*:");
        state.step = "nok";
        break;

      case "nok":
        state.order.nok = userMsg;
        await sendMsg("How many tickets would you like to buy?");
        state.step = "tickets";
        break;

      case "tickets":
        state.order.tickets = parseInt(userMsg);
        await sendMsg(
          "Please enter your *departure date* (YYYY-MM-DD):"
        );
        state.step = "departureDate";
        break;

      case "departureDate":
        state.order.departureDate = userMsg;
        await sendMsg(
          "Please enter your *arrival date* (YYYY-MM-DD):"
        );
        state.step = "arrivalDate";
        break;

      case "arrivalDate":
        state.order.arrivalDate = userMsg;
        await sendMsg(
          "Please choose your route:\n\n1️⃣ Durban → Johannesburg\n2️⃣ Johannesburg → Durban\n3️⃣ Durban → Cape Town\n4️⃣ Cape Town → Durban"
        );
        state.step = "route";
        break;

      case "route":
        const routes = {
          "1": "Durban → Johannesburg",
          "2": "Johannesburg → Durban",
          "3": "Durban → Cape Town",
          "4": "Cape Town → Durban"
        };

        state.order.route = routes[userMsg] || "Unknown Route";

        const total = state.order.tickets * ticketPrice;

        await sendMsg(
          `Your total order is *R${total}* for *${state.order.tickets} ticket(s)*.\n\nClick the link below to pay:\nhttps://yourpaymentgateway.com/pay/12345`
        );

        await sendMsg("Thank you for your order! Once payment is confirmed, your ticket will be issued.");

        delete userState[from];
        break;
    }

    res.sendStatus(200);

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
