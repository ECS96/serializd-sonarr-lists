import express from "express";
import { normalizeSlug } from "./lib/serializd/util";
import { transformIdToSonarr } from "./lib/sonarr/transform";
import { getShowsDetailCached } from "./lib/serializd/show-details";
import { sendChunkedJson } from "./lib/express/send-chunked-json";
import { validateSlug } from "./lib/serializd";
import { logger } from "./lib/logger";

const appLogger = logger.child({ module: "App" });

const PORT = process.env.PORT || 5000;

const app = express();
const server = app.listen(PORT, () =>
    appLogger.info(`Listening on port ${PORT}`)
);

server.keepAliveTimeout = 78;

app.get("/", (_, res) => res.send("Use serializd.com path as path here."));

app.get("/favicon.ico", (_, res) => res.status(404).send());

app.get(/(.*)/, async (req, res) => {
    const chunk = sendChunkedJson(res);

    // Abort fetching on client close
    let isConnectionOpen = true;
    let isFinished = false;
    req.connection.on("close", () => {
        isConnectionOpen = false;
        if (!isFinished) {
            appLogger.warn("Client closed connection before finish.");
        }
    });

    const slug = normalizeSlug(req.params[0]);

    try {
        validateSlug(slug);
    } catch (e: any) {
        isFinished = true;
        appLogger.error(`Failed to validate ${slug} - ${e.message}`);
        chunk.fail(404, e.message);
        return;
    }

    const onShowId = (showId: number) => {
        if (!showId) {
            return;
        }
        chunk.push(transformIdToSonarr(showId));
    };

    await getShowsDetailCached(
        slug,
        7,
        onShowId,
        () => !isConnectionOpen
    );

    isFinished = true;
    chunk.end();
});

process.on("unhandledRejection", (reason) => {
    throw reason;
});

process.on("uncaughtException", (error) => {
    appLogger.error("Uncaught Exception", error);
    process.exit(1);
});
