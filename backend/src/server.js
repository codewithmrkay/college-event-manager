import express from "express"
import "dotenv/config"
import connectDb from "./config/Db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import passport from "./config/passport.js"
import {authRoute} from "./routes/auth.routes.js"
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";
const app = express()
const port = process.env.PORT || 3000

//----------------------------------------- middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://chrome-web-store.vercel.app',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json())
app.use(passport.initialize());
app.use(express.urlencoded())
app.use(cookieParser())


app.use('/api/auth', authRoute)
app.use("/api/upload", uploadRoutes);
app.use("/api/user", userRoutes);

connectDb().then(() => {
    app.listen(port, () => {
        console.log(`visit : http://localhost:${port}`)
    })
})