const WATCHLIST_REGEX = /^\/api\/user\/.*\/watchlist\//;

export const validateSlug = (slug: string): Boolean => {
    if (!WATCHLIST_REGEX.test(slug)) {
        throw new Error("Other lists are not supported.");
    }

    return true;
};
