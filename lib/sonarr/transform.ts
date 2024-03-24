import { SonarrShowDetails } from "./types";

export const transformIdToSonarr = (id: number): SonarrShowDetails => {
    return {
        TvdbId: id,
    }
};
