using Workerd = import "/workerd/workerd.capnp";
using NNCrm = import "nn-crm.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8081", http = (), service = "main" ) ],
  extensions = [ NNCrm.extension ],
);

const worker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "nn-crm-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "neuralCRM",
      wrapped = (
        moduleName = "nn-crm:binding",
        innerBindings = [
          ( name = "customers", json = embed "customers.json" ),
          ( name = "interactions", json = embed "interactions.json" )
        ],
      ))
  ],
);
