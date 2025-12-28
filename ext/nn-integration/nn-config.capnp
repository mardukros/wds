using Workerd = import "/workerd/workerd.capnp";
using NNIntegration = import "nn-integration.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ NNIntegration.extension ],
);

const worker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "nn-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "neuralSupplyChain",
      wrapped = (
        moduleName = "nn-integration:binding",
        innerBindings = [
          ( name = "actors", json = embed "actors.json" ),
          ( name = "relationships", json = embed "relationships.json" ),
          ( name = "embeddingDimension", json = "128" )
        ],
      ))
  ],
);
