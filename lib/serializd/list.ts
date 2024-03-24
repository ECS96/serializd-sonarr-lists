
import Axios from "axios";
import {
    SERIALIZD_ORIGIN,
} from "./util";
import * as cache from "../cache/index";
import { SerializdShowDetails } from "./show-details";
import { logger } from "../logger";

const appLogger = logger.child({ module: "App" });

// Cache Lists for 30min
const LIST_CACHE_TIMEOUT = 30 * 60;

const getList = async (listSlug: String): Promise<SerializdShowDetails[] | undefined>  => {
    let lists = undefined;

    const options = {
        method: 'GET',
        url: `${SERIALIZD_ORIGIN}${listSlug}`,
    };
  
    await Axios
        .request(options)
        .then(function (response) {
            lists = response.data.watchlist;
            appLogger.debug(`Successfully pulled serializd watchlist from ${listSlug}`);
        })
        .catch(function (error: Error) {
            console.error(error);
            appLogger.error(error.message);
        });

    return lists;
}

export const getListCached = async (listSlug: string): Promise<SerializdShowDetails[]> => {
    const cached = await cache.get(listSlug);
    if (cached && Array.isArray(cached)) {
        appLogger.debug(`Fetched '${listSlug}' from redis.`);
        return cached;
    }
    if (cached !== undefined) {
        await cache.del(listSlug);
    }

    const shows = await getList(listSlug);

    if (shows) {
        await cache.set(listSlug, shows, LIST_CACHE_TIMEOUT);
    }

    return shows || [];
};
