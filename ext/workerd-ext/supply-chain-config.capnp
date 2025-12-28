using Workerd = import "/workerd/workerd.capnp";
using SupplyChainExt = import "supply-chain.capnp";

const supplyChainExample :Workerd.Config = (
  services = [ (name = "main", worker = .supplyChainWorker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ SupplyChainExt.extension ],
);

const supplyChainWorker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "supply-chain-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "supplyChain",
      # wrapped bindings provide specialized API access to inner bindings
      wrapped = (
        moduleName = "supply-chain:binding",
        innerBindings = [
          ( name = "actors", json = embed "actors.json" ),
          ( name = "relationships", json = embed "relationships.json" )
        ],
      ))
  ],
);
