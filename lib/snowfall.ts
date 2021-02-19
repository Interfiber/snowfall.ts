// Snowfall.ts - Copyright Interfiber 2021 Under the MIT License
import { serve } from "https://deno.land/std@0.88.0/http/server.ts";
import { walkSync } from "https://deno.land/std@0.88.0/fs/mod.ts";
const URLMethods = ["GET", "POST"];
let URLMethodSupported: any = null;
let OnRequestMethods = [{
    route: "/.snowfall/core/placeholder",
    method: "GET",
    callback: function (url: String){
        return "This URL is reserved by snowfall";
    }
}];
export class Response {
    url: String
    constructor(url: String){
        this.url = url
    }
    Send(responseText: String){
        console.log("LOG:: Sending Response Data to client");
    }
}
export class SnowfallServer {
    config: any
    constructor(config: any){
        console.log("LOG:: Created Snowfall Server");
        this.config = config;
    }
    AddRoute(method: string, route: string, callback: any){
        console.log(`LOG:: Adding Route with method ${method}`);
        // Check route type to make sure it is supported
        URLMethods.forEach((method_name) => {
            if (method_name == method){
                URLMethodSupported = true;
            }
        });
        if (URLMethodSupported == null){
            throw new Error(`The URL Method ${method} is not supported`);
        }
        OnRequestMethods.push({
            route: route,
            method: method,
            callback: callback
        });
        console.log("LOG:: Added Request to index");
    }
    async StartHTTPServer(){
        console.log("LOG:: Checking for Port...");
        if (this.config.Port == undefined){
            throw new Error("No Port given in Snowfall server config")
        }
        console.log("LOG:: Checking if plugins can be loaded.");
        if (this.config.EnablePlugins == false || this.config.EnablePlugins == undefined){
            console.log("LOG:: Plugins Not allowed to load");
        }
        console.log("LOG:: Http.serve({ port: this.config.Port })");
        const server = serve({ port: this.config.Port });
        console.log(`LOG:: Server Running at: http://localhost:${this.config.Port}`);
        console.log("LOG:: Waiting for requests...");
        for await (const req of server) {
            let route = req.url;
            let method = req.method;
            let FoundRequestFunction = false;
            let headers = req.headers;
            let encodedBody: Uint8Array = await Deno.readAll(req.body);
            let body = new TextDecoder("utf-8").decode(encodedBody);
            let RequestFunction: any = function (){
                return "URL not found";
            };
            console.log(`LOG:: Got Request on route ${route}`);
            console.log("LOG:: Searching Index for request...");
            OnRequestMethods.forEach(func => {
                if (func.route == route){
                    console.log("LOG:: Found Route for this URL");
                    FoundRequestFunction = true;
                    RequestFunction = func;
                }
            });
            if (FoundRequestFunction == false){
                console.log(`LOG:: Route '${route}' does not have a function. Sending 404`);
                if (this.config.UrlNotFoundMessage != undefined){
                    req.respond({ body: this.config.UrlNotFoundMessage });
                }else {
                    req.respond({ body: `Route not found ${route}` });
                }
            }else if (FoundRequestFunction == true && method == RequestFunction.method) {
                // Check Body Type
                if (method == "POST" && headers.get("content-type") != "application/json"){
                    console.log("LOG:: Request content-type is not supported!");
                    req.respond({ body: JSON.stringify({ message: "Only application/json is allowed", error: true }) })
                }else {
                    req.respond({ body: RequestFunction.callback(JSON.parse(body)) });
                }
            }else {
                console.log(`LOG:: Route '${route}' does not match the requirments.`);
                console.log(`LOG:: Method Expected: '${RequestFunction.method}'`);
                console.log(`LOG:: Method Got: '${method}'`);
                req.respond({ body: `Route '${route}' does not match the requirments.\nMethod Expected: '${RequestFunction.method}'\nMethod Got: '${method}'\nFound Route Method: ${FoundRequestFunction}` });
            }
        }
    }
}