using Workerd = import "/workerd/workerd.capnp";
using Franchise = import "franchise.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ Franchise.extension ],
);

const worker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "franchise-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "franchise",
      wrapped = (
        moduleName = "franchise:binding",
        innerBindings = [
          ( name = "locations", json = embed "locations.json" ),
          ( name = "formulations", json = embed "formulations.json" ),
          ( name = "procedures", json = embed "procedures.json" ),
          ( name = "relationships", json = embed "relationships.json" )
        ],
      ))
  ],
);
