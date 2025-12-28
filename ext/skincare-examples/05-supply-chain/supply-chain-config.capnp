using Workerd = import "/workerd/workerd.capnp";
using SupplyChain = import "supply-chain.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ SupplyChain.extension ],
);

const worker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "supply-chain-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "supplyChain",
      wrapped = (
        moduleName = "supply-chain:binding",
        innerBindings = [
          ( name = "actors", json = embed "actors.json" ),
          ( name = "relationships", json = embed "relationships.json" )
        ],
      ))
  ],
);
