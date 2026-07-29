# AI Integration (Ling-3.0 Flash) Chatbot Guide
*Note: This configuration uses Node.js and a free OpenRouter key for school project purposes.*

---

## 🛠️ Step 1: Project Setup
Open your terminal (CMD or PowerShell) and run the following commands **one by one**:

\`\`\`cmd
mkdir my-chatbot

cd my-chatbot

npm init -y

npm install @openrouter/sdk
\`\`\`

> **Situational Fix:** If you run into a module error during installation, run this fix command, then re-install:
> \`\`\`cmd
> npm pkg set type="module"
> npm install @openrouter/sdk
> \`\`\`

---

## 💻 Step 2: Open in VS Code
1. Open **Visual Studio Code**.
2. Go to **File > Open Folder** and select your `my-chatbot` folder (e.g., `C:/Users/Administrator/my-chatbot`).
3. Create a file named **`bot.js`** inside the folder and paste your chatbot code.

---

## ▶️ Step 3: Run the Bot
Go back to your terminal, navigate to your project folder, and run your script:

\`\`\`cmd
cd my-chatbot
node bot.js
\`\`\`

---

## 🚀 Setting Up the Server (For Web Implementation)

If you want to connect your bot to a web frontend using a local server, follow these steps:

### 1. Install Express and CORS
In your terminal inside the `my-chatbot` folder, run:
\`\`\`cmd
npm install express cors
\`\`\`

### 2. Add `server.js`
Create a file named **`server.js`** in the same folder and paste your server code.

### 3. Start the Server
\`\`\`cmd
node server.js
\`\`\`

### 4. Test It
Open the `index.html` file in your browser to test out the chat interface!
