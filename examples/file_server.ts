import { SnowfallServer } from "../lib/snowfall.ts";

let app = new SnowfallServer({
    Port: 8090,
    UrlNotFoundMessage: "🤷"
});