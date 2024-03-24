import Axios from "axios";
import pLimit from "p-limit";
import * as cache from "../cache/index";
import { logger } from "../logger";
import { getListCached } from "./list";

const showsLogger = logger.child({ module: "ShowsDetails" });


export interface SerializdShowDetails {
    showId: Number;
    seasonId: Number;
    dateAdded: Date;
}

export const getShowsDetailCached = async (
    slug: string,
    concurrencyLimit: number = 7,
    onDetail?: (show: number) => void,
    shouldCancel?: () => boolean
) => {
    const showDetails: SerializdShowDetails[] = await getListCached(slug);
    const showIds = [...new Set(showDetails.map((show) => show.showId))];

    const limit = pLimit(concurrencyLimit);
    const shows = await Promise.all(
        showIds.map(async (id) => {
            const detail = await limit(async () => {
                // Cancel running operations in case client connection closed.
                if (shouldCancel && shouldCancel()) {
                    return;
                }
                
                const slug = `https://api.themoviedb.org/3/tv/${id}/`

                try {
                    return await getCachedShowDetail(slug);
                } catch (e: any) {
                    showsLogger.error(`Error fetching '${slug}'.`);
                }
            });

            if (onDetail && detail) {
                onDetail(detail);
            }

            return detail;
        })
    );

    return shows.filter((show): show is number => !!show);
};

export const getShowDetail = async (slug: String): Promise<number| undefined> => {
    let detail = undefined;

    const options = {
        method: 'GET',
        url: `${slug}external_ids?api_key=${process.env.TMDB_API_KEY}`,
    };
  
    await Axios
        .request(options)
        .then(function (response) {
            showsLogger.debug(`Successfully found show: ${response.data.tvdb_id} from ${slug}`)
            detail = response.data.tvdb_id;
        })
        .catch(function (error: Error) {
            console.error(error);
        });

    return detail;
};

export const getCachedShowDetail = async (slug: string): Promise<number | undefined> => {
    if (await cache.has(slug)) {
        showsLogger.debug(`Fetched '${slug}' from redis.`);
        return await cache.get<number>(slug);
    }

    const data = await getShowDetail(slug);

    showsLogger.debug(`Fetched '${slug}' live.`);

    // We cache movies indefinitely, assuming they don't change.
    // Be sure to configure redis with a maxmemory and an eviction policy or this will eat all your RAM
    if (data) {
        await cache.set(slug, data);
    }

    return data;
};

