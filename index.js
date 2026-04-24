const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const FULL_NAME = "vakula";
const ROLL_NUMBER = "AP23110010239";
const EMAIL = "your-email@example.com";

function buildConcatString(alphabets) {
  const chars = alphabets.join("").split("").reverse();
  return chars
    .map((ch, i) => (i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase()))
    .join("");
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "bfhl-api" });
});

app.get("/bfhl", (req, res) => {
  res.status(200).json({
    is_success: true,
    message: "Use POST /bfhl with JSON body: { \"data\": [...] }"
  });
});

app.post("/bfhl", (req, res) => {
  try {
    const data = req.body?.data;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        message: "Invalid input. 'data' must be an array."
      });
    }

    const odd_numbers = [];
    const even_numbers = [];
    const alphabets = [];
    const special_characters = [];
    let total = 0;

    for (const item of data) {
      const value = String(item);

      if (/^-?\d+$/.test(value)) {
        const num = parseInt(value, 10);
        total += num;

        if (Math.abs(num) % 2 === 0) {
          even_numbers.push(value);
        } else {
          odd_numbers.push(value);
        }
      } else if (/^[a-zA-Z]+$/.test(value)) {
        alphabets.push(value.toUpperCase());
      } else if (/^[^a-zA-Z0-9]+$/.test(value)) {
        special_characters.push(value);
      } else {
        const alphaChars = value.match(/[a-zA-Z]/g);
        if (alphaChars) {
          alphabets.push(alphaChars.join("").toUpperCase());
        }

        const specialChars = value.match(/[^a-zA-Z0-9]/g);
        if (specialChars) {
          special_characters.push(...specialChars);
        }

        const nums = value.match(/-?\d+/g);
        if (nums) {
          for (const n of nums) {
            const parsed = parseInt(n, 10);
            total += parsed;
            if (Math.abs(parsed) % 2 === 0) {
              even_numbers.push(n);
            } else {
              odd_numbers.push(n);
            }
          }
        }
      }
    }

    const response = {
      is_success: true,
      user_id: `${FULL_NAME.toLowerCase()}_${ROLL_NUMBER.toLowerCase()}`,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: String(total),
      concat_string: buildConcatString(alphabets)
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      is_success: false,
      message: "Server error",
      error: error.message
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
