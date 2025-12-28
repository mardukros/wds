using Workerd = import "/workerd/workerd.capnp";
using NNMrp = import "nn-mrp.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8082", http = (), service = "main" ) ],
  extensions = [ NNMrp.extension ],
);

const worker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "nn-mrp-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "neuralMRP",
      wrapped = (
        moduleName = "nn-mrp:binding",
        innerBindings = [
          ( name = "materials", json = embed "materials.json" ),
          ( name = "demand", json = embed "demand.json" )
        ],
      ))
  ],
);
