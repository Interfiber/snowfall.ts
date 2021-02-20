// Snowfall.ts - Copyright Interfiber 2021 Under the MIT License
import { serve } from "https://deno.land/std@0.88.0/http/server.ts";
const URLMethods = ["GET", "POST"];
let URLMethodSupported: any = null;
let OnRequestMethods = [{
    route: "/.snowfall/core/placeholder",
    method: "GET",
    callback: function (url: String){
        return "This URL is reserved by snowfall";
    }
}];
export class SnowfallServer {
    config: any
    constructor(config: any){
        console.log("LOG:: Created Snowfall Server");
        this.config = config;
    }
    /**
     * 
     * @param method {string} the method for the route(GET, or POST are supported)
     * @param route {string} the route to listen on(example: /)
     * @param callback {any} function to run when route is hit(any data returned as a string will be the response)
     */
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
            callback: callback,
        });
        console.log("LOG:: Added Request to index");
    }
    /**
     * Starts a http server and waits for incoming connections
     */
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
            let route = req.url.split("?");
            let method = req.method;
            let FoundRequestFunction = false;
            let headers = req.headers;
            let encodedBody: Uint8Array = await Deno.readAll(req.body);
            let body = new TextDecoder("utf-8").decode(encodedBody);
            let RequestFunction: any = function (){
                return "URL not found";
            };
            console.log(`LOG:: Got Request on route ${route[0]}`);
            console.log("LOG:: Searching Index for request...");
            OnRequestMethods.forEach(func => {
                if (func.route == route[0]){
                    console.log("LOG:: Found Route for this URL");
                    FoundRequestFunction = true;
                    RequestFunction = func;
                }
            });
            if (FoundRequestFunction == false){
                console.log(`LOG:: Route '${route[0]}' does not have a function. Sending 404`);
                if (this.config.UrlNotFoundMessage != undefined){
                    req.respond({ body: this.config.UrlNotFoundMessage });
                }else {
                    req.respond({ body: `Route not found ${route[0]}` });
                }
            }else if (FoundRequestFunction && method == RequestFunction.method) {
                // Check Body Type
                if (method == "POST" && headers.get("content-type") != "application/json"){
                    console.log("LOG:: Request content-type is not supported!");
                    req.respond({ body: JSON.stringify({ message: "Only application/json is allowed", error: true }) })
                }else {
                    if (method == "POST"){
                        req.respond({ body: RequestFunction.callback(JSON.parse(body)) });
                    }else {
                        if (req.url.includes("?")){
                            // Handle url params
                            console.log(route[0]);
                            let url_search_params = req.url.replace(/\?/g, "").replace(route[0].toString(), "");
                            console.log(url_search_params);
                            let url_params = new URLSearchParams(url_search_params);
                            req.respond({ body: RequestFunction.callback(url_params) });
                        }else {
                            req.respond({ body: RequestFunction.callback() });
                        }
                    }
                }
            }else {
                console.log(`LOG:: Route '${route[0]}' does not match the requirments.`);
                console.log(`LOG:: Method Expected: '${RequestFunction.method}'`);
                console.log(`LOG:: Method Got: '${method}'`);
                req.respond({ body: `Route '${route[0]}' does not match the requirments.\nMethod Expected: '${RequestFunction.method}'\nMethod Got: '${method}'\nFound Route Method: ${FoundRequestFunction}` });
            }
        }
    }
}