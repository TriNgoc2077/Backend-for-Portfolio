import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";
const app = express();
configDotenv();
const allowedOrigin = "https://caonguyentringoc.io.vn";

app.use(
	cors({
		origin: allowedOrigin,
		methods: ["POST"],
		credentials: true,
	})
);

app.use(express.json());

// Rate limiter middleware (e.g. 5 requests per minute per IP)
const contactFormLimiter = rateLimit({
	windowMs: 180 * 1000,
	max: 2,
	message: {
		message: "Too many requests. Please try again later.",
	},
});

app.post("/contact", contactFormLimiter, async (req, res) => {
	const { name, email, message } = req.body;

	if (!name || !email || !message) {
		return res.status(400).json({ message: "All fields are required." });
	}

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.USER,
			pass: process.env.PASSWORD,
		},
	});

	const mailOptions = {
		from: email,
		to: "caonguyentringoc@gmail.com",
		subject: `New message from Portfolio, Name: ${name}`,
		text: `Email: ${email}\n\nMessage:\n${message}`,
	};

	try {
		await transporter.sendMail(mailOptions);
		res.status(200).json({
			message: "Your message has been sent successfully. Thank you !",
		});
	} catch (error) {
		console.error("Error sending email:", error);
		res.status(500).json({
			message:
				"An error occurred while sending your message. Please try again later.",
		});
	}
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
