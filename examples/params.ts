import { SnowfallServer } from "../lib/snowfall.ts";

const app = new SnowfallServer({
    Port: 8090,
    UrlNotFoundMessage: "That URL does not exist!"
});
app.AddRoute("GET", "/hello", (params: URLSearchParams) => {
    // Make sure to include the ? marks
    return `Hello, ${params?.get("name")?.toString()}`;
})
app.StartHTTPServer();