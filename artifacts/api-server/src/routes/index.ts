import { Router, type IRouter } from "express";
import healthRouter from "./health";
import readingsRouter from "./readings";
import customDecksRouter from "./custom-decks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(readingsRouter);
router.use(customDecksRouter);

export default router;
