
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>DevOps Word Counter</title>
            <style>
                body {
                    font-family: Arial;
                    background: #f4f6f9;
                    text-align: center;
                    padding: 50px;
                }
                textarea {
                    width: 80%;
                    height: 150px;
                    padding: 10px;
                }
                button {
                    padding: 10px 25px;
                    background: #007bff;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <h1>Jenkins + Amazon EKS Word Counter</h1>
            <p>My first CI/CD deployment project</p>

            <textarea id="text"
                placeholder="Enter your text here"></textarea>
            <br><br>

            <button onclick="countWords()">Count Words</button>

            <h2 id="result"></h2>

            <script>
                function countWords() {
                    const text = document.getElementById("text").value.trim();
                    const words = text ? text.split(/\\s+/).length : 0;

                    document.getElementById("result").innerHTML =
                        "Word Count: " + words;
                }
            </script>
        </body>
        </html>
    `);
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        application: "word-counter"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Word Counter running on port ${PORT}`);
});
