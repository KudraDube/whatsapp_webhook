**🚌 WhatsApp Bus Ticket Booking Bot**


A Node.js backend that transforms a WhatsApp Business account into a fully automated ticketing kiosk. Using the Meta WhatsApp Business API, it guides users through a step-by-step conversation to collect traveler details, route preferences, and provide a payment link.

✨ Features
Conversational UI: Replaces boring forms with a natural chat interface.

Session Management: Uses a userState object to remember where each customer is in the booking process (e.g., whether they just gave their name or are currently choosing a route).

Dynamic Calculations: Automatically calculates the total price in Rands (ZAR) based on the number of tickets requested.

Webhook Integration: Listens for real-time messages from the WhatsApp/Facebook servers and responds instantly.

🛠️ Tech Stack
Node.js & Express: The engine handling the web server and routing.

Axios: Used to "push" messages back to the user via Meta's Graph API.

WhatsApp Business API: The communication layer.

🤖 The Booking Flow
The bot operates like a "State Machine," moving the user through these specific steps:

Welcome: Initial greeting and opt-in.

Identity: Collects First Name, Surname, and ID/Passport number.

Safety: Records Next of Kin (NOK) contact details.

Logistics: Asks for the number of tickets and travel dates.

Routing: Provides a numbered menu for popular South African routes (Joburg, Durban, Cape Town).

Payment: Generates the final total and provides a checkout link.

🚀 Environment Variables
To get this running, you'll need to set up these keys in your .env file:

PHONE_NUMBER_ID: Found in your Meta Developer Dashboard.

WHATSAPP_TOKEN: Your Permanent Access Token from Meta.

📦 Getting Started
1. Install Dependencies
Bash
npm install express axios
2. Run the Server
Bash
node app.js
3. Set Up Webhook
You must expose your local server (using a tool like ngrok) and point your Meta Webhook URL to https://your-url.com/.

⚠️ Important Note
This version uses a temporary in-memory storage (userState). If you restart the server, any "in-progress" bookings will be lost.
