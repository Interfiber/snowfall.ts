import { SnowfallServer } from "../lib/snowfall.ts";

const app = new SnowfallServer({
    EnablePlugins: true,
    Port: 8090,
    UrlNotFoundMessage: "Yo dawg, that url does not exist!"
});
// Body MUST be assigned the type any!
// body is a string that can be parsed
app.AddRoute("POST", "/poster", (body: any) => {
    return `Hey, ${body.name}!`;
})
app.StartHTTPServer();
