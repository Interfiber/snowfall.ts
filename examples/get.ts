import { SnowfallServer } from "../lib/snowfall.ts";

const app = new SnowfallServer({
    EnablePlugins: true,
    Port: 8090,
    UrlNotFoundMessage: "Yo dawg, that url does not exist!"
});
app.AddRoute("GET", "/", () => {
    return "Yo.";
});
app.StartHTTPServer();