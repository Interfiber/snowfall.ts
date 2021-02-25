# Snowfall.ts
Snowfall.ts is a modern http library for deno


## Installing
To install snowfall first create a deno project with a typescript file inside. Then paste the following import statment into the file
```typescript
import { SnowfallServer } from "https://deno.land/x/snowfall@v0.0.1/lib/snowfall.ts";
```

## Basic App
Heres some example code for a basic app
```typescript
import { SnowfallServer } from "https://deno.land/x/snowfall@v0.0.1/lib/snowfall.ts";
const app = new SnowfallServer({
    EnablePlugins: true,
    Port: 8090,
    UrlNotFoundMessage: "Yo dawg, that url does not exist!"
});
app.AddRoute("GET", "/", () => {
    return "Yo.";
});
app.StartHTTPServer();
```
Make sure to run this file with the ```--allow-net``` flag to allow it access to the network. Then go to ```http://localhost:8090``` and you should get Yo. On the screen!
