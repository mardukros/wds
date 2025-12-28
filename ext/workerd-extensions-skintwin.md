Workerd Extension Example and Skincare Brand Analogy
How the Burrito Shop Example Works
Structure and Modules
The burrito‑shop example uses workerd extensions to organise user‑facing code, internal logic and bindings. The Cap’n Proto configuration (burrito-shop.capnp) declares an extension that embeds four JavaScript modules:
Module name	Description
burrito-shop:burrito-shop	Public API module that can be imported by the Worker. It re‑exports the BurritoShop class from an internal module.
burrito-shop-internal:burrito-shop-impl	Internal module defining the BurritoShop class. It hides implementation details (e.g., how burritos are created).
burrito-shop-internal:kitchen	Internal helper module defining makeBurritoImpl() and a Burrito class. It encapsulates pricing logic and ingredient handling.
burrito-shop:binding	Binding module that creates a BurritoShop instance using environment data (the recipes). Only internal modules can be used for bindings.
The burrito-shop.js module simply imports and re‑exports BurritoShop from the internal burrito-shop-impl module. This keeps the public API small while hiding the implementation details. The internal modules cannot be imported directly by user code, protecting proprietary logic.
Environment Binding and Capability‑Based Design
The configuration file (config.capnp) attaches the extension to a service and defines a worker. The worker receives an environment binding named shop that wraps the burrito-shop:binding module. During deployment, a JSON file (recipes.json) is embedded as the recipes inner binding. When the binding module runs, it constructs a BurritoShop instance using the recipes.
At runtime, when the worker handles a request, it can either:
1.	Use the public API directly: Import BurritoShop from burrito-shop:burrito-shop and instantiate it with recipes supplied in the code. This is shown when the request includes an X‑Use‑Direct‑Api header.
2.	Use the environment binding: Access env.shop, which is a live object bound to the BurritoShop instance created by the binding module. The worker calls env.shop.makeBurrito(type).price() to compute a price.
This pattern reflects Cloudflare’s binding model, where environment variables can contain full‑fledged objects rather than simple strings. The env object binds names to resources configured at deploy time. Because the binding is configured externally, the worker code does not need to know secrets or connection details. The Cloudflare team explains that bindings “contain full‑fledged objects” and are configured to point to specific resources; this design reduces boilerplate and improves security[1].
Notably, using an environment binding rather than global fetch prevents Server‑Side Request Forgery (SSRF), because the global fetch() is restricted to publicly routable URLs and internal services are accessed only through explicit bindings[2]. This capability‑based model forces the developer to declare which services a worker can talk to and prevents accidental access to unconfigured internal endpoints.
Worker Logic
The worker is defined in worker.js. Its fetch handler reads the request body to determine the burrito type. It then either creates a BurritoShop with a hard‑coded recipes object (for direct API use) or uses the environment binding (env.shop) to make a burrito. The BurritoShop class checks whether the requested type exists in its recipe map; if so, it calls makeBurritoImpl from the kitchen module, which returns a Burrito object. The price() method in Burrito sums ingredient prices from a predefined price table.
In summary, the burrito‑shop example demonstrates:
•	Separation of user‑facing and internal logic via modules: public modules re‑export internal implementations, and internal modules cannot be imported directly by user code.
•	Bindings as environment variables: the worker receives a pre‑initialised service object through env.shop. Cloudflare describes bindings as objects that eliminate boilerplate and enhance security[1].
•	Capability‑based configuration: the JSON file for recipes is provided as a configuration; the worker cannot access other resources unless explicitly bound.
Designing a Skincare Brand Extension
Now imagine a more complex business: a skincare brand with multiple treatment salons (services) and a production plant for skincare products. This scenario can be modelled with workerd extensions using a similar pattern.
Modules and Internal Structure
You could define a new extension skincare-brand.capnp that embeds several modules:
Module name	Purpose
skincare-brand:salon	Public API for treatment salons (services). Defines a Salon class with methods such as performProcedure(procedureName) to compute costs or durations for treatments.
skincare-brand-internal:salon-impl	Internal implementation of salon logic. Validates that a procedure is allowed at a given salon and delegates to helper modules.
skincare-brand-internal:plant	Internal module representing the production plant. Provides a ProductPlant class that can formulate products based on ingredient lists and compute production costs.
skincare-brand-internal:formulations	Defines product formulations (e.g., moisturiser, serum) and helper functions.
skincare-brand-internal:procedures	Contains treatment procedures for each salon (e.g., facial, chemical peel, massage) with ingredient lists and step‑by‑step instructions.
skincare-brand:binding	Binding module that takes environment data (formulations and procedures) and constructs one or more Salon instances and a ProductPlant instance. It returns an object like {salons: Map<string, Salon>, plant: ProductPlant}.
By marking plant, formulations and procedures modules as internal, they cannot be imported directly by user code, protecting proprietary recipes and manufacturing details.
Configuration and Bindings
The Cap’n Proto configuration (config.capnp) would define a service with multiple environment bindings:
using Workerd = import "/workerd/workerd.capnp";
using SkincareBrand = import "skincare-brand.capnp";

const skincareService :Workerd.Config = (
  services = [ (name = "main", worker = .mainWorker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ SkincareBrand.extension ],
);

const mainWorker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "worker.js") ],
  compatibilityDate = "2025-10-01",
  bindings = [
    ( name = "brand",
      wrapped = (
        moduleName = "skincare-brand:binding",
        innerBindings = [
          ( name = "formulations", json = embed "formulations.json" ),
          ( name = "procedures",   json = embed "procedures.json" )
        ],
      )
    )
  ],
);
The JSON files formulations.json and procedures.json would define formulations for each product and procedures for each salon. For example:
// formulations.json
{
  "moisturiser": ["water", "glycerin", "essential_oils"],
  "serum": ["vitamin_c", "aloe", "hyaluronic_acid"]
}

// procedures.json
{
  "salonA": {
    "facial": {"steps": ["cleanse", "exfoliate", "massage"], "duration": 45},
    "chemical_peel": {"steps": ["cleanse", "apply_peel", "neutralise"], "duration": 60}
  },
  "salonB": {
    "facial": {"steps": ["cleanse", "steam", "massage"], "duration": 50},
    "massage": {"steps": ["prepare", "massage", "hydrate"], "duration": 40}
  },
  "salonC": { ... }
}
Worker Logic for Skincare
The worker (worker.js) could handle requests to different endpoints:
•	/service – Accepts a body specifying a salon name and procedure. It uses env.brand.salons.get(name).performProcedure(procedure) to calculate cost and generate a description.
•	/product – Accepts a body specifying a product name. It calls env.brand.plant.formulate(productName) to obtain the list of ingredients and cost.
Because the binding module returns live objects (salons and plant), the worker does not need to import the underlying implementation. It simply calls methods on the bound objects. This matches Cloudflare’s description of environment bindings containing full‑fledged objects[1].
Comparison with the Burrito Shop Example
Aspect	Burrito Shop Example	Skincare Brand Analogy
Services	A single burrito shop represented by a BurritoShop class.	Multiple treatment salons represented by Salon instances; stored in a map in the binding.
Production	A single “kitchen” internal module that produces burritos based on a recipe.	A production plant module that formulates products using ingredient formulations. Internal modules handle formulation logic.
Data/Recipes	JSON file (recipes.json) contains ingredient lists for each burrito type.	Separate JSON files for product formulations and procedures per salon; procedures include durations and step sequences.
Binding	Binding module burrito-shop:binding creates a BurritoShop instance using recipes from config.	Binding module skincare-brand:binding constructs multiple Salon objects and a ProductPlant using formulations and procedures from config.
Request handling	Worker accepts a burrito type and returns its price via env.shop.makeBurrito(type).price().	Worker routes requests to /service or /product; it calls methods on the appropriate salon or plant binding to compute treatment durations/costs or product formulations.
Complexity	Only one service and one production module; recipes and pricing are simple.	Multiple salons with different procedures and one plant; more data files and logic to manage different treatments and products. The worker must route to the correct salon or plant.
Discussion
Both examples demonstrate how workerd encourages modular, capability‑based design:
•	Modules separate concerns and hide internal logic. User‑facing modules re‑export classes from internal modules, while implementation details remain inaccessible to user code.
•	Bindings provide live objects configured at deployment time and bound to environment variables. This eliminates the need to embed secrets in code and prevents SSRF attacks by restricting access to internal services[2].
•	Configuration files embed code and data (JSON) into the runtime and declare bindings explicitly. The worker cannot access any resource that is not declared in the configuration, enforcing the principle of least privilege.
The skincare brand example simply scales up the pattern: instead of one shop and one kitchen, we have multiple services and a production plant. Each service and product is configured separately, but the overall structure—internal modules, binding module, and worker—is identical. The approach keeps the codebase organised, hides proprietary formulas, and allows the operator to configure new products or services by editing JSON files and configuration without changing user‑facing code.
________________________________________
[1] Why Workers environment variables contain live objects
https://blog.cloudflare.com/workers-environment-live-object-bindings/
[2] Introducing workerd: the Open Source Workers runtime
https://blog.cloudflare.com/workerd-open-source-workers-runtime/
