import express, { Express } from "express";
import { classesRoute } from "./routes/classes-routes";
import { commentsRoute } from "./routes/comments-routes";

const app: Express = express();
app.use(express.json());

const port = process.env.PORT;

app.use("/classes", classesRoute);
app.use("/comments", commentsRoute);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
